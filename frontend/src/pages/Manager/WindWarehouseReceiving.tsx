import React from 'react';
import styles from './WindWarehouseReceiving.module.css';

export interface ReceptionLine {
  productName: string;
  quantity: number;
}

interface WindWarehouseReceivingProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void | Promise<void>;
  sellerTitle: string;
  sellerSubtitle?: string;
  batchDateLabel: string;
  lines: ReceptionLine[];
  completeDisabled?: boolean;
  linesLoading?: boolean;
  footerNote?: string;
}

const WindWarehouseReceiving: React.FC<WindWarehouseReceivingProps> = ({
  isOpen,
  onClose,
  onComplete,
  sellerTitle,
  sellerSubtitle,
  batchDateLabel,
  lines,
  completeDisabled = false,
  linesLoading = false,
  footerNote,
}) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const [completeBusy, setCompleteBusy] = React.useState(false);

  const handleCompleteReception = () => {
    if (completeDisabled || completeBusy || linesLoading) return;
    void (async () => {
      setCompleteBusy(true);
      try {
        await Promise.resolve(onComplete());
        onClose();
      } finally {
        setCompleteBusy(false);
      }
    })();
  };

  return (
    <div className={styles['wind-warehouse-receiving-overlay']} onClick={handleOverlayClick}>
      <div className={styles['wind-warehouse-receiving-modal']}>
        <div className={styles['wind-warehouse-receiving-header']}>
          <div>
            <h2 className={styles['wind-warehouse-receiving-title']}>Приёмка новых товаров</h2>
            <p className={styles['wind-warehouse-receiving-subtitle']}>
              {sellerTitle}
              {sellerSubtitle ? ` · ${sellerSubtitle}` : ''}
            </p>
            <p className={styles['wind-warehouse-receiving-meta']}>Дата создания приёмки: {batchDateLabel}</p>
          </div>
          <button type="button" className={styles['wind-warehouse-receiving-close']} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles['wind-warehouse-receiving-content']}>
          <div className={styles['wind-warehouse-receiving-table-container']}>
            <table className={styles['wind-warehouse-receiving-table']}>
              <thead>
                <tr>
                  <th>Товар</th>
                  <th>Количество на складе</th>
                </tr>
              </thead>
              <tbody>
                {linesLoading ? (
                  <tr>
                    <td colSpan={2} className={styles['wind-warehouse-receiving-empty']}>
                      Загрузка позиций…
                    </td>
                  </tr>
                ) : lines.length === 0 ? (
                  <tr>
                    <td colSpan={2} className={styles['wind-warehouse-receiving-empty']}>
                      Нет позиций
                    </td>
                  </tr>
                ) : (
                  lines.map((line, index) => (
                    <tr key={`${line.productName}-${index}`}>
                      <td className={styles['wind-warehouse-receiving-product-name']}>{line.productName}</td>
                      <td>{line.quantity}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className={styles['wind-warehouse-receiving-footer']}>
          {footerNote ? (
            <p className={styles['wind-warehouse-receiving-meta']} style={{ marginBottom: '0.75rem' }}>
              {footerNote}
            </p>
          ) : null}
          <button
            type="button"
            className={`${styles['wind-warehouse-receiving-button']} ${styles['wind-warehouse-receiving-complete-button']}`}
            onClick={handleCompleteReception}
            disabled={completeDisabled || linesLoading || completeBusy}
          >
            {completeDisabled
              ? 'Уже принято'
              : completeBusy
                ? 'Сохранение…'
                : 'Завершить приёмку'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WindWarehouseReceiving;
