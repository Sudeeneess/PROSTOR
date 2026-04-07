import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // ✅ ДОБАВИЛИ
import HeaderAdmin from './HeaderAdmin';
import styles from './ProductAdmin.module.css';

interface Product {
  id: number;
  name: string;
  price: number;
  status: 'visible' | 'hidden';
  seller: string;
}

const initialProducts: Product[] = [
  { id: 154522, name: 'Куртка зимняя', price: 5000, status: 'visible', seller: 'ООО "А"' },
  { id: 164562, name: 'Штаны спортивные', price: 5000, status: 'visible', seller: 'ИП Петров' },
  { id: 177856, name: 'Футболка х/б', price: 5000, status: 'hidden', seller: 'ООО "Б"' },
  { id: 182145, name: 'Платье летнее', price: 5000, status: 'visible', seller: 'ООО "Б"' },
];

const ProductAdmin: React.FC = () => {
  const navigate = useNavigate(); // ✅

  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [selected, setSelected] = useState<number[]>([]);
  const [filter, setFilter] = useState<'all' | 'visible' | 'hidden'>('all');

  const toggleSelect = (id: number) => {
    setSelected(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleHideSelected = () => {
    setProducts(prev =>
      prev.map(product =>
        selected.includes(product.id)
          ? { ...product, status: 'hidden' }
          : product
      )
    );
    setSelected([]);
  };

  const handleRestoreSelected = () => {
    setProducts(prev =>
      prev.map(product =>
        selected.includes(product.id)
          ? { ...product, status: 'visible' }
          : product
      )
    );
    setSelected([]);
  };

  const filteredProducts = products.filter(product => {
    if (filter === 'visible') return product.status === 'visible';
    if (filter === 'hidden') return product.status === 'hidden';
    return true;
  });

  return (
    <div>
      <HeaderAdmin />

      <div className={styles['admin-prod-container']}>
        <div className={styles['admin-prod-header']}>
          <h2>Товары</h2>

          {/* ✅ ИСПРАВЛЕНО */}
          <span 
            className={styles['admin-prod-back-link']}
            onClick={() => navigate('/admin')} // 👈 переход
            style={{ cursor: 'pointer' }}
          >
            Назад
          </span>
        </div>

        <div className={styles['admin-prod-tabs']}>
          <button
            type="button"
            className={filter === 'all' ? styles['admin-prod-active'] : ''}
            onClick={() => setFilter('all')}
          >
            Все товары
          </button>
          <button
            type="button"
            className={filter === 'visible' ? styles['admin-prod-active'] : ''}
            onClick={() => setFilter('visible')}
          >
            Активные
          </button>
          <button
            type="button"
            className={filter === 'hidden' ? styles['admin-prod-active'] : ''}
            onClick={() => setFilter('hidden')}
          >
            Скрытые
          </button>
        </div>

        <table className={styles['admin-prod-table']}>
          <thead>
            <tr>
              <th></th>
              <th>Артикул</th>
              <th>Название</th>
              <th>Цена</th>
              <th>Статус</th>
              <th>Продавец</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(product => (
              <tr key={product.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selected.includes(product.id)}
                    onChange={() => toggleSelect(product.id)}
                  />
                </td>
                <td>{product.id}</td>
                <td>{product.name}</td>
                <td>{product.price.toLocaleString()} ₽</td>
                <td>
                  {product.status === 'visible' ? 'Виден' : 'Скрыт'}
                </td>
                <td>{product.seller}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {selected.length > 0 && (
          <div className={styles['admin-prod-actions']}>
            <button onClick={handleHideSelected}>
              Скрыть выбранные 
            </button>
            <button onClick={handleRestoreSelected}>
              Вернуть в каталог 
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductAdmin;