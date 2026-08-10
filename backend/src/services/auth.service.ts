import { db } from '../db/database.js';
import { User, Role, Customer, CustomerType } from '../types/index.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateToken } from '../utils/jwt.js';
import { AppError } from '../middleware/error.js';
import { logAudit } from '../middleware/audit.js';

export class AuthService {
  static async login(email: string, password?: string, roleOverride?: Role) {
    const users = db.get('users');
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

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

    const assignedRole: Role = (data.role && ['ADMIN', 'WAREHOUSE', 'TECHNICIAN', 'CUSTOMER'].includes(data.role))
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

    const validatedCustomerType = (data.customerType as CustomerType) || 'RETAIL';

    // If role is CUSTOMER, create customer CRM profile
    if (assignedRole === 'CUSTOMER') {
      const customers = db.get('customers');
      const customerId = `CUST-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const newCustomer: Customer = {
        id: customerId,
        userId,
        name: data.name,
        businessName: data.businessName || '',
        email: data.email,
        phone: data.phone || '',
        gstNumber: data.gstNumber || '',
        customerType: validatedCustomerType,
        status: 'ACTIVE',
        notes: `New ${validatedCustomerType} account registered via website portal.`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      customers.unshift(newCustomer);
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
    const users = db.get('users');
    const user = users.find((u) => u.id === userId);
    if (!user) {
      throw new AppError('User not found.', 404);
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
    const userIndex = users.findIndex((u) => u.id === userId);
    if (userIndex === -1) {
      throw new AppError('User not found.', 404);
    }

    const user = users[userIndex];
    if (updates.name) user.name = updates.name.trim();
    if (updates.phone) user.phone = updates.phone.trim();
    user.updatedAt = new Date().toISOString();
    users[userIndex] = user;

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
