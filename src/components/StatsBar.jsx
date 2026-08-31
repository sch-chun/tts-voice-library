// src/components/StatsBar.jsx
import React from 'react';

export default function StatsBar({ count, total }) {
  return (
    <div className="stats-bar" style={{
      padding: '0.5rem 1.5rem',
      background: 'var(--stats-bg)',
      borderTop: '1px solid var(--stats-border)',
      fontSize: '0.85rem',
      color: 'var(--stats-text)',
      transition: 'background 0.2s, border-color 0.2s, color 0.2s',
      display: 'flex',
      justifyContent: 'space-between'
    }}>
      <span>共 <strong style={{ color: 'var(--stats-strong)' }}>{count}</strong> 个</span>
      <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>
        {count === total ? '显示全部' : `筛选出 ${count} 个 (共 ${total} 个)`}
      </span>
    </div>
  );
}
