'use client';

import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock } from 'lucide-react';
import styles from './PinOverlay.module.css';

export default function PinOverlay() {
  const { isPinLocked, pin, setPinLocked } = useStore();
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);

  if (!isPinLocked || !pin) return null;

  const handleInput = (digit: string) => {
    if (input.length >= 4) return;
    const newInput = input + digit;
    setInput(newInput);
    setError(false);

    if (newInput.length === 4) {
      if (newInput === pin) {
        setPinLocked(false);
        setInput('');
      } else {
        setError(true);
        setTimeout(() => setInput(''), 500);
      }
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        className={styles.overlay}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div 
          className={styles.container}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 20 }}
        >
          <div className={styles.logo}>LUMINA</div>
          <Lock size={32} className={styles.lockIcon} />
          <h2>Nhập mã khóa</h2>
          <p>Trang web đang được bảo vệ bởi mã PIN</p>

          <div className={`${styles.pinDisplay} ${error ? styles.error : ''}`}>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className={`${styles.dot} ${input.length > i ? styles.active : ''}`} />
            ))}
          </div>

          <div className={styles.numpad}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num) => (
              <button 
                key={num} 
                onClick={() => handleInput(num.toString())}
                className={styles.numBtn}
              >
                {num}
              </button>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
