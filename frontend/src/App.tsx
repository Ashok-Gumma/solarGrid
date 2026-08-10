import React, { useState } from 'react';
import { Route, Switch, Redirect } from 'wouter';
import { AuthProvider, useAuth } from './lib/auth-context';
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

function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cart, setCart] = useState<CartLine[]>([]);
  const { role } = useAuth();

  const handleAddToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
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
    setCart((prev) =>
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
    setCart((prev) => prev.filter((line) => line.product.id !== productId));
  };

  return (
    <div className="min-h-screen bg-[#f0f0f2]">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="md:pl-[250px]">
        <Topbar onMenuOpen={() => setSidebarOpen(true)} cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)} />
        <main className="mx-auto max-w-[1440px] px-4 py-6 md:px-8 md:py-8">
          <Switch>
            {/* Admin & Management */}
            <Route path="/admin">
              {() => (role === 'ADMIN' ? <OverviewPage /> : <Redirect to={role === 'WAREHOUSE' ? '/inventory' : role === 'TECHNICIAN' ? '/technician' : '/store'} />)}
            </Route>
            <Route path="/audit-logs">
              {() => (role === 'ADMIN' ? <AuditLogsPage /> : <Redirect to={role === 'WAREHOUSE' ? '/inventory' : role === 'TECHNICIAN' ? '/technician' : '/store'} />)}
            </Route>

            {/* Customers & CRM */}
            <Route path="/customers">
              {() => (role === 'ADMIN' ? <CustomersPage /> : <Redirect to={role === 'WAREHOUSE' ? '/inventory' : role === 'TECHNICIAN' ? '/technician' : '/store'} />)}
            </Route>
            <Route path="/customers/:id">
              {() => (role === 'ADMIN' ? <CustomerDetailPage /> : <Redirect to={role === 'WAREHOUSE' ? '/inventory' : role === 'TECHNICIAN' ? '/technician' : '/store'} />)}
            </Route>
            <Route path="/crm">
              {() => (role === 'ADMIN' ? <CustomersPage /> : <Redirect to={role === 'WAREHOUSE' ? '/inventory' : role === 'TECHNICIAN' ? '/technician' : '/store'} />)}
            </Route>

            {/* Product & Store */}
            <Route path="/store">
              {() => (role === 'CUSTOMER' ? <ProductCatalogPage onAddToCart={handleAddToCart} cartCount={cart.length} /> : <Redirect to={role === 'ADMIN' ? '/admin' : role === 'WAREHOUSE' ? '/inventory' : '/technician'} />)}
            </Route>
            <Route path="/products">
              {() => (role === 'CUSTOMER' ? <ProductCatalogPage onAddToCart={handleAddToCart} cartCount={cart.length} /> : <Redirect to={role === 'ADMIN' ? '/admin' : role === 'WAREHOUSE' ? '/inventory' : '/technician'} />)}
            </Route>
            <Route path="/products/:id">
              {() => <ProductDetailPage onAddToCart={handleAddToCart} />}
            </Route>
            <Route path="/wishlist">
              {() => (role === 'CUSTOMER' || role === 'ADMIN' ? <WishlistPage onAddToCart={handleAddToCart} /> : <Redirect to={role === 'WAREHOUSE' ? '/inventory' : '/technician'} />)}
            </Route>

            {/* Cart & Checkout */}
            <Route path="/cart">
              {() => (role === 'CUSTOMER' || role === 'ADMIN' ? <CartPage cart={cart} onUpdateQty={handleUpdateCartQty} onRemove={handleRemoveFromCart} /> : <Redirect to={role === 'WAREHOUSE' ? '/inventory' : '/technician'} />)}
            </Route>
            <Route path="/checkout">
              {() => (role === 'CUSTOMER' || role === 'ADMIN' ? <CheckoutPage cart={cart} onClearCart={() => setCart([])} /> : <Redirect to={role === 'WAREHOUSE' ? '/inventory' : '/technician'} />)}
            </Route>

            {/* Customer Self-Service & Profile */}
            <Route path="/my-orders" component={MyOrdersPage} />
            <Route path="/my-warranties" component={MyWarrantiesPage} />
            <Route path="/book-service" component={BookServicePage} />
            <Route path="/profile" component={ProfilePage} />
            <Route path="/my-profile" component={ProfilePage} />

            {/* Warehouse Operations */}
            <Route path="/inventory">
              {() => (role === 'ADMIN' || role === 'WAREHOUSE' ? <InventoryPage /> : <Redirect to={role === 'TECHNICIAN' ? '/technician' : '/store'} />)}
            </Route>
            <Route path="/stock-movements">
              {() => (role === 'ADMIN' || role === 'WAREHOUSE' ? <StockMovementsPage /> : <Redirect to={role === 'TECHNICIAN' ? '/technician' : '/store'} />)}
            </Route>

            {/* Sales Challans & Orders */}
            <Route path="/challans">
              {() => (role === 'ADMIN' || role === 'WAREHOUSE' ? <ChallansPage /> : <Redirect to={role === 'TECHNICIAN' ? '/technician' : '/store'} />)}
            </Route>
            <Route path="/orders">
              {() => (role === 'ADMIN' || role === 'WAREHOUSE' ? <AdminOrdersPage /> : <MyOrdersPage />)}
            </Route>

            {/* Technician Field Operations */}
            <Route path="/technician">
              {() => (role === 'ADMIN' || role === 'TECHNICIAN' ? <TechnicianDashboard /> : <Redirect to={role === 'WAREHOUSE' ? '/inventory' : '/store'} />)}
            </Route>
            <Route path="/installations">
              {() => (role === 'ADMIN' || role === 'TECHNICIAN' ? <InstallationsPage /> : <Redirect to={role === 'WAREHOUSE' ? '/inventory' : '/store'} />)}
            </Route>
            <Route path="/services">
              {() => (role === 'ADMIN' || role === 'TECHNICIAN' ? <ServiceRepairPage /> : <Redirect to={role === 'WAREHOUSE' ? '/inventory' : '/store'} />)}
            </Route>

            {/* Default Catch-all */}
            <Route>
              {() => <Redirect to={role === 'ADMIN' ? '/admin' : role === 'WAREHOUSE' ? '/inventory' : role === 'TECHNICIAN' ? '/technician' : '/store'} />}
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
