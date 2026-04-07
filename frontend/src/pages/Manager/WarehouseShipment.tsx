import React, { useState, useEffect } from 'react';
import HeaderManager from './HeaderManager';
import WindWarehouseShipment from './WindWarehouseShipment';
import styles from './WarehouseShipment.module.css';

interface Order {
  id: string;
  items: string;
  collector: string;
  time: string;
  selected: boolean;
}

interface SelectedOrderData {
  id: string;
  items: Array<{ name: string; quantity: number }>;
  deliveryMethod: string;
  address: string;
}

interface WarehouseShipmentProps {
  onBack: () => void;
}

const WarehouseShipment: React.FC<WarehouseShipmentProps> = ({ onBack }) => {
  const [userName, setUserName] = useState<string>('И. И. Иванов');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isWindowOpen, setIsWindowOpen] = useState<boolean>(false);
  const [selectedOrderData, setSelectedOrderData] = useState<SelectedOrderData | null>(null);
  const [orders, setOrders] = useState<Order[]>([
    { id: '#S-45', items: '3 позиции', collector: 'Иванов А.', time: '25.10 14:30', selected: false },
    { id: '#S-46', items: '5 позиций', collector: 'Петров А.', time: '26.10 14:30', selected: false },
    { id: '#S-47', items: '10 позиций', collector: 'Сидоров А.', time: '24.10 14:30', selected: false }
  ]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = sessionStorage.getItem('userRole');
    
    if (!token || role !== 'warehouse_manager') {
      window.location.href = '/auth/warehouse';
      return;
    }
    
    const storedUserName = sessionStorage.getItem('userName');
    if (storedUserName) {
      setUserName(storedUserName);
    }
  }, []);

  const handleBack = () => {
    onBack();
  };

  const handleSelectOrder = (orderId: string) => {
    setOrders(orders.map((order: Order) => 
      order.id === orderId ? { ...order, selected: !order.selected } : order
    ));
  };

  const handleShipOrders = () => {
    const selectedOrders = orders.filter((order: Order) => order.selected);
    
    if (selectedOrders.length > 0) {
      setSelectedOrderData({
        id: selectedOrders[0].id,
        items: [
          { name: 'Куртки', quantity: 50 },
          { name: 'Штаны', quantity: 30 },
          { name: 'Футболки', quantity: 100 }
        ],
        deliveryMethod: 'Курьерская служба "Доставка"',
        address: 'г. Москва, ул. Примерная, д. 10, кв. 25'
      });
      setIsWindowOpen(true);
    }
  };

  const handleConfirmShipment = () => {
    console.log('Отгрузка подтверждена для:', selectedOrderData);
    
    // Удаляем выбранные заказы из списка
    setOrders(prevOrders => prevOrders.filter(order => !order.selected));
    
    // Закрываем окно и сбрасываем выбранные данные
    setIsWindowOpen(false);
    setSelectedOrderData(null);
  };

  const filteredOrders = orders.filter((order: Order) => 
    order.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalReadyCount = orders.length;
  const totalCost = 427800;
  const selectedCount = orders.filter((order: Order) => order.selected).length;

  return (
    <div className={styles['warehouse-shipment-main-content']}>
      <div className={styles['warehouse-shipment-header']}>
        <h1 className={styles['warehouse-shipment-page-title']}>Отгрузка</h1>
        <button 
          className={styles['warehouse-shipment-back-button']}
          onClick={handleBack}
        >
          Назад
        </button>
      </div>

      <div className={styles['warehouse-shipment-stats-row']}>
        <div className={styles['warehouse-shipment-ready-info']}>
          <div className={styles['warehouse-shipment-ready-label']}>Готово к отгрузке</div>
          <div className={styles['warehouse-shipment-ready-count']}>{totalReadyCount}</div>
        </div>
        
        <div className={styles['warehouse-shipment-cost-info']}>
          <div className={styles['warehouse-shipment-cost-label']}>Общая стоимость</div>
          <div className={styles['warehouse-shipment-cost-value']}>{totalCost.toLocaleString()} ₽</div>
        </div>
        
        <div className={styles['warehouse-shipment-search-wrapper']}>
          <input
            type="text"
            className={styles['warehouse-shipment-search-input']}
            placeholder="Поиск по номеру заказа"
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className={styles['warehouse-shipment-table-container']}>
        <table className={styles['warehouse-shipment-table']}>
          <thead>
            <tr>
              <th className={styles['warehouse-shipment-col-select']}></th>
              <th className={styles['warehouse-shipment-col-order']}>Заказ</th>
              <th className={styles['warehouse-shipment-col-items']}>Товары</th>
              <th className={styles['warehouse-shipment-col-collector']}>Сборщик</th>
              <th className={styles['warehouse-shipment-col-time']}>Время</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order: Order) => (
              <tr key={order.id}>
                <td className={styles['warehouse-shipment-col-select']}>
                  <input
                    type="checkbox"
                    className={styles['warehouse-shipment-checkbox']}
                    checked={order.selected}
                    onChange={() => handleSelectOrder(order.id)}
                  />
                </td>
                <td className={styles['warehouse-shipment-col-order']}>{order.id}</td>
                <td className={styles['warehouse-shipment-col-items']}>{order.items}</td>
                <td className={styles['warehouse-shipment-col-collector']}>{order.collector}</td>
                <td className={styles['warehouse-shipment-col-time']}>{order.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedCount > 0 && (
        <div className={styles['warehouse-shipment-action-buttons']}>
          <button 
            className={styles['warehouse-shipment-ship-button']}
            onClick={handleShipOrders}
          >
            Отгрузить выбранные
          </button>
        </div>
      )}

      <WindWarehouseShipment
        isOpen={isWindowOpen}
        onClose={() => {
          setIsWindowOpen(false);
          setSelectedOrderData(null);
        }}
        onConfirm={handleConfirmShipment}
        orderData={selectedOrderData || {
          id: '',
          items: [],
          deliveryMethod: '',
          address: ''
        }}
      />
    </div>
  );
};

export default WarehouseShipment;
export { HeaderManager };