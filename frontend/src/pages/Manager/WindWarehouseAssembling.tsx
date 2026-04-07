import React, { useEffect, useState } from 'react';
import styles from './WindWarehouseAssembling.module.css';

interface WindWarehouseAssemblingProps {
  onClose: () => void;
  orderData?: {
    orderNumber: string;
    items: Array<{
      name: string;
      expected: number;
      accepted: number;
      cell: string;
    }>;
  };
}

const WindWarehouseAssembling: React.FC<WindWarehouseAssemblingProps> = ({ 
  onClose, 
  orderData 
}) => {
  const [items, setItems] = useState(orderData?.items || [
    { name: 'Куртка', expected: 50, accepted: 45, cell: 'A-15-B' },
    { name: 'Штаны', expected: 40, accepted: 30, cell: 'Б-08-Г' },
    { name: 'Футболка', expected: 100, accepted: 95, cell: 'B-12-P' }
  ]);

  // Закрытие по Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Закрытие по клику на фон
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleCompleteAcceptance = () => {
    console.log('Приемка завершена');
    onClose();
  };

  const handleSaveDraft = () => {
    console.log('Сохранен черновик');
    // Здесь логика сохранения черновика
  };

  return (
    <div className={styles['wind-warehouse-assembling-overlay']} onClick={handleOverlayClick}>
      <div className={styles['wind-warehouse-assembling-modal']}>
        <div className={styles['wind-warehouse-assembling-header']}>
          <h2 className={styles['wind-warehouse-assembling-title']}>Сборка заказа</h2>
          <button 
            className={styles['wind-warehouse-assembling-close']}
            onClick={onClose}
            aria-label="Закрыть"
          >
            ×
          </button>
        </div>

        <div className={styles['wind-warehouse-assembling-content']}>
          <div className={styles['wind-warehouse-assembling-table-container']}>
            <table className={styles['wind-warehouse-assembling-table']}>
              <thead>
                <tr>
                  <th>Товар</th>
                  <th>Ожидается</th>
                  <th>Принято</th>
                  <th>Ячейка</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index}>
                    <td className={styles['product-name']}>{item.name}</td>
                    <td>{item.expected}</td>
                    <td>{item.accepted}</td>
                    <td className={styles['cell-code']}>{item.cell}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles['wind-warehouse-assembling-actions']}>
            <button 
              className={styles['wind-warehouse-assembling-complete-btn']}
              onClick={handleCompleteAcceptance}
            >
              Завершить приемку
            </button>
            <button 
              className={styles['wind-warehouse-assembling-draft-btn']}
              onClick={handleSaveDraft}
            >
              Сохранить черновик
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WindWarehouseAssembling;