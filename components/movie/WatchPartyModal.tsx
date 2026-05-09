'use client';

import React, { useState } from 'react';
import { X, Copy, Users, Play, Link as LinkIcon, Check } from 'lucide-react';
import styles from './WatchPartyModal.module.css';

interface WatchPartyModalProps {
  isOpen: boolean;
  onClose: () => void;
  peerId: string;
  onJoin: (id: string) => void;
}

export default function WatchPartyModal({ isOpen, onClose, peerId, onJoin }: WatchPartyModalProps) {
  const [joinId, setJoinId] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const copyId = () => {
    navigator.clipboard.writeText(peerId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>
          <X size={24} />
        </button>

        <div className={styles.header}>
          <Users size={32} className={styles.icon} />
          <h2>Watch Party</h2>
          <p>Watch movies together with friends in real-time.</p>
        </div>

        <div className={styles.section}>
          <h3>Host a Party</h3>
          <div className={styles.idBox}>
            <span className={styles.idLabel}>Your Room ID:</span>
            <div className={styles.idRow}>
              <code>{peerId || 'Generating...'}</code>
              <button className={styles.copyBtn} onClick={copyId}>
                {copied ? <Check size={18} color="#4caf50" /> : <Copy size={18} />}
              </button>
            </div>
          </div>
          <p className={styles.hint}>Share this ID with your friends to let them join.</p>
        </div>

        <div className={styles.divider}>
          <span>OR</span>
        </div>

        <div className={styles.section}>
          <h3>Join a Party</h3>
          <div className={styles.inputRow}>
            <input 
              type="text" 
              placeholder="Enter Room ID..." 
              value={joinId}
              onChange={e => setJoinId(e.target.value)}
              className={styles.input}
            />
            <button 
              className={styles.joinBtn}
              onClick={() => onJoin(joinId)}
              disabled={!joinId}
            >
              Join
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
