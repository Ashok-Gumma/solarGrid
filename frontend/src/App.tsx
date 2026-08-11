import React, { useState, useEffect } from 'react';
import { Route, Switch, Redirect } from 'wouter';
import { AuthProvider, useAuth, Role } from './lib/auth-context';
import { Sidebar } from './components/navigation/Sidebar';
import { Topbar } from './components/navigation/Topbar';
import { LandingPage } from './pages/public/LandingPage';
import { SigninPage } from './pages/auth/SigninPage';
import { SignupPage } from './pages/auth/SignupPage';
import { ProductCatalogPage } from './pages/customer/ProductCatalogPage';
import { CartPage, CartLine } from './pages/customer/CartPage';
import { CheckoutPage } from './pages/customer/CheckoutPage';
import { MyOrdersPage } from './pages/customer/MyOrdersPage';
import { MyWarrantiesPage } from './pages/customer/MyWarrantiesPage';
import { BookServicePage } from './pages/customer/BookServicePage';
import { OverviewPage } from './pages/admin/OverviewPage';
import { AuditLogsPage } from './pages/admin/AuditLogsPage';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { CustomersPage } from './pages/sales/CustomersPage';
import { CustomerDetailPage } from './pages/sales/CustomerDetailPage';
import { ChallansPage } from './pages/sales/ChallansPage';
import { InventoryPage } from './pages/warehouse/InventoryPage';
import { StockMovementsPage } from './pages/warehouse/StockMovementsPage';
import { TechnicianDashboard } from './pages/technician/TechnicianDashboard';
import { InstallationsPage } from './pages/technician/InstallationsPage';
import { ServiceRepairPage } from './pages/technician/ServiceRepairPage';
import { ProfilePage } from './pages/customer/ProfilePage';
import { ProductDetailPage } from './pages/customer/ProductDetailPage';
import { WishlistPage } from './pages/customer/WishlistPage';
import { Product } from './types';

function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles?: Role[];
}) {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-900 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    const roleDefaultRoutes: Record<Role, string> = {
      ADMIN: '/admin',
      SALES: '/customers',
      WAREHOUSE: '/inventory',
      ACCOUNTS: '/challans',
      TECHNICIAN: '/technician',
      CUSTOMER: '/store',
    };
    return <Redirect to={roleDefaultRoutes[role] || '/store'} />;
  }

  return <>{children}</>;
}

function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, role } = useAuth();

  const getStorageKey = () => (user ? `solargrid_cart_${user.id}` : 'solargrid_cart_guest');

  const [cart, setCart] = useState<CartLine[]>(() => {
    try {
      const key = user ? `solargrid_cart_${user.id}` : 'solargrid_cart_guest';
      return JSON.parse(localStorage.getItem(key) || '[]');
    } catch {
      return [];
    }
  });

  // Re-sync cart when active user changes (e.g. login/logout)
  useEffect(() => {
    try {
      const key = getStorageKey();
      const saved = JSON.parse(localStorage.getItem(key) || '[]');
      setCart(saved);
    } catch {
      setCart([]);
    }
  }, [user?.id]);

  // Persist cart changes
  const updateCartAndPersist = (newCart: CartLine[] | ((prev: CartLine[]) => CartLine[])) => {
    setCart((prev) => {
      const updated = typeof newCart === 'function' ? newCart(prev) : newCart;
      try {
        localStorage.setItem(getStorageKey(), JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to persist cart:', err);
      }
      return updated;
    });
  };

  const handleAddToCart = (product: Product, quantity = 1) => {
    updateCartAndPersist((prev) => {
      const existing = prev.find((line) => line.product.id === product.id);
      if (existing) {
        return prev.map((line) =>
          line.product.id === product.id ? { ...line, quantity: line.quantity + quantity } : line
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const handleUpdateCartQty = (productId: string, delta: number) => {
    updateCartAndPersist((prev) =>
      prev
        .map((line) =>
          line.product.id === productId
            ? { ...line, quantity: line.quantity + delta }
            : line
        )
        .filter((line) => line.quantity > 0)
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    updateCartAndPersist((prev) => prev.filter((line) => line.product.id !== productId));
  };

  return (
    <div className="min-h-screen bg-[#f0f0f2]">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="md:pl-[250px]">
        <Topbar onMenuOpen={() => setSidebarOpen(true)} cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)} />
        <main className="mx-auto max-w-[1440px] px-4 py-6 md:px-8 md:py-8">
          <Switch>
            {/* Public Catalog Routes */}
            <Route path="/store">
              {() => <ProductCatalogPage onAddToCart={handleAddToCart} cartCount={cart.length} />}
            </Route>
            <Route path="/products">
              {() => <ProductCatalogPage onAddToCart={handleAddToCart} cartCount={cart.length} />}
            </Route>
            <Route path="/products/:id">
              {() => <ProductDetailPage onAddToCart={handleAddToCart} />}
            </Route>

            {/* Admin System Oversight */}
            <Route path="/admin">
              {() => <ProtectedRoute allowedRoles={['ADMIN']}><OverviewPage /></ProtectedRoute>}
            </Route>
            <Route path="/audit-logs">
              {() => <ProtectedRoute allowedRoles={['ADMIN', 'ACCOUNTS']}><AuditLogsPage /></ProtectedRoute>}
            </Route>

            {/* Customers & CRM */}
            <Route path="/customers">
              {() => <ProtectedRoute allowedRoles={['ADMIN', 'SALES', 'ACCOUNTS']}><CustomersPage /></ProtectedRoute>}
            </Route>
            <Route path="/customers/:id">
              {() => <ProtectedRoute allowedRoles={['ADMIN', 'SALES', 'ACCOUNTS']}><CustomerDetailPage /></ProtectedRoute>}
            </Route>
            <Route path="/crm">
              {() => <ProtectedRoute allowedRoles={['ADMIN', 'SALES', 'ACCOUNTS']}><CustomersPage /></ProtectedRoute>}
            </Route>

            {/* Customer Store Actions & Services */}
            <Route path="/wishlist">
              {() => <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN', 'SALES']}><WishlistPage onAddToCart={handleAddToCart} /></ProtectedRoute>}
            </Route>
            <Route path="/cart">
              {() => <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN', 'SALES']}><CartPage cart={cart} onUpdateQty={handleUpdateCartQty} onRemove={handleRemoveFromCart} /></ProtectedRoute>}
            </Route>
            <Route path="/checkout">
              {() => <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN', 'SALES']}><CheckoutPage cart={cart} onClearCart={() => setCart([])} /></ProtectedRoute>}
            </Route>
            <Route path="/my-orders">
              {() => <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN']}><MyOrdersPage /></ProtectedRoute>}
            </Route>
            <Route path="/my-warranties">
              {() => <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN']}><MyWarrantiesPage /></ProtectedRoute>}
            </Route>
            <Route path="/book-service">
              {() => <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN']}><BookServicePage /></ProtectedRoute>}
            </Route>
            <Route path="/profile">
              {() => <ProtectedRoute><ProfilePage /></ProtectedRoute>}
            </Route>
            <Route path="/my-profile">
              {() => <ProtectedRoute><ProfilePage /></ProtectedRoute>}
            </Route>

            {/* Warehouse Operations */}
            <Route path="/inventory">
              {() => <ProtectedRoute allowedRoles={['ADMIN', 'WAREHOUSE']}><InventoryPage /></ProtectedRoute>}
            </Route>
            <Route path="/stock-movements">
              {() => <ProtectedRoute allowedRoles={['ADMIN', 'WAREHOUSE']}><StockMovementsPage /></ProtectedRoute>}
            </Route>

            {/* Sales Challans & Orders */}
            <Route path="/challans">
              {() => <ProtectedRoute allowedRoles={['ADMIN', 'SALES', 'ACCOUNTS', 'WAREHOUSE']}><ChallansPage /></ProtectedRoute>}
            </Route>
            <Route path="/orders">
              {() => <ProtectedRoute allowedRoles={['ADMIN', 'SALES', 'ACCOUNTS', 'WAREHOUSE']}><AdminOrdersPage /></ProtectedRoute>}
            </Route>

            {/* Technician Field Operations */}
            <Route path="/technician">
              {() => <ProtectedRoute allowedRoles={['ADMIN', 'TECHNICIAN']}><TechnicianDashboard /></ProtectedRoute>}
            </Route>
            <Route path="/installations">
              {() => <ProtectedRoute allowedRoles={['ADMIN', 'TECHNICIAN']}><InstallationsPage /></ProtectedRoute>}
            </Route>
            <Route path="/services">
              {() => <ProtectedRoute allowedRoles={['ADMIN', 'TECHNICIAN']}><ServiceRepairPage /></ProtectedRoute>}
            </Route>

            {/* Default Catch-all */}
            <Route>
              {() => {
                if (!user) return <Redirect to="/" />;
                return <Redirect to={
                  role === 'ADMIN' ? '/admin' :
                  role === 'SALES' ? '/customers' :
                  role === 'ACCOUNTS' ? '/challans' :
                  role === 'WAREHOUSE' ? '/inventory' :
                  role === 'TECHNICIAN' ? '/technician' : '/store'
                } />;
              }}
            </Route>
          </Switch>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Switch>
        <Route path="/" component={LandingPage} />
        <Route path="/login" component={SigninPage} />
        <Route path="/signin" component={SigninPage} />
        <Route path="/signup" component={SignupPage} />
        <Route path="/register" component={SignupPage} />
        <Route>{() => <MainLayout />}</Route>
      </Switch>
    </AuthProvider>
  );
}
