import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './Header';
import ProductGrid from './ProductGrid';
import AuthPageBuyer from '../pages/Buyer/AuthPageBuyer'; 
import MainPageBuyer from '../pages/Buyer/MainPageBuyer';
import AuthPageManager from '../pages/Manager/AuthPageManager'; // Исправлен импорт
import Warehouse from '../pages/Manager/WarehousePage';

// Компонент для защиты маршрутов (только для авторизованных менеджеров)
const PrivateWarehouseRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('token');
  const userRole = sessionStorage.getItem('userRole');
  
  // Проверяем наличие токена и правильность роли
  if (!token || userRole !== 'warehouse_manager') {
    // Перенаправляем на страницу авторизации менеджера
    return <Navigate to="/warehouse/auth" replace />;
  }
  
  return <>{children}</>;
};

// Компонент для проверки, авторизован ли менеджер (для перенаправления со страницы входа)
const RedirectIfAuthenticated: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('token');
  const userRole = sessionStorage.getItem('userRole');
  
  // Если уже авторизован как менеджер, перенаправляем на страницу склада
  if (token && userRole === 'warehouse_manager') {
    return <Navigate to="/warehouse/dashboard" replace />;
  }
  
  return <>{children}</>;
};

// Создадим компонент-обертку для обработки навигации
const AppContent: React.FC = () => {
  return (
    <Routes>
      {/* Главная страница (для покупателей) */}
      <Route path="/" element={
        <>
          <Header />
          <main className="main-content">
            <ProductGrid />
          </main>
        </>
      } />
      
      {/* Страница авторизации покупателя */}
      <Route path="/auth" element={<AuthPageBuyer />} />
      
      {/* Страница покупателя после авторизации */}
      <Route path="/buyer" element={<MainPageBuyer />} />
      
      {/* Маршруты для менеджера склада */}
      <Route path="/warehouse">
        {/* Страница авторизации менеджера */}
        <Route 
          path="auth" 
          element={
            <RedirectIfAuthenticated>
              <AuthPageManager />
            </RedirectIfAuthenticated>
          } 
        />
        
        {/* Страница склада (требует авторизации) */}
        <Route 
          path="dashboard" 
          element={
            <PrivateWarehouseRoute>
              <Warehouse />
            </PrivateWarehouseRoute>
          } 
        />
        
        {/* Перенаправление с /warehouse на соответствующую страницу */}
        <Route 
          path="" 
          element={
            <Navigate to="/warehouse/auth" replace />
          } 
        />
      </Route>
      
      {/* Перенаправление для старых маршрутов (обратная совместимость) */}
      <Route path="/sklad" element={<Navigate to="/warehouse/dashboard" replace />} />
      <Route path="/warehouse-manager" element={<Navigate to="/warehouse/dashboard" replace />} />
      
      {/* Обработка 404 - перенаправление на главную */}
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