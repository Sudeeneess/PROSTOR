import React, { useEffect, useState } from 'react';
import HeaderManager from './HeaderManager';
import WindWarehouseAssembling from './WindWarehouseAssembling';
import styles from './WarehouseAssembling.module.css';

interface WarehouseAssemblingProps {
  onBack: () => void; // Добавляем пропс
}

const WarehouseAssembling: React.FC<WarehouseAssemblingProps> = ({ onBack }) => {
  const [isWindowOpen, setIsWindowOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = sessionStorage.getItem('userRole');
    
    if (!token || role !== 'warehouse_manager') {
      window.location.href = '/auth/warehouse';
      return;
    }
  }, []);

  const handleBack = () => {
    onBack(); // Вызываем callback
  };

  const handleStartAssembly = () => {
    setIsWindowOpen(true);
  };

  const handleCloseWindow = () => {
    setIsWindowOpen(false);
  };

  return (
    <div className={styles['warehouse-assembling-main-content']}>
      <div className={styles['warehouse-assembling-content-header']}>
        <h1 className={styles['warehouse-assembling-page-title']}>Заказы на сборке</h1>
        <button 
          className={styles['warehouse-assembling-back-button']}
          onClick={handleBack}
        >
          Назад
        </button>
      </div>

      <div className={styles['warehouse-assembling-orders-table-container']}>
        <table className={styles['warehouse-assembling-orders-table']}>
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

      <div className={styles['warehouse-assembling-start-assembly-container']}>
        <button 
          className={styles['warehouse-assembling-start-assembly-button']}
          onClick={handleStartAssembly}
        >
          Начать сборку
        </button>
      </div>

      {isWindowOpen && (
        <WindWarehouseAssembling 
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

export default WarehouseAssembling;
export {HeaderManager };