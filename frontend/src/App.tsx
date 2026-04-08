// Главная страница неавторизованных пользователей для всех ролей
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import styles from './App.module.css';

// Общие компоненты
import HeaderMain from './components/HeaderMain';
import ProductGrid from './components/ProductGrid';

// Покупатель (Buyer)
import AuthPageBuyer from './pages/Buyer/AuthPageBuyer'; 
import MainPageBuyer from './pages/Buyer/MainPageBuyer';
import ProfilePage from './pages/Buyer/ProfileBuyer';
import OrdersPageBuyer from './pages/Buyer/OrdersPageBuyer';
import BasketBuyer from './pages/Buyer/BasketBuyer';
import OrderFormalizationBuyer from './pages/Buyer/OrderFormalizationBuyer'; 

// Менеджер склада (Manager)
import AuthPageManager from './pages/Manager/AuthPageManager';
import Warehouse from './pages/Manager/WarehousePage';

// Продавец (Seller)
import Authorizationseller from './pages/Seller/AuthSeller';
import SellerEntrance from './pages/Seller/RegistrSeller'; 
import PersonalSeller from './pages/Seller/PersonalSeller';
import AddingProducts from './pages/Seller/AddProducts';
import ProductSeller from './pages/Seller/ProductSeller';
import OrdersSeller from './pages/Seller/OrdersSeller';
import MainSeller from './pages/Seller/MainSeller';

// Администратор (Admin)
import AuthorizationAdmin from './pages/Admin/AuthAdmin';
import Admin from './pages/Admin/AdminPage';
import UsersAdmin from './pages/Admin/UsersAdmin';
import ProductAdmin from './pages/Admin/ProductAdmin';
import RegistrAdmin from './pages/Admin/RegistrAdmin';

// ==================== ЗАЩИТА МАРШРУТОВ - ПОКУПАТЕЛЬ ====================

// Проверка авторизации покупателя (приватный маршрут)
const PrivateBuyerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('token');
  const userRole = sessionStorage.getItem('userRole');
  
  if (!token || userRole !== 'customer') {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

// Перенаправление уже авторизованного покупателя на главную
const RedirectBuyerIfAuthenticated: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('token');
  const userRole = sessionStorage.getItem('userRole');
  
  if (token && userRole === 'customer') {
    return <Navigate to="/buyer" replace />;
  }
  
  return <>{children}</>;
};

// Специальная защита для профиля покупателя
const PrivateProfileRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('token');
  const userRole = sessionStorage.getItem('userRole');
  
  if (!token || userRole !== 'customer') {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

// ==================== ЗАЩИТА МАРШРУТОВ - ПРОДАВЕЦ ====================

// Проверка авторизации продавца
const PrivateSellerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('token');
  const userRole = sessionStorage.getItem('userRole');
  
  if (!token || userRole !== 'seller') {
    return <Navigate to="/seller/auth" replace />;
  }
  
  return <>{children}</>;
};

// Перенаправление уже авторизованного продавца
const RedirectSellerIfAuthenticated: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('token');
  const userRole = sessionStorage.getItem('userRole');
  
  if (token && userRole === 'seller') {
    return <Navigate to="/seller/dashboard" replace />;
  }
  
  return <>{children}</>;
};

// ==================== ЗАЩИТА МАРШРУТОВ - МЕНЕДЖЕР СКЛАДА ====================

// Проверка авторизации менеджера склада
const PrivateWarehouseRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('token');
  const userRole = sessionStorage.getItem('userRole');
  
  if (!token || userRole !== 'warehouse_manager') {
    return <Navigate to="/warehouse/auth" replace />;
  }
  
  return <>{children}</>;
};
// Перенаправление уже авторизованного менеджера
const RedirectIfAuthenticated: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('token');
  const userRole = sessionStorage.getItem('userRole');
  
  if (token && userRole === 'warehouse_manager') {
    return <Navigate to="/warehouse/dashboard" replace />;
  }
  
  return <>{children}</>;
};

// ==================== ЗАЩИТА МАРШРУТОВ - АДМИНИСТРАТОР ====================

// Проверка авторизации администратора
const PrivateAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('token');
  const userRole = sessionStorage.getItem('userRole');

  if (!token || userRole !== 'admin') {
    return <Navigate to="/admin/auth" replace />;
  }

  return <>{children}</>;
};

// Перенаправление уже авторизованного администратора
const RedirectAdminIfAuthenticated: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('token');
  const userRole = sessionStorage.getItem('userRole');

  if (token && userRole === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
};

// ==================== ОСНОВНОЙ КОМПОНЕНТ МАРШРУТИЗАЦИИ ====================

const AppContent: React.FC = () => {
  return (
    <Routes>
      
      {/* ==================== ГЛАВНАЯ СТРАНИЦА (ЛЕНДИНГ) ==================== */}
      
      <Route path="/" element={
        (() => {
          const token = localStorage.getItem('token');
          const userRole = sessionStorage.getItem('userRole');
          
          // Перенаправление по ролям
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
          
          // Неавторизованный пользователь видит лендинг
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
      
      {/* ==================== МАРШРУТЫ ПОКУПАТЕЛЯ ==================== */}
      
      {/* Страница входа/регистрации покупателя */}
      <Route path="/auth" element={
        <RedirectBuyerIfAuthenticated>
          <AuthPageBuyer />
        </RedirectBuyerIfAuthenticated>
      } />
      
      {/* Главная страница покупателя (после входа) */}
      <Route path="/buyer" element={
        <PrivateBuyerRoute>
          <MainPageBuyer />
        </PrivateBuyerRoute>
      } />
      
      {/* Профиль покупателя */}
      <Route path="/profile" element={
        <PrivateProfileRoute>
          <ProfilePage />
        </PrivateProfileRoute>
      } />

      {/* Заказы покупателя */}
      <Route path="/orders" element={
        <PrivateProfileRoute>
          <OrdersPageBuyer />
        </PrivateProfileRoute>
      } />
      
      {/* Корзина покупателя */}
      <Route path="/basket" element={
        <PrivateProfileRoute>
          <BasketBuyer />
        </PrivateProfileRoute>
      } />

      {/* Оформление заказа покупателя */}
      <Route path="/order-formalization" element={
        <PrivateProfileRoute>
          <OrderFormalizationBuyer />
        </PrivateProfileRoute>
      } />
      
      {/* ==================== МАРШРУТЫ ПРОДАВЦА ==================== */}
      
      <Route path="/seller">
        {/* Авторизация продавца */}
        <Route 
          path="auth" 
          element={
            <RedirectSellerIfAuthenticated>
              <Authorizationseller />
            </RedirectSellerIfAuthenticated>
          } 
        />
        
        {/* Регистрация продавца */}
        <Route 
          path="register" 
          element={
            <RedirectSellerIfAuthenticated>
              <SellerEntrance />
            </RedirectSellerIfAuthenticated>
          } 
        />

        {/* ГЛАВНАЯ СТРАНИЦА ПРОДАВЦА */}
        <Route 
          path="main" 
          element={
            <PrivateSellerRoute>
              <MainSeller />
            </PrivateSellerRoute>
          } 
        />
        
        {/* Личный кабинет / Дашборд продавца */}
        <Route 
          path="dashboard" 
          element={
            <PrivateSellerRoute>
              <PersonalSeller />
            </PrivateSellerRoute>
          } 
        />
        
        {/* Товары продавца */}
        <Route 
          path="products" 
          element={
            <PrivateSellerRoute>
              <ProductSeller />
            </PrivateSellerRoute>
          } 
        />
        
        {/* Добавление товаров */}
        <Route 
          path="add-products" 
          element={
            <PrivateSellerRoute>
              <AddingProducts />
            </PrivateSellerRoute>
          } 
        />
        
        {/* Заказы продавца */}
        <Route 
          path="orders" 
          element={
            <PrivateSellerRoute>
              <OrdersSeller />
            </PrivateSellerRoute>
          } 
        />
        
        {/* Перенаправление по умолчанию для /seller */}
        <Route 
          path="" 
          element={
            <Navigate to="/seller/auth" replace />
          } 
        />
      </Route>
      
      {/* ==================== МАРШРУТЫ МЕНЕДЖЕРА СКЛАДА ==================== */}
      
      <Route path="/warehouse">
        {/* Авторизация менеджера */}
        <Route 
          path="auth" 
          element={
            <RedirectIfAuthenticated>
              <AuthPageManager />
            </RedirectIfAuthenticated>
          } 
        />
        
        {/* Дашборд склада */}
        <Route 
          path="dashboard" 
          element={
            <PrivateWarehouseRoute>
              <Warehouse />
            </PrivateWarehouseRoute>
          } 
        />
        
        {/* Перенаправление по умолчанию */}
        <Route 
          path="" 
          element={
            <Navigate to="/warehouse/auth" replace />
          } 
        />
      </Route>
      
      {/* ==================== МАРШРУТЫ АДМИНИСТРАТОРА ==================== */}
      
      {/* Авторизация администратора */}
      <Route path="/admin/auth" element={
        <RedirectAdminIfAuthenticated>
          <AuthorizationAdmin />
        </RedirectAdminIfAuthenticated>
      } />

      {/* Регистрация администратора */}
      <Route path="/admin/register" element={
        <RedirectAdminIfAuthenticated>
          <RegistrAdmin />
        </RedirectAdminIfAuthenticated>
      } />

      {/* Главная панель администратора */}
      <Route path="/admin" element={
        <PrivateAdminRoute>
          <Admin />
        </PrivateAdminRoute>
      } />

      {/* Управление пользователями */}
      <Route path="/admin/users" element={
        <PrivateAdminRoute>
          <UsersAdmin onBack={() => {}} />
        </PrivateAdminRoute>
      } />
      
      {/* Управление товарами */}
      <Route path="/admin/products" element={
        <PrivateAdminRoute>
          <ProductAdmin />
        </PrivateAdminRoute>
      } />
      
      {/* ==================== ПЕРЕНАПРАВЛЕНИЯ И ОБРАБОТКА ОШИБОК ==================== */}
      
      {/* Перенаправления со старых маршрутов */}
      <Route path="/sklad" element={<Navigate to="/warehouse/dashboard" replace />} />
      <Route path="/warehouse-manager" element={<Navigate to="/warehouse/dashboard" replace />} />
      
      {/* Обработка 404 - все неизвестные маршруты на главную */}
      <Route path="*" element={<Navigate to="/" replace />} />
      
    </Routes>
  );
};

// ==================== ГЛАВНЫЙ КОМПОНЕНТ APP ====================

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