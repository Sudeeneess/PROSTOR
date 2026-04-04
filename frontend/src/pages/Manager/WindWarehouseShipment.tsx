import React, { useEffect, useRef } from 'react';
import styles from './WindWarehouseShipment.module.css';

interface WindWarehouseShipmentProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  orderData: {
    id: string;
    items: Array<{ name: string; quantity: number }>;
    deliveryMethod: string;
    address: string;
  };
}

const WindWarehouseShipment: React.FC<WindWarehouseShipmentProps> = ({
  isOpen,
  onClose,
  onConfirm,
  orderData
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node) && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const totalQuantity = orderData.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className={styles['wind-warehouse-shipment-overlay']}>
      <div className={styles['wind-warehouse-shipment-modal']} ref={modalRef}>
        <div className={styles['wind-warehouse-shipment-header']}>
          <h2 className={styles['wind-warehouse-shipment-title']}>Отгрузка заказа {orderData.id}</h2>
          <button className={styles['wind-warehouse-shipment-close']} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles['wind-warehouse-shipment-content']}>
          <div className={styles['wind-warehouse-shipment-section']}>
            <h3 className={styles['wind-warehouse-shipment-section-title']}>Состав заказа:</h3>
            <table className={styles['wind-warehouse-shipment-items-table']}>
              <tbody>
                {orderData.items.map((item, index) => (
                  <tr key={index}>
                    <td className={styles['wind-warehouse-shipment-item-name']}>{item.name}</td>
                    <td className={styles['wind-warehouse-shipment-item-quantity']}>{item.quantity} шт.</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles['wind-warehouse-shipment-section']}>
            <h3 className={styles['wind-warehouse-shipment-section-title']}>Способы доставки:</h3>
            <div className={styles['wind-warehouse-shipment-delivery-info']}>
              <p className={styles['wind-warehouse-shipment-delivery-method']}>{orderData.deliveryMethod}</p>
              <p className={styles['wind-warehouse-shipment-address']}>{orderData.address}</p>
            </div>
          </div>
        </div>

        <div className={styles['wind-warehouse-shipment-footer']}>
          <button className={styles['wind-warehouse-shipment-confirm-button']} onClick={onConfirm}>
            Подтвердить отгрузку
          </button>
        </div>
      </div>
    </div>
  );
};

export default WindWarehouseShipment;