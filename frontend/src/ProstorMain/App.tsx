import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Header from './Header';
import ProductGrid from './ProductGrid';

// Buyer
import AuthPageBuyer from '../pages/Buyer/AuthPageBuyer'; 
import MainPageBuyer from '../pages/Buyer/MainPageBuyer';

// Manager
import AuthPageManager from '../pages/Manager/AuthPageManager';
import Warehouse from '../pages/Manager/WarehousePage';

// Seller
import Authorizationseller from '../pages/Seller/AuthSeller';
import SellerEntrance from '../pages/Seller/RegistrSeller'; 
import PersonalSeller from '../pages/Seller/PersonalSeller';
import AddingProducts from '../pages/Seller/AddProducts';
import ProductSeller from '../pages/Seller/ProductSeller';
import OrdersSeller from '../pages/Seller/OrdersSeller';
import MainSeller from "../pages/Seller/MainSeller";

// Admin
import AuthorizationAdmin from '../pages/Admin/AuthAdmin'; // ✅ ДОБАВИЛИ
import Admin from '../pages/Admin/AdminPage';
import UsersAdmin from '../pages/Admin/UsersAdmin';
import ProductAdmin from '../pages/Admin/ProductAdmin';
import RegistrAdmin from '../pages/Admin/RegistrAdmin';

// ==================== PROTECTED ROUTES ====================

// Warehouse
const PrivateWarehouseRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('token');
  const userRole = sessionStorage.getItem('userRole');

  if (!token || userRole !== 'warehouse_manager') {
    return <Navigate to="/warehouse/auth" replace />;
  }

  return <>{children}</>;
};

const RedirectIfAuthenticated: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('token');
  const userRole = sessionStorage.getItem('userRole');

  if (token && userRole === 'warehouse_manager') {
    return <Navigate to="/warehouse/dashboard" replace />;
  }

  return <>{children}</>;
};

// Buyer
const PrivateBuyerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('token');
  const userRole = sessionStorage.getItem('userRole');

  if (!token || userRole !== 'customer') {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

const RedirectBuyerIfAuthenticated: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('token');
  const userRole = sessionStorage.getItem('userRole');

  if (token && userRole === 'customer') {
    return <Navigate to="/buyer" replace />;
  }

  return <>{children}</>;
};

// Seller
const PrivateSellerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('token');
  const userRole = sessionStorage.getItem('userRole');

  if (!token || userRole !== 'seller') {
    return <Navigate to="/seller/auth" replace />;
  }

  return <>{children}</>;
};

const RedirectSellerIfAuthenticated: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('token');
  const userRole = sessionStorage.getItem('userRole');

  if (token && userRole === 'seller') {
    return <Navigate to="/seller/dashboard" replace />;
  }

  return <>{children}</>;
};

// ✅ ADMIN
const PrivateAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('token');
  const userRole = sessionStorage.getItem('userRole');

  if (!token || userRole !== 'admin') {
    return <Navigate to="/admin/auth" replace />; // ✅ исправили
  }

  return <>{children}</>;
};

const RedirectAdminIfAuthenticated: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('token');
  const userRole = sessionStorage.getItem('userRole');

  if (token && userRole === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
};

// ==================== APP ====================

const AppContent: React.FC = () => {
  return (
    <Routes>

      {/* Главная */}
      <Route path="/" element={
        (() => {
          const token = localStorage.getItem('token');
          const userRole = sessionStorage.getItem('userRole');

          if (token && userRole === 'customer') {
            return <Navigate to="/buyer" replace />;
          }
          if (token && userRole === 'warehouse_manager') {
            return <Navigate to="/warehouse/dashboard" replace />;
          }
          if (token && userRole === 'seller') {
            return <Navigate to="/seller/dashboard" replace />;
          }
          if (token && userRole === 'admin') {
            return <Navigate to="/admin" replace />;
          }

          return (
            <>
              <Header />
              <main className="main-content">
                <ProductGrid />
              </main>
            </>
          );
        })()
      } />

      {/* BUYER */}
      <Route path="/auth" element={
        <RedirectBuyerIfAuthenticated>
          <AuthPageBuyer />
        </RedirectBuyerIfAuthenticated>
      } />

      <Route path="/buyer" element={
        <PrivateBuyerRoute>
          <MainPageBuyer />
        </PrivateBuyerRoute>
      } />

      {/* SELLER */}
      <Route path="/seller/start" element={<MainSeller />} />

      <Route path="/seller/auth" element={
        <RedirectSellerIfAuthenticated>
          <Authorizationseller />
        </RedirectSellerIfAuthenticated>
      } />

      <Route path="/seller/register" element={<SellerEntrance />} />

      <Route path="/seller/dashboard" element={
        <PrivateSellerRoute>
          <PersonalSeller />
        </PrivateSellerRoute>
      } />

      <Route path="/seller/add-products" element={
        <PrivateSellerRoute>
          <AddingProducts />
        </PrivateSellerRoute>
      } />

      <Route path="/seller/products" element={
        <PrivateSellerRoute>
          <ProductSeller />
        </PrivateSellerRoute>
      } />

      <Route path="/seller/orders" element={
        <PrivateSellerRoute>
          <OrdersSeller />
        </PrivateSellerRoute>
      } />

      <Route path="/seller" element={<Navigate to="/seller/auth" replace />} />

      {/* WAREHOUSE */}
      <Route path="/warehouse">
        <Route 
          path="auth" 
          element={
            <RedirectIfAuthenticated>
              <AuthPageManager />
            </RedirectIfAuthenticated>
          } 
        />

        <Route 
          path="dashboard" 
          element={
            <PrivateWarehouseRoute>
              <Warehouse />
            </PrivateWarehouseRoute>
          } 
        />

        <Route path="" element={<Navigate to="/warehouse/auth" replace />} />
      </Route>

      {/* ==================== ADMIN ==================== */}

      {/* 🔐 Авторизация */}
      <Route path="/admin/auth" element={
        <RedirectAdminIfAuthenticated>
          <AuthorizationAdmin />
        </RedirectAdminIfAuthenticated>
      } />

      {/* Регистрация */}
      <Route path="/admin/register" element={
        <RedirectAdminIfAuthenticated>
          <RegistrAdmin />
        </RedirectAdminIfAuthenticated>
      } />

      {/* Dashboard */}
      <Route path="/admin" element={
        <PrivateAdminRoute>
          <Admin />
        </PrivateAdminRoute>
      } />

      <Route path="/admin/users" element={
        <PrivateAdminRoute>
          <UsersAdmin onBack={() => {}} />
        </PrivateAdminRoute>
      } />

      <Route path="/admin/products" element={
        <PrivateAdminRoute>
          <ProductAdmin />
        </PrivateAdminRoute>
      } />

      {/* Redirects */}
      <Route path="/sklad" element={<Navigate to="/warehouse/dashboard" replace />} />
      <Route path="/warehouse-manager" element={<Navigate to="/warehouse/dashboard" replace />} />

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
};

function App() {
  return (
    <Router>
      <div className="app">
        <AppContent />
      </div>
    </Router>
  );
}

export default App;