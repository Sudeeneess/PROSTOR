// Главная страница неавторизованных пользователей для всех ролей
import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from 'react-router-dom';
import styles from './App.module.css';

// Общие компоненты
import HeaderMain from './components/HeaderMain';
import ApiProductGrid from './components/ApiProductGrid';

// Покупатель (Buyer)
import AuthPageBuyer from './pages/Buyer/AuthPageBuyer'; 
import MainPageBuyer from './pages/Buyer/MainPageBuyer';
import ProfilePage from './pages/Buyer/ProfileBuyer';
import OrdersPageBuyer from './pages/Buyer/OrdersPageBuyer';
import BasketBuyer from './pages/Buyer/BasketBuyer';
import OrderFormalizationBuyer from './pages/Buyer/OrderFormalizationBuyer';
import ProductDetailPage from './pages/Buyer/ProductDetailPage';
import CatalogCategoryPage from './pages/Buyer/CatalogCategoryPage';
import CatalogRootPage from './pages/Buyer/CatalogRootPage'; 

// Менеджер склада 
import AuthPageManager from './pages/Manager/AuthPageManager';
import Warehouse from './pages/Manager/WarehousePage';

// Продавец 
import Authorizationseller from './pages/Seller/AuthSeller';
import SellerEntrance from './pages/Seller/RegistrSeller'; 
import PersonalSeller from './pages/Seller/PersonalSeller';
import ProductSeller from './pages/Seller/ProductSeller';
import OrdersSeller from './pages/Seller/OrdersSeller';
import MainSeller from './pages/Seller/MainSeller';

// Администратор 
import AuthorizationAdmin from './pages/Admin/AuthAdmin';
import Admin from './pages/Admin/AdminPage';
import UsersAdmin from './pages/Admin/UsersAdmin';
import ProductAdmin from './pages/Admin/ProductAdmin';
import RegistrAdmin from './pages/Admin/RegistrAdmin';
import { api } from './services/api';

// ЗАЩИТА МАРШРУТОВ - ПОКУПАТЕЛЬ 

// Проверка авторизации покупателя 
const PrivateBuyerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('token');
  const userRole = api.getStoredUserRole();

  if (!token || userRole !== 'customer') {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

// Перенаправление уже авторизованного покупателя на главную
const RedirectBuyerIfAuthenticated: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('token');
  const userRole = api.getStoredUserRole();

  if (token && userRole === 'customer') {
    return <Navigate to="/customer" replace />;
  }

  return <>{children}</>;
};

const PrivateProfileRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('token');
  const userRole = api.getStoredUserRole();

  if (!token || userRole !== 'customer') {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

// ЗАЩИТА МАРШРУТОВ - ПРОДАВЕЦ
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

// ЗАЩИТА МАРШРУТОВ - МЕНЕДЖЕР СКЛАДА 

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

// ЗАЩИТА МАРШРУТОВ - АДМИНИСТРАТОР 

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

const ProductDetailLayout: React.FC = () => {
  const token = localStorage.getItem('token');
  const userRole = api.getStoredUserRole();
  const variant = token && userRole === 'customer' ? 'buyer' : 'landing';
  return (
    <>
      <HeaderMain variant={variant} />
      <main className={styles['main-content']}>
        <ProductDetailPage />
      </main>
    </>
  );
};

/* Общая оболочка каталога: шапка + вложенные страницы*/
const CatalogLayout: React.FC = () => {
  const token = localStorage.getItem('token');
  const userRole = api.getStoredUserRole();
  const variant = token && userRole === 'customer' ? 'buyer' : 'landing';
  return (
    <>
      <HeaderMain variant={variant} />
      <main className={styles['main-content']}>
        <Outlet />
      </main>
    </>
  );
};

// основной компонент маршрутизации

const AppContent: React.FC = () => {
  return (
    <Routes>
      
      {/*главная страница*/}
      
      <Route path="/" element={
        (() => {
          const token = localStorage.getItem('token');
          const userRole = api.getStoredUserRole();
 // Перенаправление по ролям
          if (token && userRole === 'customer') {
            return <Navigate to="/customer" replace />;
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
                <ApiProductGrid limit={16} />
              </main>
            </>
          );
        })()
      } />
      
      {/* маршруты покупателя */}
      
      {/* Страница входа/регистрации покупателя */}
      <Route path="/product/:id" element={<ProductDetailLayout />} />

      <Route path="/catalog" element={<CatalogLayout />}>
        <Route index element={<CatalogRootPage />} />
        <Route path="section/:categoryId" element={<CatalogCategoryPage />} />
      </Route>

      <Route path="/auth" element={
        <RedirectBuyerIfAuthenticated>
          <AuthPageBuyer />
        </RedirectBuyerIfAuthenticated>
      } />
      
      {/* Главная страница покупателя (после входа) */}
      <Route path="/customer" element={
        <PrivateBuyerRoute>
          <MainPageBuyer />
        </PrivateBuyerRoute>
      } />
      <Route path="/buyer" element={<Navigate to="/customer" replace />} />
      
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
      
      {/* маршруты продавца */}
      
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
[18.04.2026 19:42] Пиздахлюйка: {/* Лендинг продавца — доступен без авторизации */}
        <Route path="main" element={<MainSeller />} />
        
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
      
      {/* маршруты менеджера склада */}
      
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
      
      {/* маршруты администратора */}
      
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
      
      {/* перенаправления и обработка ошибок */}
      
      {/* Перенаправления со старых маршрутов */}
      <Route path="/sklad" element={<Navigate to="/warehouse/dashboard" replace />} />
      <Route path="/warehouse-manager" element={<Navigate to="/warehouse/dashboard" replace />} />
      
      {/* Обработка 404 - все неизвестные маршруты на главную */}
      <Route path="*" element={<Navigate to="/" replace />} />
      
    </Routes>
  );
};

// главный компонент App

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