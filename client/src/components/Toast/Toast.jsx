import { createContext, useCallback, useContext, useState } from 'react';
import { cx } from '../../lib/cx.js';
import { Icon } from '../Icon/Icon.jsx';
import styles from './Toast.module.css';

const ToastContext = createContext(() => {});
const SHOW_MS = 4000;

/** Short confirmations ("Season saved") announced to screen readers. */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const toast = useCallback((message, tone = 'success') => {
    const id = crypto.randomUUID();
    setToasts((list) => [...list, { id, message, tone }]);
    setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), SHOW_MS);
  }, []);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className={styles.region} role="status" aria-live="polite">
        {toasts.map((t) => (
          <p key={t.id} className={cx(styles.toast, styles[t.tone])}>
            <Icon name={t.tone === 'error' ? 'error' : 'check_circle'} size="sm" />
            {t.message}
          </p>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
