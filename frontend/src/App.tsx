import './index.css';
import { LuMenu } from "react-icons/lu";
import { RxAvatar } from "react-icons/rx";

function App() {
  const products = [
    { id: 1, name: 'Товар 1', price: 1000, rating: 5, reviews: 10, image: '' },
    { id: 2, name: 'Товар 2', price: 2000, rating: 4, reviews: 5, image: '' },
    { id: 3, name: 'Товар 3', price: 3000, rating: 5, reviews: 15, image: '' },
    { id: 4, name: 'Товар 4', price: 4000, rating: 3, reviews: 3, image: '' },
    { id: 5, name: 'Товар 5', price: 4000, rating: 3, reviews: 3, image: '' },
    { id: 6, name: 'Товар 6', price: 4000, rating: 3, reviews: 3, image: '' },
    { id: 7, name: 'Товар 7', price: 4000, rating: 3, reviews: 3, image: '' },
  ];

  return (
    <div className="app">
      <header className="header">
        <div className="logo">prostor</div>
        
        {/* Контейнер для поиска и меню по центру */}
        <div className="header-center">
          <div className="menu-icon">
            <LuMenu size={40} color='#5a67d8' />
          </div>
          <div className="search-bar">
            <input type="text" placeholder="Поиск товаров..." />
          </div>
          <div className='ava-icon'>
            <RxAvatar size={45} color='#5a67d8' />
          </div>
          
        </div>

        {}
        <div className="header-right"></div>
      </header>

      <main className="main">
        <div className="product-grid">
          {products.map(product => (
            <div key={product.id} className="product-card">
              <div className="product-image">
                <div className="image-placeholder">📦</div>
              </div>
              <div className="product-info">
                <div className="price">{product.price} ₽</div>
                <div className="name">{product.name}</div>
                <div className="rating">
                  {'★'.repeat(product.rating)}
                  {'☆'.repeat(5 - product.rating)}
                  {' '}{product.reviews} отзывов
                </div>
                <button className="add-to-cart">Добавить в корзину</button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;