import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import styles from './App.module.css';
import HeaderMain from './components/HeaderMain';
import ProductGrid from './components/ProductGrid';
import AuthPageBuyer from './pages/Buyer/AuthPageBuyer'; 
import MainPageBuyer from './pages/Buyer/MainPageBuyer';
import ProfilePage from './pages/Buyer/AccountBuyer';
import OrdersPageBuyer from './pages/Buyer/OrdersPageBuyer';
import AuthPageManager from './pages/Manager/AuthPageManager';
import Warehouse from './pages/Manager/WarehousePage';
import Authorizationseller from './pages/Seller/AuthSeller';
import SellerEntrance from './pages/Seller/RegistrSeller'; 
import PersonalSeller from './pages/Seller/PersonalSeller';
import AddingProducts from './pages/Seller/AddProducts';
import ProductSeller from './pages/Seller/ProductSeller';
import OrdersSeller from './pages/Seller/OrdersSeller';

// Admin imports
import AuthorizationAdmin from './pages/Admin/AuthAdmin';
import Admin from './pages/Admin/AdminPage';
import UsersAdmin from './pages/Admin/UsersAdmin';
import ProductAdmin from './pages/Admin/ProductAdmin';
import RegistrAdmin from './pages/Admin/RegistrAdmin';

// ==================== КОМПОНЕНТЫ ДЛЯ ПОКУПАТЕЛЯ ====================

// Компонент для проверки авторизации покупателя
const PrivateBuyerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('token');
  const userRole = sessionStorage.getItem('userRole');
  
  if (!token || userRole !== 'customer') {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

// Компонент для перенаправления авторизованного покупателя
const RedirectBuyerIfAuthenticated: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('token');
  const userRole = sessionStorage.getItem('userRole');
  
  if (token && userRole === 'customer') {
    return <Navigate to="/buyer" replace />;
  }
  
  return <>{children}</>;
};

// Компонент для защиты маршрута профиля (требует авторизации покупателя)
const PrivateProfileRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('token');
  const userRole = sessionStorage.getItem('userRole');
  
  if (!token || userRole !== 'customer') {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

// ==================== КОМПОНЕНТЫ ДЛЯ ПРОДАВЦА ====================

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

// ==================== КОМПОНЕНТЫ ДЛЯ МЕНЕДЖЕРА СКЛАДА ====================

// Компонент для защиты маршрутов (только для авторизованных менеджеров)
const PrivateWarehouseRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('token');
  const userRole = sessionStorage.getItem('userRole');
  
  if (!token || userRole !== 'warehouse_manager') {
    return <Navigate to="/warehouse/auth" replace />;
  }
  
  return <>{children}</>;
};

// Компонент для проверки, авторизован ли менеджер
const RedirectIfAuthenticated: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('token');
  const userRole = sessionStorage.getItem('userRole');
  
  if (token && userRole === 'warehouse_manager') {
    return <Navigate to="/warehouse/dashboard" replace />;
  }
  
  return <>{children}</>;
};

// ==================== КОМПОНЕНТЫ ДЛЯ АДМИНИСТРАТОРА ====================

const PrivateAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('token');
  const userRole = sessionStorage.getItem('userRole');

  if (!token || userRole !== 'admin') {
    return <Navigate to="/admin/auth" replace />;
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

// Создадим компонент-обертку для обработки навигации
const AppContent: React.FC = () => {
  return (
    <Routes>
      {/* Главная страница (для покупателей) - проверка авторизации */}
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
              <HeaderMain variant="landing" />
              <main className={styles['main-content']}>
                <ProductGrid />
              </main>
            </>
          );
        })()
      } />
      
      {/* Страница авторизации покупателя */}
      <Route path="/auth" element={
        <RedirectBuyerIfAuthenticated>
          <AuthPageBuyer />
        </RedirectBuyerIfAuthenticated>
      } />
      
      {/* Страница покупателя после авторизации (главная страница покупателя) */}
      <Route path="/buyer" element={
        <PrivateBuyerRoute>
          <MainPageBuyer />
        </PrivateBuyerRoute>
      } />
      
      {/* Страница профиля покупателя */}
      <Route path="/profile" element={
        <PrivateProfileRoute>
          <ProfilePage />
        </PrivateProfileRoute>
      } />

      <Route path="/orders" element={
        <PrivateProfileRoute>
          <OrdersPageBuyer />
        </PrivateProfileRoute>
      } />
      
      {/* Маршруты для продавца */}
      <Route path="/seller">
        {/* <Route 
          path="start" 
          element={<MainSeller />}
        /> */}
        
        <Route 
          path="auth" 
          element={
            <RedirectSellerIfAuthenticated>
              <Authorizationseller />
            </RedirectSellerIfAuthenticated>
          } 
        />
        
        <Route 
          path="register" 
          element={
            <RedirectSellerIfAuthenticated>
              <SellerEntrance />
            </RedirectSellerIfAuthenticated>
          } 
        />
        
        <Route 
          path="dashboard" 
          element={
            <PrivateSellerRoute>
              <PersonalSeller />
            </PrivateSellerRoute>
          } 
        />
        
        <Route 
          path="products" 
          element={
            <PrivateSellerRoute>
              <ProductSeller />
            </PrivateSellerRoute>
          } 
        />
        
        <Route 
          path="add-products" 
          element={
            <PrivateSellerRoute>
              <AddingProducts />
            </PrivateSellerRoute>
          } 
        />
        
        <Route 
          path="orders" 
          element={
            <PrivateSellerRoute>
              <OrdersSeller />
            </PrivateSellerRoute>
          } 
        />
        
        <Route 
          path="" 
          element={
            <Navigate to="/seller/auth" replace />
          } 
        />
      </Route>
      
      {/* Маршруты для менеджера склада */}
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
        
        <Route 
          path="" 
          element={
            <Navigate to="/warehouse/auth" replace />
          } 
        />
      </Route>
      
      {/* ==================== МАРШРУТЫ ДЛЯ АДМИНИСТРАТОРА ==================== */}
      
      {/* Авторизация */}
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
      
      {/* Перенаправление для старых маршрутов */}
      <Route path="/sklad" element={<Navigate to="/warehouse/dashboard" replace />} />
      <Route path="/warehouse-manager" element={<Navigate to="/warehouse/dashboard" replace />} />
      
      {/* Обработка 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <div className={styles['app']}>
        <AppContent />
      </div>
    </Router>
  );
}

export default App;