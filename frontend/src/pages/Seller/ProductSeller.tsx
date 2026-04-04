import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HeaderSeller from "./HeaderSeller";
import styles from './ProductSeller.module.css';

interface Product {
  id: number;
  name: string;
  description: string;
  sku: string;
  price: string;
  selected: boolean;
}

const ProductSeller: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const navigate = useNavigate();

  // Загрузка данных
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = () => {
    const savedProducts = localStorage.getItem("sellerProducts");
    
    console.log("Загруженные товары:", savedProducts);
    
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    } else {
      const initialProducts: Product[] = [
        {
          id: 1,
          name: "Товар 1",
          description: "Описание товара 1",
          sku: "SKU001",
          price: "1000",
          selected: false,
        },
        {
          id: 2,
          name: "Товар 2",
          description: "Описание товара 2",
          sku: "SKU002",
          price: "2000",
          selected: false,
        },
      ];
      setProducts(initialProducts);
      saveToLocalStorage(initialProducts);
    }
  };

  // Функция для сохранения в localStorage
  const saveToLocalStorage = (productsToSave: Product[]) => {
    if (productsToSave.length > 0) {
      localStorage.setItem("sellerProducts", JSON.stringify(productsToSave));
      console.log("Сохранено в localStorage:", productsToSave);
    } else {
      localStorage.removeItem("sellerProducts");
      console.log("LocalStorage очищен");
    }
  };

  // Функция для обновления товаров
  const updateProducts = (newProducts: Product[]) => {
    setProducts(newProducts);
    saveToLocalStorage(newProducts);
  };

  const toggleSelect = (id: number) => {
    const updatedProducts = products.map((p) =>
      p.id === id ? { ...p, selected: !p.selected } : p
    );
    updateProducts(updatedProducts);
  };

  const addNewProduct = () => {
    const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
    const newProduct: Product = {
      id: newId,
      name: "Новый товар",
      description: "Описание",
      sku: "SKU" + newId,
      price: "0",
      selected: false,
    };
    const updatedProducts = [...products, newProduct];
    updateProducts(updatedProducts);
  };

  const deleteSelected = () => {
    const selectedProducts = products.filter(p => p.selected);
    if (selectedProducts.length === 0) {
      return;
    }
    const remainingProducts = products.filter((p) => !p.selected);
    updateProducts(remainingProducts);
  };

  const openEditModal = () => {
    const selectedProducts = products.filter(p => p.selected);
    if (selectedProducts.length === 0 || selectedProducts.length > 1) {
      return;
    }
    setEditingProduct({ ...selectedProducts[0] });
    setIsEditModalOpen(true);
  };

  const saveEditedProduct = () => {
    if (editingProduct) {
      const updatedProducts = products.map((p) =>
        p.id === editingProduct.id ? { ...editingProduct, selected: p.selected } : p
      );
      updateProducts(updatedProducts);
      setIsEditModalOpen(false);
      setEditingProduct(null);
      console.log("Товар отредактирован:", editingProduct);
    }
  };

  return (
    <div className={styles['seller-prod-container']}>
      <HeaderSeller />

      <div className={styles['seller-prod-content']}>
        <div className={styles['seller-prod-top-bar']}>
          <h2>Мои товары</h2>
          <button className={styles['seller-prod-add-btn']} onClick={addNewProduct}>
            + Добавить товар
          </button>
        </div>

        {products.length === 0 ? (
          <div className={styles['seller-prod-empty-state']}>
            <p>У вас пока нет товаров</p>
            <button onClick={addNewProduct} className={styles['seller-prod-add-first-btn']}>
              Добавить первый товар
            </button>
          </div>
        ) : (
          <>
            <div className={styles['seller-prod-table']}>
              <div className={styles['seller-prod-table-header']}>
                <span>Название</span>
                <span>Описание</span>
                <span>Артикул</span>
                <span>Цена</span>
                <span>Выбрать</span>
              </div>

              {products.map((product) => (
                <div key={product.id} className={styles['seller-prod-table-row']}>
                  <input
                    type="text"
                    value={product.name}
                    readOnly
                    className={styles['seller-prod-readonly-input']}
                  />
                  <input
                    type="text"
                    value={product.description}
                    readOnly
                    className={styles['seller-prod-readonly-input']}
                  />
                  <input
                    type="text"
                    value={product.sku}
                    readOnly
                    className={styles['seller-prod-readonly-input']}
                  />
                  <input
                    type="text"
                    value={product.price}
                    readOnly
                    className={styles['seller-prod-readonly-input']}
                  />
                  <input
                    type="checkbox"
                    checked={product.selected}
                    onChange={() => toggleSelect(product.id)}
                    className={styles['seller-prod-checkbox-input']}
                  />
                </div>
              ))}
            </div>

            <div className={styles['seller-prod-actions']}>
              <button className={styles['seller-prod-delete-btn']} onClick={deleteSelected}>
                🗑 Удалить выбранные
              </button>
              <button className={styles['seller-prod-edit-btn']} onClick={openEditModal}>
                ✏ Редактировать выбранный
              </button>
            </div>
          </>
        )}
      </div>

      {isEditModalOpen && editingProduct && (
        <div className={styles['seller-prod-modal-overlay']}>
          <div className={styles['seller-prod-modal-content']}>
            <h2>Редактирование товара</h2>
            
            <div className={styles['seller-prod-edit-form']}>
              <div className={styles['seller-prod-form-group']}>
                <label>Название товара:</label>
                <input
                  type="text"
                  value={editingProduct.name}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, name: e.target.value })
                  }
                  className={styles['seller-prod-edit-input']}
                />
              </div>

              <div className={styles['seller-prod-form-group']}>
                <label>Описание:</label>
                <textarea
                  value={editingProduct.description}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, description: e.target.value })
                  }
                  className={styles['seller-prod-edit-textarea']}
                  rows={3}
                />
              </div>

              <div className={styles['seller-prod-form-group']}>
                <label>Артикул:</label>
                <input
                  type="text"
                  value={editingProduct.sku}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, sku: e.target.value })
                  }
                  className={styles['seller-prod-edit-input']}
                />
              </div>

              <div className={styles['seller-prod-form-group']}>
                <label>Цена (₽):</label>
                <input
                  type="number"
                  value={editingProduct.price}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, price: e.target.value })
                  }
                  className={styles['seller-prod-edit-input']}
                />
              </div>
            </div>

            <div className={styles['seller-prod-modal-buttons']}>
              <button onClick={saveEditedProduct} className={styles['seller-prod-save-btn']}>
                Сохранить изменения
              </button>
              <button 
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingProduct(null);
                }} 
                className={styles['seller-prod-cancel-btn']}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductSeller;