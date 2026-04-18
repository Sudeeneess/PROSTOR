import React from 'react';
import HeaderMain from '../../components/HeaderMain';
import ApiProductGrid from '../../components/ApiProductGrid';
import styles from './MainPageBuyer.module.css'; 

const MainPageBuyer: React.FC = () => {
  return (
    <div className={styles['buyer-page']}>
      <HeaderMain variant="buyer" />
      <main className={styles['buyer-main-content']}>
        <ApiProductGrid limit={16} />
      </main>
    </div>
  );
};

export default MainPageBuyer;