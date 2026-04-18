import styles from './ProductGrid.module.css';
import ProductCard from './ProductCard';
import {
  getHomeGridProducts,
  toProductCardProps,
  type CatalogGridProduct,
} from '../data/mockCatalogProducts';

type ProductGridProps = {
  products?: CatalogGridProduct[];
};

function ProductGrid({ products }: ProductGridProps) {
  const list = products ?? getHomeGridProducts();

  return (
    <div className={styles['product-grid']}>
      {list.map((product) => {
        const card = toProductCardProps(product);
        return (
          <ProductCard
            key={product.id}
            id={card.id}
            price={card.price}
            name={card.name}
            rating={card.rating}
            reviews={card.reviews}
            imageUrl={card.imageUrl}
          />
        );
      })}
    </div>
  );
}

export default ProductGrid;
