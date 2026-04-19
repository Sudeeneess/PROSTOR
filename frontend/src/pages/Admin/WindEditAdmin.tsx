import React, { useState, useEffect } from 'react';
import styles from './WindEditAdmin.module.css';
import type { AdminUserDto } from '../../services/api';

export interface WindEditSavePayload {
  userName: string;
  contactPhone: string;
  roleId: number;
  password: string;
  shouldDelete: boolean;
}

export type WindEditVariant = 'manager' | 'customer_or_seller' | 'admin_view';

interface WindEditAdminProps {
  isOpen: boolean;
  onClose: () => void;
  userData: AdminUserDto | null;
  variant: WindEditVariant;
  /** id роли WAREHOUSE_MANAGER для сохранения менеджера */
  warehouseManagerRoleId: number;
  onSave: (payload: WindEditSavePayload) => Promise<void>;
}

const WindEditAdmin: React.FC<WindEditAdminProps> = ({
  isOpen,
  onClose,
  userData,
  variant,
  warehouseManagerRoleId,
  onSave,
}) => {
  const [userName, setUserName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [password, setPassword] = useState('');
  const [shouldDelete, setShouldDelete] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isManager = variant === 'manager';
  const isViewDelete = variant === 'customer_or_seller';
  const isAdminView = variant === 'admin_view';

  useEffect(() => {
    if (userData) {
      setUserName(userData.userName || '');
      setContactPhone(userData.contactPhone || '');
      setPassword('');
      setShouldDelete(false);
      setError(null);
    }
  }, [userData]);

  if (!isOpen || !userData) return null;

  const roleLabel = (() => {
    const n = userData.role?.name ?? '';
    switch (n) {
      case 'ADMIN':
        return 'Администратор';
      case 'CUSTOMER':
        return 'Покупатель';
      case 'SELLER':
        return 'Продавец';
      case 'WAREHOUSE_MANAGER':
        return 'Менеджер склада';
      default:
        return n || '—';
    }
  })();

  const handlePrimary = async () => {
    setError(null);

    if (shouldDelete) {
      setSaving(true);
      try {
        await onSave({
          userName,
          contactPhone,
          roleId: userData.role?.id ?? 0,
          password: '',
          shouldDelete: true,
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Ошибка удаления');
      } finally {
        setSaving(false);
      }
      return;
    }

    if (!isManager) {
      return;
    }

    if (!userName.trim()) {
      setError('Укажите логин');
      return;
    }
    if (!/^\d{11}$/.test(contactPhone.trim())) {
      setError('Телефон: ровно 11 цифр');
      return;
    }
    if (!password.trim()) {
      setError(
        'Укажите пароль: текущий API требует непустой пароль в теле PUT при обновлении пользователя'
      );
      return;
    }
    if (warehouseManagerRoleId <= 0) {
      setError('Не загружена роль менеджера склада. Обновите страницу.');
      return;
    }

    setSaving(true);
    try {
      await onSave({
        userName: userName.trim(),
        contactPhone: contactPhone.trim(),
        roleId: warehouseManagerRoleId,
        password: password.trim(),
        shouldDelete: false,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  const handleFooterClick = () => {
    if (isAdminView) {
      onClose();
      return;
    }
    if (isViewDelete && !shouldDelete) {
      onClose();
      return;
    }
    void handlePrimary();
  };

  const title =
    isManager
      ? 'Редактирование менеджера склада'
      : isViewDelete
        ? 'Просмотр: покупатель / продавец'
        : 'Просмотр: администратор';

  return (
    <div className={styles['admin-wind-edit-overlay']} onClick={onClose}>
      <div className={styles['admin-wind-edit-modal']} onClick={(e) => e.stopPropagation()}>
        <div className={styles['admin-wind-edit-header']}>
          <h2>{title}</h2>
          <button type="button" className={styles['admin-wind-edit-close']} onClick={onClose}>
            {'\u00d7'}
          </button>
        </div>

        <div className={styles['admin-wind-edit-content']}>
          <div className={styles['admin-wind-edit-user-info-section']}>
            <h3>Данные</h3>

            <div className={styles['admin-wind-edit-form-group']}>
              <label>Логин:</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Логин"
                disabled={!isManager || shouldDelete}
              />
            </div>

            <div className={styles['admin-wind-edit-form-group']}>
              <label>Телефон (11 цифр):</label>
              <input
                type="text"
                inputMode="numeric"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                placeholder="79991234567"
                disabled={!isManager || shouldDelete}
              />
            </div>

            {isManager && (
              <div className={styles['admin-wind-edit-form-group']}>
                <label>Роль:</label>
                <input type="text" value="Менеджер склада" disabled />
              </div>
            )}

            {!isManager && (
              <div className={styles['admin-wind-edit-form-group']}>
                <label>Роль:</label>
                <input type="text" value={roleLabel} disabled />
              </div>
            )}

            {isManager && (
              <div className={styles['admin-wind-edit-form-group']}>
                <label>Новый пароль:</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Обязательно для сохранения"
                  disabled={shouldDelete}
                  autoComplete="new-password"
                />
              </div>
            )}
          </div>

          {!isAdminView && (
            <div className={styles['admin-wind-edit-actions-section']}>
              <h3>Действия</h3>
              <div className={styles['admin-wind-edit-action-buttons']}>
                <button
                  type="button"
                  className={`${styles['admin-wind-edit-action-button']} ${styles['admin-wind-edit-delete-button']} ${shouldDelete ? styles['admin-wind-edit-active'] : ''}`}
                  onClick={() => setShouldDelete((v) => !v)}
                >
                  Удалить пользователя
                </button>
              </div>
            </div>
          )}

          {isAdminView && (
            <p className={styles['admin-wind-edit-hint']}>
              Учётные записи администраторов только для просмотра.
            </p>
          )}

          {error && (
            <p className={styles['admin-wind-edit-error']} role="alert">
              {error}
            </p>
          )}
        </div>

        <div className={styles['admin-wind-edit-footer']}>
          <button
            type="button"
            className={styles['admin-wind-edit-save-button']}
            onClick={handleFooterClick}
            disabled={saving}
          >
            {saving
              ? 'Сохранение…'
              : isAdminView || (isViewDelete && !shouldDelete)
                ? 'Закрыть'
                : shouldDelete
                  ? 'Подтвердить удаление'
                  : 'Сохранить изменения'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WindEditAdmin;
