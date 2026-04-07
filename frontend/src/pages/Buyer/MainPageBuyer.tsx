import React from 'react';
import HeaderMain from '../../components/HeaderMain';
import ProductGrid from '../../components/ProductGrid';
import styles from './MainPageBuyer.module.css'; 

const MainPageBuyer: React.FC = () => {
  return (
    <div className={styles['buyer-page']}>
      <HeaderMain variant="buyer" />
      <main className={styles['buyer-main-content']}>
        <ProductGrid />
      </main>
    </div>
  );
};

export default MainPageBuyer;