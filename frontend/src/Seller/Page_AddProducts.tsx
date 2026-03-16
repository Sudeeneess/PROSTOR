import { useState } from "react";
import "./Seller/Page_AddProducts.css"; // Изменяем путь
import { useNavigate } from "react-router-dom";

interface ProductForm {
  name: string;
  description: string;
  article: string;
  price: string;
  photo: File | null;
}

const AddingProducts: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ProductForm>({
    name: '',
    description: '',
    article: '',
    price: '',
    photo: null
  });
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFormData((prev) => ({ ...prev, photo: selectedFile }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const apiFormData = new FormData();
      apiFormData.append('name', formData.name);
      apiFormData.append('description', formData.description);
      apiFormData.append('article', formData.article);
      apiFormData.append('price', formData.price);
      if (formData.photo) {
        apiFormData.append('photo', formData.photo);
      }

      // Replace with your actual API endpoint
      const response = await fetch('https://your-api-endpoint.com/products', {
        method: 'POST',
        body: apiFormData
      });

      if (!response.ok) {
        throw new Error('Ошибка добавления продукта');
      }

      const result = await response.json();
      console.log('Продукт успешно добавлен:', result);

      setSuccessMessage('Продукт успешно добавлен!');
      setTimeout(() => {
        navigate('/products');
      }, 2000);

    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Произошла ошибка');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    if (window.confirm('Вы уверены, что хотите удалить этот продукт?')) {
      console.log('Удаление продукта...');
    }
  };

  return (
    <div className="prostor-seller-app">
      <header className="header-section">
        <div className="logo-text">
            <span className="logo-prostor">prostor</span>
            <span className="logo-seller">Seller</span>
        </div>
        <nav className="navigation-bar">
          <a href="/" className="navigation-link">На главную</a>
          <a href="/products" className="navigation-link">Товары</a>
          <a href="/orders" className="navigation-link">Заказы</a>
          <a href="/profile" className="navigation-link">Личный кабинет</a>
        </nav>
      </header>

      <section className="content-section">
          
          <div className="auth-form-header">Товары</div>

  <div className="back-container">
    <a href="/back" className="back-link">Назад</a>
  </div>

        <form onSubmit={handleSubmit}>
          <div className="form-container">
            {/* Левая сторона формы */}
            <div>
              <div className="upload-section">
                <label htmlFor="photoUpload" className="upload-input">
                  + Загрузить фото
                  <input
                    type="file"
                    id="photoUpload"
                    hidden
                    onChange={handlePhotoChange}
                    accept="image/*"
                  />
                </label>
                {photoPreview && (
                  <div className="preview-image">
                    <img src={photoPreview} alt="Предпросмотр" />
                  </div>
                )}
              </div>

              <div className="button-section">
                <button type="submit" className="save-button" disabled={isLoading}>
                  {isLoading ? 'Сохранение...' : 'Сохранить'}
                </button>
                <button type="button" className="delete-button" onClick={handleDelete}>
                  Удалить
                </button>
              </div>
            </div>
            

            {/* Правая сторона формы */}
            <div>
              <div className="form-field">
                <label className="label-text" htmlFor="name">Название/предмет</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>

              <div className="form-field">
                <label className="label-text" htmlFor="description">Описание</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="input-field text-area"
                  required
                />
              </div>

              <div className="form-field">
                <label className="label-text" htmlFor="article">Артикул</label>
                <input
                  type="text"
                  id="article"
                  name="article"
                  value={formData.article}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>

              <div className="form-field">
                <label className="label-text" htmlFor="price">Цена</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          {errorMessage && (
            <p style={{ color: 'red' }}>{errorMessage}</p>
          )}

          {successMessage && (
            <p style={{ color: '#008000' }}>{successMessage}</p>
          )}
        </form>
      </section>
    </div>
  );
};

export default AddingProducts;