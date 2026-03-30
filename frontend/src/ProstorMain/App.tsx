import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './Header';
import ProductGrid from './ProductGrid';
import AuthPageBuyer from '../pages/Buyer/AuthPageBuyer'; 
import MainPageBuyer from '../pages/Buyer/MainPageBuyer';
import AuthPageManager from '../pages/Manager/AuthPageManager';
import Warehouse from '../pages/Manager/WarehousePage';
import Authorizationseller from '../pages/Seller/AuthSeller';
import SellerEntrance from '../pages/Seller/RegistrSeller'; 
import PersonalSeller from '../pages/Seller/PersonalSeller';
import AddingProducts from '../pages/Seller/AddProducts';
import ProductSeller from '../pages/Seller/ProductSeller';
import OrdersSeller from '../pages/Seller/OrdersSeller';
import Admin from '../pages/Admin/AdminPage';

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

// КОМПОНЕНТЫ ДЛЯ ПРОДАВЦА
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

const AppContent: React.FC = () => {
  return (
    <Routes>
      {/* Главная страница */}
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
      
      {/* Страница авторизации покупателя */}
      <Route path="/auth" element={
        <RedirectBuyerIfAuthenticated>
          <AuthPageBuyer />
        </RedirectBuyerIfAuthenticated>
      } />
      
      {/* Страница покупателя после авторизации */}
      <Route path="/buyer" element={
        <PrivateBuyerRoute>
          <MainPageBuyer />
        </PrivateBuyerRoute>
      } />
      
      {/* МАРШРУТЫ ДЛЯ ПРОДАВЦА */}
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
      
      {/* Маршрут для администратора - БЕЗ ПРОВЕРКИ АВТОРИЗАЦИИ */}
      <Route path="/admin" element={<Admin />} />
     
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
      <div className="app">
        <AppContent />
      </div>
    </Router>
  );
}

export default App;