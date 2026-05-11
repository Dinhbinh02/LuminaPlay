'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useToastStore, ToastType } from '@/store/useToastStore';
import styles from './Toast.module.css';

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle className={styles.iconSuccess} />,
  error: <XCircle className={styles.iconError} />,
  info: <Info className={styles.iconInfo} />,
  warning: <AlertTriangle className={styles.iconWarning} />,
};

export const ToastContainer = () => {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className={styles.container}>
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
            className={`${styles.toast} ${styles[toast.type]}`}
          >
            <div className={styles.icon}>{icons[toast.type]}</div>
            <div className={styles.message}>{toast.message}</div>
            <button
              onClick={() => removeToast(toast.id)}
              className={styles.closeBtn}
            >
              <X size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
