import { db } from '../db/database.js';
import { User, Role, Customer, CustomerType } from '../types/index.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateToken } from '../utils/jwt.js';
import { AppError } from '../middleware/error.js';
import { logAudit } from '../middleware/audit.js';

import { seedDatabase } from '../db/seed.js';

export class AuthService {
  static async login(email: string, password?: string, roleOverride?: Role) {
    let users = db.get('users');

    const seedEmails = ['user@gmail.com', 'admin@solargrid.com', 'sales@solargrid.com', 'warehouse@solargrid.com', 'accounts@solargrid.com', 'tech@solargrid.com'];
    if (!users || users.length === 0 || (!users.some((u) => u.email.toLowerCase() === email.toLowerCase()) && seedEmails.includes(email.toLowerCase()))) {
      console.log(`[AUTH] Initializing/re-seeding database for login request (${email})...`);
      await seedDatabase();
      users = db.get('users');
    }

    let user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    // PostgreSQL Cloud Fallback Lookup
    if (!user && db.pgPool) {
      try {
        const res = await db.pgPool.query(
          'SELECT id, name, email, password_hash as "passwordHash", role, phone, avatar_url as "avatarUrl", created_at as "createdAt", updated_at as "updatedAt" FROM users WHERE LOWER(email) = LOWER($1)',
          [email]
        );
        if (res.rows && res.rows.length > 0) {
          user = res.rows[0];
          users.push(user!);
        }
      } catch (pgErr: any) {
        console.error('Error fetching user from PostgreSQL:', pgErr.message);
      }
    }

    if (!user) {
      throw new AppError('Invalid credentials.', 401);
    }

    if (password) {
      const isMatch = await comparePassword(password, user.passwordHash);
      if (!isMatch) {
        throw new AppError('Invalid credentials.', 401);
      }
    }

    const effectiveRole = roleOverride || user.role;
    const customers = db.get('customers');
    const customer = customers.find((c) => c.userId === user.id || c.email.toLowerCase() === user.email.toLowerCase());

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: effectiveRole,
      name: user.name,
    });

    logAudit(user.id, user.name, 'USER_LOGIN', 'User', user.id, { role: effectiveRole });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: effectiveRole,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        customerType: customer?.customerType || 'RETAIL',
        businessName: customer?.businessName || '',
        gstNumber: customer?.gstNumber || '',
      },
    };
  }

  static async register(data: { name: string; email: string; password: string; role?: Role; phone?: string; businessName?: string; customerType?: string; gstNumber?: string }) {
    if (!data.name || !data.email || !data.password) {
      throw new AppError('Name, email, and password are required.', 400);
    }

    const users = db.get('users');
    const emailExists = users.some((u) => u.email.toLowerCase() === data.email.toLowerCase());
    if (emailExists) {
      throw new AppError('An account with this email address already exists.', 409);
    }

    if (data.phone && data.phone.trim()) {
      const cleanPhone = data.phone.trim();
      const phoneExists = users.some((u) => u.phone && u.phone.trim() === cleanPhone);
      if (phoneExists) {
        throw new AppError('An account with this mobile number already exists.', 409);
      }
    }

    const passwordHash = await hashPassword(data.password);
    const userId = `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const assignedRole: Role = (data.role && ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS', 'TECHNICIAN', 'CUSTOMER'].includes(data.role))
      ? data.role
      : 'CUSTOMER';

    const newUser: User = {
      id: userId,
      name: data.name,
      email: data.email,
      passwordHash,
      role: assignedRole,
      phone: data.phone || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    users.unshift(newUser);

    // Persist to PostgreSQL Cloud
    if (db.pgPool) {
      try {
        await db.pgPool.query(
          `INSERT INTO users (id, name, email, password_hash, role, phone, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = EXCLUDED.role, name = EXCLUDED.name`,
          [newUser.id, newUser.name, newUser.email, newUser.passwordHash, newUser.role, newUser.phone || '', newUser.createdAt, newUser.updatedAt]
        );
      } catch (err: any) {
        console.warn('PostgreSQL Cloud register insert warning:', err.message);
      }
    }

    const customers = db.get('customers');
    const validatedCustomerType: CustomerType = (data.customerType && ['RETAIL', 'WHOLESALE', 'DISTRIBUTOR'].includes(data.customerType))
      ? (data.customerType as CustomerType)
      : 'RETAIL';

    // If role is CUSTOMER, create customer CRM profile
    if (assignedRole === 'CUSTOMER') {
      const newCustomer: Customer = {
        id: `CUST-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        userId: userId,
        name: data.name,
        businessName: data.businessName || '',
        email: data.email,
        phone: data.phone || '',
        gstNumber: data.gstNumber || '',
        customerType: validatedCustomerType,
        status: 'ACTIVE',
        notes: 'Self-registered customer account',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      customers.unshift(newCustomer);

      if (db.pgPool) {
        try {
          await db.pgPool.query(
            `INSERT INTO customers (id, user_id, name, business_name, email, phone, gst_number, customer_type, status, notes, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
            [newCustomer.id, newCustomer.userId, newCustomer.name, newCustomer.businessName || '', newCustomer.email, newCustomer.phone, newCustomer.gstNumber || '', newCustomer.customerType, newCustomer.status, newCustomer.notes, newCustomer.createdAt, newCustomer.updatedAt]
          );
        } catch (err: any) {
          console.warn('PostgreSQL Cloud customer insert warning:', err.message);
        }
      }
    }

    const token = generateToken({
      userId,
      email: newUser.email,
      role: assignedRole,
      name: newUser.name,
    });

    logAudit(userId, newUser.name, 'USER_REGISTER', 'User', userId, { role: assignedRole, customerType: validatedCustomerType });
    db.saveData();

    return {
      token,
      user: {
        id: userId,
        name: newUser.name,
        email: newUser.email,
        role: assignedRole,
        phone: newUser.phone,
        customerType: validatedCustomerType,
        businessName: data.businessName || '',
        gstNumber: data.gstNumber || '',
      },
    };
  }

  static async getProfile(userId: string) {
    let users = db.get('users');
    let user = users.find((u) => u.id === userId || u.email.toLowerCase() === userId.toLowerCase());

    if (!user && db.pgPool) {
      try {
        const res = await db.pgPool.query(
          'SELECT id, name, email, password_hash as "passwordHash", role, phone, avatar_url as "avatarUrl", created_at as "createdAt", updated_at as "updatedAt" FROM users WHERE id = $1 OR LOWER(email) = LOWER($1)',
          [userId]
        );
        if (res.rows && res.rows.length > 0) {
          user = res.rows[0];
          users.push(user!);
        }
      } catch (err: any) {
        console.error('Error fetching user profile from PG:', err.message);
      }
    }

    if (!user) {
      throw new AppError('User profile not found.', 404);
    }

    const customers = db.get('customers');
    const customer = customers.find((c) => c.userId === user.id || c.email.toLowerCase() === user.email.toLowerCase());
    const { passwordHash, ...safeUser } = user;

    return {
      ...safeUser,
      customerType: customer?.customerType || 'RETAIL',
      businessName: customer?.businessName || '',
      gstNumber: customer?.gstNumber || '',
    };
  }

  static async updateProfile(userId: string, updates: { name?: string; phone?: string; businessName?: string; gstNumber?: string }) {
    const users = db.get('users');
    let userIndex = users.findIndex((u) => u.id === userId);
    if (userIndex === -1 && db.pgPool) {
      try {
        const res = await db.pgPool.query(
          'SELECT id, name, email, password_hash as "passwordHash", role, phone, avatar_url as "avatarUrl", created_at as "createdAt", updated_at as "updatedAt" FROM users WHERE id = $1 OR LOWER(email) = LOWER($1)',
          [userId]
        );
        if (res.rows && res.rows.length > 0) {
          users.push(res.rows[0]);
          userIndex = users.length - 1;
        }
      } catch (err: any) {
        console.error('Error loading user for profile update:', err.message);
      }
    }

    if (userIndex === -1) {
      throw new AppError('User profile not found.', 404);
    }

    const user = users[userIndex];
    if (updates.name) user.name = updates.name.trim();
    if (updates.phone) user.phone = updates.phone.trim();
    user.updatedAt = new Date().toISOString();
    users[userIndex] = user;

    if (db.pgPool) {
      try {
        await db.pgPool.query(
          'UPDATE users SET name = $1, phone = $2, updated_at = $3 WHERE id = $4',
          [user.name, user.phone || '', user.updatedAt, user.id]
        );
      } catch (err: any) {
        console.warn('PostgreSQL Cloud profile update warning:', err.message);
      }
    }

    // Synchronize customer CRM record if present
    const customers = db.get('customers');
    const custIndex = customers.findIndex((c) => c.userId === userId || c.email.toLowerCase() === user.email.toLowerCase());
    if (custIndex !== -1) {
      const cust = customers[custIndex];
      if (updates.name) cust.name = updates.name.trim();
      if (updates.phone) cust.phone = updates.phone.trim();
      if (updates.businessName !== undefined) cust.businessName = updates.businessName.trim();
      if (updates.gstNumber !== undefined) cust.gstNumber = updates.gstNumber.trim();
      cust.updatedAt = new Date().toISOString();
      customers[custIndex] = cust;

      if (db.pgPool) {
        try {
          await db.pgPool.query(
            'UPDATE customers SET name = $1, phone = $2, business_name = $3, gst_number = $4, updated_at = $5 WHERE id = $6',
            [cust.name, cust.phone, cust.businessName || '', cust.gstNumber || '', cust.updatedAt, cust.id]
          );
        } catch (err: any) {
          console.warn('PostgreSQL Cloud customer update warning:', err.message);
        }
      }
    }

    logAudit(user.id, user.name, 'UPDATE_PROFILE', 'User', user.id, updates);
    db.saveData();

    const customer = customers.find((c) => c.userId === userId || c.email.toLowerCase() === user.email.toLowerCase());
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      customerType: customer?.customerType || 'RETAIL',
      businessName: customer?.businessName || '',
      gstNumber: customer?.gstNumber || '',
    };
  }
}
