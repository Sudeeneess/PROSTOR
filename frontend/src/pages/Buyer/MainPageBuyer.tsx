import React from 'react';
import Header from './HeaderBuyer';
import ProductGrid from '../../ProstorMain/ProductGrid';
import './MainPageBuyer.css'; 

const MainPageBuyer: React.FC = () => {
  return (
    <div className="buyer-page">
      <Header />
      <main className="buyer-main-content">
        <ProductGrid />
      </main>
    </div>
  );
};

export default MainPageBuyer;