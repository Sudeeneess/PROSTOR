import styles from './ProductGrid.module.css';
import ProductCard from './ProductCard';

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

function ProductGrid() {
  return (
    <div className={styles['product-grid']}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          price={product.price}
          name={product.name}
          rating={product.rating}
          reviews={product.reviews}
        />
      ))}
    </div>
  );
}

export default ProductGrid;
