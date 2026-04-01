import { useState } from "react";
import { useNavigate } from "react-router-dom";
import HeaderSeller from "./HeaderSeller";
import "./AddProducts.css";

interface ProductForm {
  name: string;
  description: string;
  article: string;
  price: string;
  photo: File | null;
}

interface Product {
  id: number;
  name: string;
  description: string;
  sku: string;
  price: string;
  selected: boolean;
}

const AddingProducts: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<ProductForm>({
    name: "",
    description: "",
    article: "",
    price: "",
    photo: null,
  });

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setFormData((prev) => ({ ...prev, photo: file }));

      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Проверяем, заполнены ли обязательные поля
    if (!formData.name || !formData.price) {
      alert("Пожалуйста, заполните название и цену товара");
      return;
    }

    // Получаем существующие товары из localStorage
    const savedProducts = localStorage.getItem("sellerProducts");
    let existingProducts: Product[] = savedProducts ? JSON.parse(savedProducts) : [];
    
    // Создаем новый товар
    const newId = existingProducts.length > 0 
      ? Math.max(...existingProducts.map(p => p.id)) + 1 
      : 1;
    
    const newProduct: Product = {
      id: newId,
      name: formData.name,
      description: formData.description || "Описание отсутствует",
      sku: formData.article || `SKU${newId}`,
      price: formData.price,
      selected: false,
    };
    
    // Сохраняем фото в localStorage, если оно есть
    if (photoPreview) {
      // Сохраняем фото товара отдельно
      const productPhotos = localStorage.getItem("sellerProductPhotos");
      const photos = productPhotos ? JSON.parse(productPhotos) : {};
      photos[newId] = photoPreview;
      localStorage.setItem("sellerProductPhotos", JSON.stringify(photos));
    }
    
    // Добавляем новый товар к существующим
    const updatedProducts = [...existingProducts, newProduct];
    
    // Сохраняем в localStorage
    localStorage.setItem("sellerProducts", JSON.stringify(updatedProducts));
    
    console.log("Товар сохранен:", newProduct);
    console.log("Все товары:", updatedProducts);
    
    // Перенаправляем на страницу личного кабинета продавца
    navigate("/seller/dashboard");
  };

  const handleBack = () => {
    navigate("/seller/dashboard"); // Возврат на страницу PersonalSeller
  };

  return (
    <div className="page">
      <HeaderSeller />

      <div className="form-card">
        <div className="form-header">
          <div className="form-title">Добавление товара</div>
          <button className="back-button" onClick={handleBack}>
            ← Назад
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            {/* LEFT */}
            <div>
              <label className="upload">
                {photoPreview ? (
                  <img src={photoPreview} className="preview" alt="Preview" />
                ) : (
                  <span>+ Загрузить фото</span>
                )}
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handlePhotoChange}
                />
              </label>

              <button type="submit" className="btn-save">
                Сохранить товар
              </button>
            </div>

            {/* RIGHT */}
            <div>
              <input
                name="name"
                placeholder="Название/предмет *"
                value={formData.name}
                onChange={handleInputChange}
                required
              />

              <textarea
                name="description"
                placeholder="Описание"
                value={formData.description}
                onChange={handleInputChange}
              />

              <input
                name="article"
                placeholder="Артикул"
                value={formData.article}
                onChange={handleInputChange}
              />

              <input
                name="price"
                type="number"
                placeholder="Цена *"
                value={formData.price}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddingProducts;