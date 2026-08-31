// src/components/Toast.jsx
import React, { useEffect, useState } from 'react';

export default function Toast({ message, icon, visible }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (visible && message) {
      setShow(true);
      const t = setTimeout(() => setShow(false), 2000);
      return () => clearTimeout(t);
    }
  }, [visible, message]);

  if (!show || !message) return null;

  return (
    <div className="toast-container">
      <div className={`toast show`} style={{
        background: 'var(--toast-bg)',
        color: 'var(--toast-text)',
        border: '1px solid var(--toast-border)',
        borderRadius: 12,
        padding: '0.8rem 1.2rem',
        minWidth: 200,
        boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
        transition: 'opacity 0.3s, transform 0.3s'
      }}>
        <i className={`fas fa-${icon || 'info-circle'}`} style={{ marginRight: 8 }} />
        {message}
      </div>
    </div>
  );
}
