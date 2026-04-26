'use client';

import React from 'react';

export default function Footer() {
  return (
    <footer style={{
      padding: '30px 4% 30px',
      borderTop: '1px solid rgba(255,255,255,0.1)',
      color: 'rgba(255,255,255,0.5)',
      textAlign: 'center',
      marginTop: 'auto'
    }}>
      <p style={{ marginBottom: '8px' }}>© 2026 LUMINA PLAY</p>
      <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>Developed with ❤️ by Dinh Binh</p>
    </footer>
  );
}
