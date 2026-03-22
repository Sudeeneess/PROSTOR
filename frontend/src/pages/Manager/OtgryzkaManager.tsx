import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderManager from './HeaderManager';
import WindowOtgryzkaManager from './WindowOtgryzkaManager';
import './OtgryzkaManager.css';

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

const OtgryzkaManager: React.FC = () => {
  const navigate = useNavigate();
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
      navigate('/auth/warehouse', { replace: true });
      return;
    }
    
    const storedUserName = sessionStorage.getItem('userName');
    if (storedUserName) {
      setUserName(storedUserName);
    }
  }, [navigate]);

  const handleBack = () => {
    navigate('/warehouse');
  };

  const handleSelectOrder = (orderId: string) => {
    setOrders(orders.map((order: Order) => 
      order.id === orderId ? { ...order, selected: !order.selected } : order
    ));
  };

  const handleShipOrders = () => {
    const selectedOrders = orders.filter((order: Order) => order.selected);
    
    if (selectedOrders.length > 0) {
      // В реальном приложении данные должны приходить из API
      // Здесь мы используем данные из выбранного заказа
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
    
    // Удаляем отгруженные заказы из списка
    setOrders(orders.filter((order: Order) => !order.selected));
    
    // Закрываем окно
    setIsWindowOpen(false);
    
    // Очищаем выбранные данные
    setSelectedOrderData(null);
  };

  const filteredOrders = orders.filter((order: Order) => 
    order.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalReadyCount = orders.length;
  const totalCost = 427800;

  const selectedCount = orders.filter((order: Order) => order.selected).length;

  return (
    <div className="otgryzka-wrapper">
      <HeaderManager />

      <main className="otgryzka-main-content">
        <div className="otgryzka-header">
          <h1 className="otgryzka-page-title">Отгрузка</h1>
          <button 
            className="otgryzka-back-button"
            onClick={handleBack}
          >
            Назад
          </button>
        </div>

        <div className="otgryzka-stats-row">
          <div className="otgryzka-ready-info">
            <div className="otgryzka-ready-label">Готово к отгрузке</div>
            <div className="otgryzka-ready-count">{totalReadyCount}</div>
          </div>
          
          <div className="otgryzka-cost-info">
            <div className="otgryzka-cost-label">Общая стоимость</div>
            <div className="otgryzka-cost-value">{totalCost.toLocaleString()} ₽</div>
          </div>
          
          <div className="otgryzka-search-wrapper">
            <input
              type="text"
              className="otgryzka-search-input"
              placeholder="Поиск по номеру заказа"
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="otgryzka-table-container">
          <table className="otgryzka-table">
            <thead>
              <tr>
                <th className="otgryzka-col-select"></th>
                <th className="otgryzka-col-order">Заказ</th>
                <th className="otgryzka-col-items">Товары</th>
                <th className="otgryzka-col-collector">Сборщик</th>
                <th className="otgryzka-col-time">Время</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order: Order) => (
                <tr key={order.id}>
                  <td className="otgryzka-col-select">
                    <input
                      type="checkbox"
                      className="otgryzka-checkbox"
                      checked={order.selected}
                      onChange={() => handleSelectOrder(order.id)}
                    />
                  </td>
                  <td className="otgryzka-col-order">{order.id}</td>
                  <td className="otgryzka-col-items">{order.items}</td>
                  <td className="otgryzka-col-collector">{order.collector}</td>
                  <td className="otgryzka-col-time">{order.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selectedCount > 0 && (
          <div className="otgryzka-action-buttons">
            <button 
              className="otgryzka-ship-button"
              onClick={handleShipOrders}
            >
              Отгрузить выбранные
            </button>
          </div>
        )}
      </main>

      <WindowOtgryzkaManager
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

export default OtgryzkaManager;