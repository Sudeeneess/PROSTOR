import React from 'react';
import './WindowPriemkaManager.css';

interface ProductItem {
  id: string;
  name: string;
  expected: number;
  accepted: number;
  cell: string;
}

interface WindowPriemkaManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  sellerName: string;
  orderId: string;
  products: ProductItem[];
}

const WindowPriemkaManager: React.FC<WindowPriemkaManagerProps> = ({
  isOpen,
  onClose,
  onComplete,
  sellerName,
  orderId,
  products
}) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleCompleteReception = () => {
    onComplete();
    onClose();
  };

  return (
    <div className="window-priemka-overlay" onClick={handleOverlayClick}>
      <div className="window-priemka-modal">
        <div className="window-priemka-header">
          <h2 className="window-priemka-title">
            Поставка {orderId} от {sellerName}
          </h2>
          <button className="window-priemka-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="window-priemka-content">
          <div className="window-priemka-table-container">
            <table className="window-priemka-table">
              <thead>
                <tr>
                  <th>Товар</th>
                  <th>Ожидается</th>
                  <th>Принято</th>
                  <th>Ячейка</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, index) => (
                  <tr key={index}>
                    <td className="window-priemka-product-name">{product.name}</td>
                    <td>{product.expected}</td>
                    <td>{product.accepted}</td>
                    <td>{product.cell}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="window-priemka-footer">
          <button 
            className="window-priemka-button window-priemka-complete-button"
            onClick={handleCompleteReception}
          >
            Завершить приемку
          </button>
          <button 
            className="window-priemka-button window-priemka-draft-button"
            onClick={onClose}
          >
            Сохранить черновик
          </button>
        </div>
      </div>
    </div>
  );
};

export default WindowPriemkaManager;