import React, { useEffect, useState } from 'react';
import './WindWarehouseAssembling.css';

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
    <div className="wind-warehouse-assembling-overlay" onClick={handleOverlayClick}>
      <div className="wind-warehouse-assembling-modal">
        <div className="wind-warehouse-assembling-header">
          <h2 className="wind-warehouse-assembling-title">Сборка заказа</h2>
          <button 
            className="wind-warehouse-assembling-close"
            onClick={onClose}
            aria-label="Закрыть"
          >
            ×
          </button>
        </div>

        <div className="wind-warehouse-assembling-content">
          <div className="wind-warehouse-assembling-table-container">
            <table className="wind-warehouse-assembling-table">
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
                    <td className="product-name">{item.name}</td>
                    <td>{item.expected}</td>
                    <td>{item.accepted}</td>
                    <td className="cell-code">{item.cell}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="wind-warehouse-assembling-actions">
            <button 
              className="wind-warehouse-assembling-complete-btn"
              onClick={handleCompleteAcceptance}
            >
              Завершить сборку
            </button>
            <button 
              className="wind-warehouse-assembling-draft-btn"
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