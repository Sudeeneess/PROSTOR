import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderManager from './HeaderManager';
import WindowSborkaManager from './WindowSborkaManager';
import './SborkaManager.css';

const SborkaManager: React.FC = () => {
  const navigate = useNavigate();
  const [isWindowOpen, setIsWindowOpen] = useState(false);

  useEffect(() => {
    // Проверяем авторизацию
    const token = localStorage.getItem('token');
    const role = sessionStorage.getItem('userRole');
    
    if (!token || role !== 'warehouse_manager') {
      navigate('/auth/warehouse', { replace: true });
      return;
    }
  }, [navigate]);

  const handleBack = () => {
    navigate('/warehouse');
  };

  const handleStartAssembly = () => {
    setIsWindowOpen(true);
  };

  const handleCloseWindow = () => {
    setIsWindowOpen(false);
  };

  return (
    <div className="sborka-wrapper">
      <HeaderManager />

      <main className="sborka-main-content">
        <div className="sborka-content-header">
          <h1 className="sborka-page-title">Заказы на сборке</h1>
          <button 
            className="sborka-back-button"
            onClick={handleBack}
          >
            Назад
          </button>
        </div>

        <div className="sborka-orders-table-container">
          <table className="sborka-orders-table">
            <thead>
              <tr>
                <th>Заказ</th>
                <th>Товары</th>
                <th>Дата</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>#S-455456</td>
                <td>3 позиции</td>
                <td>12.11</td>
              </tr>
              <tr>
                <td>#S-354545</td>
                <td>3 позиции</td>
                <td>12.11</td>
              </tr>
              <tr>
                <td>#S-656456</td>
                <td>3 позиции</td>
                <td>12.11</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="sborka-start-assembly-container">
          <button 
            className="sborka-start-assembly-button"
            onClick={handleStartAssembly}
          >
            Начать сборку
          </button>
        </div>
      </main>

      {isWindowOpen && (
        <WindowSborkaManager 
          onClose={handleCloseWindow}
          orderData={{
            orderNumber: '#S-455456',
            items: [
              { name: 'Куртка', expected: 50, accepted: 45, cell: 'A-15-B' },
              { name: 'Штаны', expected: 40, accepted: 30, cell: 'Б-08-Г' },
              { name: 'Футболка', expected: 100, accepted: 95, cell: 'B-12-P' }
            ]
          }}
        />
      )}
    </div>
  );
};

export default SborkaManager;