import React, { useEffect, useState } from 'react';
import './WindowSborkaManager.css';

interface WindowSborkaManagerProps {
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

const WindowSborkaManager: React.FC<WindowSborkaManagerProps> = ({ 
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
    <div className="window-sborka-overlay" onClick={handleOverlayClick}>
      <div className="window-sborka-modal">
        <div className="window-sborka-header">
          <h2 className="window-sborka-title">Сборка заказа</h2>
          <button 
            className="window-sborka-close"
            onClick={onClose}
            aria-label="Закрыть"
          >
            ×
          </button>
        </div>

        <div className="window-sborka-content">
          <div className="window-sborka-table-container">
            <table className="window-sborka-table">
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
                    <td>
                      <input
                        type="number"
                        className="accepted-input"
                        value={item.accepted}
                        onChange={(e) => {
                          const newItems = [...items];
                          newItems[index].accepted = parseInt(e.target.value) || 0;
                          setItems(newItems);
                        }}
                      />
                    </td>
                    <td className="cell-code">{item.cell}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="window-sborka-actions">
            <button 
              className="window-sborka-complete-btn"
              onClick={handleCompleteAcceptance}
            >
              Завершить приемку
            </button>
            <button 
              className="window-sborka-draft-btn"
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

export default WindowSborkaManager;