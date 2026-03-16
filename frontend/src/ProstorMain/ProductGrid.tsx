// import React from 'react';
import './ProductGrid.css';

function ProductGrid() {
  const products = [
    { id: 1, price: '000 ₽', name: 'Название товара', rating: '5.0', reviews: '00 000' },
    { id: 2, price: '000 ₽', name: 'Название товара', rating: '5.0', reviews: '00 000' },
    { id: 3, price: '000 ₽', name: 'Название товара', rating: '5.0', reviews: '00 000' },
    { id: 4, price: '000 ₽', name: 'Название товара', rating: '5.0', reviews: '00 000' },
    { id: 5, price: '000 ₽', name: 'Название товара', rating: '5.0', reviews: '00 000' },
    { id: 6, price: '000 ₽', name: 'Название товара', rating: '5.0', reviews: '00 000' },
    { id: 7, price: '000 ₽', name: 'Название товара', rating: '5.0', reviews: '00 000' },
    { id: 8, price: '000 ₽', name: 'Название товара', rating: '5.0', reviews: '00 000' },
    { id: 9, price: '000 ₽', name: 'Название товара', rating: '5.0', reviews: '00 000' },
    { id: 10, price: '000 ₽', name: 'Название товара', rating: '5.0', reviews: '00 000' },
    { id: 11, price: '000 ₽', name: 'Название товара', rating: '5.0', reviews: '00 000' },
    { id: 12, price: '000 ₽', name: 'Название товара', rating: '5.0', reviews: '00 000' },
    { id: 13, price: '000 ₽', name: 'Название товара', rating: '5.0', reviews: '00 000' },
    { id: 14, price: '000 ₽', name: 'Название товара', rating: '5.0', reviews: '00 000' },
    { id: 15, price: '000 ₽', name: 'Название товара', rating: '5.0', reviews: '00 000' },
    { id: 16, price: '000 ₽', name: 'Название товара', rating: '5.0', reviews: '00 000' },
  ];

  return (
    <div className="product-grid">
      {products.map(product => (
        <div key={product.id} className="product-card">
          <div className="product-image">
            <div className="image-placeholder">📦</div>
          </div>
          <div className="product-info">
            <div className="price">{product.price}</div>
            <div className="name">{product.name}</div>
            <div className="rating">
              ★ {product.rating} {product.reviews} отзывов
            </div>
            <button className="add-to-cart">Добавить в корзину</button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ProductGrid;