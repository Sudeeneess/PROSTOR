import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderManager from './HeaderManager';
import WindWarehouseReceiving from './WindWarehouseReceiving';
import styles from './WarehouseReceiving.module.css';

interface ProductItem {
  id: string;
  seller: string;
  products: string;
  date: string;
  status: string;
  selected: boolean;
}

interface WarehouseReceivingProps {
  onBack: () => void;
}

// Данные для всех поставок
const receptionData: Record<string, { sellerName: string; products: any[] }> = {
  '#S-45': {
    sellerName: 'ООО "Поставщик"',
    products: [
      { id: '1', name: 'Куртка', expected: 50, accepted: 45, cell: 'A-15-B' },
      { id: '2', name: 'Штаны', expected: 40, accepted: 30, cell: 'Б-08-Г' },
      { id: '3', name: 'Футболка', expected: 100, accepted: 95, cell: 'B-12-P' }
    ]
  },
  '#S-46': {
    sellerName: 'ИП Петров',
    products: [
      { id: '1', name: 'Кроссовки', expected: 30, accepted: 28, cell: 'C-05-D' },
      { id: '2', name: 'Свитер', expected: 25, accepted: 25, cell: 'D-12-E' },
      { id: '3', name: 'Джинсы', expected: 40, accepted: 38, cell: 'E-08-F' }
    ]
  },
  '#S-47': {
    sellerName: 'ООО "Снабжение"',
    products: [
      { id: '1', name: 'Пальто', expected: 20, accepted: 15, cell: 'F-10-G' },
      { id: '2', name: 'Рубашка', expected: 60, accepted: 55, cell: 'G-03-H' },
      { id: '3', name: 'Брюки', expected: 35, accepted: 30, cell: 'H-07-I' }
    ]
  }
};

const WarehouseReceiving: React.FC<WarehouseReceivingProps> = ({ onBack }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<ProductItem[]>([
    {
      id: '#S-45',
      seller: 'ООО "Поставщик"',
      products: '3 позиции',
      date: '25.10',
      status: 'Ожидает',
      selected: false
    },
    {
      id: '#S-46',
      seller: 'ИП Петров',
      products: '3 позиции',
      date: '26.10',
      status: 'Ожидает',
      selected: false
    },
    {
      id: '#S-47',
      seller: 'ООО "Снабжение"',
      products: '3 позиции',
      date: '24.10',
      status: 'Частично',
      selected: false
    }
  ]);

  const [isWindowOpen, setIsWindowOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // Проверка авторизации
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = sessionStorage.getItem('userRole');
    
    if (!token || role !== 'warehouse_manager') {
      navigate('/warehouse/auth', { replace: true });
      return;
    }
  }, [navigate]);

  const handleSelectProduct = (id: string) => {
    setProducts(prevProducts =>
      prevProducts.map(product =>
        product.id === id
          ? { ...product, selected: !product.selected }
          : product
      )
    );
  };

  const handleBack = () => {
    onBack();
  };

  const handleAcceptSelected = () => {
    const selectedProducts = products.filter(product => product.selected);
    if (selectedProducts.length > 0) {
      setSelectedOrderId(selectedProducts[0].id);
      setIsWindowOpen(true);
    }
  };

  const handleCloseWindow = () => {
    setIsWindowOpen(false);
    setSelectedOrderId(null);
  };

  const handleCompleteReception = () => {
    if (selectedOrderId) {
      setProducts(prevProducts =>
        prevProducts.map(product =>
          product.id === selectedOrderId
            ? { ...product, status: 'Принято', selected: false }
            : product
        )
      );
    }
  };

  const handleDownloadInvoices = () => {
    console.log('Скачать накладные');
  };

  const handleExportToExcel = () => {
    console.log('Экспорт в Excel');
  };

  const hasSelectedItems = products.some(product => product.selected);

  const getWindowData = () => {
    if (selectedOrderId && receptionData[selectedOrderId]) {
      const orderData = receptionData[selectedOrderId];
      return {
        sellerName: orderData.sellerName,
        orderId: selectedOrderId,
        products: orderData.products
      };
    }
    return null;
  };

  const windowData = getWindowData();

  return (
    <div className={styles['warehouse-receiving-content']}>
      <div className={styles['warehouse-receiving-container']}>
        <div className={styles['warehouse-receiving-header']}>
          <h1 className={styles['warehouse-receiving-title']}>Приемка товара</h1>
          <button className={styles['warehouse-receiving-back-button']} onClick={handleBack}>
            Назад
          </button>
        </div>

        <div className={styles['warehouse-receiving-table-container']}>
          <table className={styles['warehouse-receiving-table']}>
            <thead>
              <tr>
                <th className={styles['warehouse-receiving-checkbox-column']}></th>
                <th>ID</th>
                <th>Продавец</th>
                <th>Товары</th>
                <th>Дата</th>
                <th>Статус</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td className={styles['warehouse-receiving-checkbox-column']}>
                    <input
                      type="checkbox"
                      className={styles['warehouse-receiving-checkbox']}
                      checked={product.selected}
                      onChange={() => handleSelectProduct(product.id)}
                      disabled={product.status === 'Принято'}
                    />
                  </td>
                  <td className={styles['warehouse-receiving-product-id']}>{product.id}</td>
                  <td>{product.seller}</td>
                  <td>{product.products}</td>
                  <td>{product.date}</td>
                  <td>
                    <span
                      className={`${styles['warehouse-receiving-status-badge']} ${
                        product.status === 'Ожидает'
                          ? styles['warehouse-receiving-status-pending']
                          : product.status === 'Частично'
                            ? styles['warehouse-receiving-status-partial']
                            : styles['warehouse-receiving-status-accepted']
                      }`}
                    >
                      {product.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {hasSelectedItems && (
          <div className={styles['warehouse-receiving-action-buttons-container']}>
            <button 
              className={`${styles['warehouse-receiving-action-button']} ${styles['warehouse-receiving-accept-button']}`}
              onClick={handleAcceptSelected}
            >
              Принять выбранные ({products.filter(p => p.selected).length})
            </button>
            <button 
              className={`${styles['warehouse-receiving-action-button']} ${styles['warehouse-receiving-download-button']}`}
              onClick={handleDownloadInvoices}
            >
              Скачать накладные
            </button>
            <button 
              className={`${styles['warehouse-receiving-action-button']} ${styles['warehouse-receiving-export-button']}`}
              onClick={handleExportToExcel}
            >
              Экспорт в Excel
            </button>
          </div>
        )}
      </div>

      {windowData && (
        <WindWarehouseReceiving
          isOpen={isWindowOpen}
          onClose={handleCloseWindow}
          onComplete={handleCompleteReception}
          sellerName={windowData.sellerName}
          orderId={windowData.orderId}
          products={windowData.products}
        />
      )}
    </div>
  );
};

export default WarehouseReceiving;
export { HeaderManager };