import React, { useEffect, useRef } from 'react';
import './WindowOtgryzkaManager.css';

interface WindowOtgryzkaManagerProps {
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

const WindowOtgryzkaManager: React.FC<WindowOtgryzkaManagerProps> = ({
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
    <div className="window-otgryzka-overlay">
      <div className="window-otgryzka-modal" ref={modalRef}>
        <div className="window-otgryzka-header">
          <h2 className="window-otgryzka-title">Отгрузка заказа {orderData.id}</h2>
          <button className="window-otgryzka-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="window-otgryzka-content">
          <div className="window-otgryzka-section">
            <h3 className="window-otgryzka-section-title">Состав заказа:</h3>
            <table className="window-otgryzka-items-table">
              <tbody>
                {orderData.items.map((item, index) => (
                  <tr key={index}>
                    <td className="window-otgryzka-item-name">{item.name}</td>
                    <td className="window-otgryzka-item-quantity">{item.quantity} шт.</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="window-otgryzka-section">
            <h3 className="window-otgryzka-section-title">Способы доставки:</h3>
            <div className="window-otgryzka-delivery-info">
              <p className="window-otgryzka-delivery-method">{orderData.deliveryMethod}</p>
              <p className="window-otgryzka-address">{orderData.address}</p>
            </div>
          </div>
        </div>

        <div className="window-otgryzka-footer">
          <button className="window-otgryzka-confirm-button" onClick={onConfirm}>
            Подтвердить отгрузку
          </button>
        </div>
      </div>
    </div>
  );
};

export default WindowOtgryzkaManager;