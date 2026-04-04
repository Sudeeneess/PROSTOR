import React from 'react';
import styles from './WindWarehouseReceiving.module.css';

interface ProductItem {
  id: string;
  name: string;
  expected: number;
  accepted: number;
  cell: string;
}

interface WindWarehouseReceivingProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  sellerName: string;
  orderId: string;
  products: ProductItem[];
}

const WindWarehouseReceiving: React.FC<WindWarehouseReceivingProps> = ({
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
    <div className={styles['wind-warehouse-receiving-overlay']} onClick={handleOverlayClick}>
      <div className={styles['wind-warehouse-receiving-modal']}>
        <div className={styles['wind-warehouse-receiving-header']}>
          <h2 className={styles['wind-warehouse-receiving-title']}>
            Поставка {orderId} от {sellerName}
          </h2>
          <button className={styles['wind-warehouse-receiving-close']} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles['wind-warehouse-receiving-content']}>
          <div className={styles['wind-warehouse-receiving-table-container']}>
            <table className={styles['wind-warehouse-receiving-table']}>
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
                    <td className={styles['wind-warehouse-receiving-product-name']}>{product.name}</td>
                    <td>{product.expected}</td>
                    <td>{product.accepted}</td>
                    <td>{product.cell}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className={styles['wind-warehouse-receiving-footer']}>
          <button 
            className={`${styles['wind-warehouse-receiving-button']} ${styles['wind-warehouse-receiving-complete-button']}`}
            onClick={handleCompleteReception}
          >
            Завершить приемку
          </button>
          <button 
            className={`${styles['wind-warehouse-receiving-button']} ${styles['wind-warehouse-receiving-draft-button']}`}
            onClick={onClose}
          >
            Сохранить черновик
          </button>
        </div>
      </div>
    </div>
  );
};

export default WindWarehouseReceiving;