// src/components/Header.jsx
import React from 'react';
import { useTheme } from '../context/ThemeContext';

export default function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="app-header" style={{
      background: 'var(--bg-header)',
      color: '#fff',
      padding: '1.2rem 0 1rem',
      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
      borderBottom: '3px solid var(--border-header)',
      transition: 'background 0.3s, border-color 0.3s'
    }}>
      <div className="container">
        <div className="d-flex flex-wrap align-items-center justify-content-between">
          <div>
            <h1 style={{ fontWeight: 600, fontSize: '1.8rem', margin: 0 }}>
              <i className="fas fa-waveform" style={{ color: '#7aa9ff', marginRight: 10 }} />
              Qwen Audio 3.0 TTS 基础音色库
            </h1>
            <div style={{ 
              fontSize: '0.95rem', 
              opacity: 0.8, 
              fontWeight: 300,
              paddingLeft: '1rem'
            }}>
              — qwen-audio-3.0 · 音色筛选 · 试听 · 复制 voice_id —
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className="theme-toggle"
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: '#fff',
              borderRadius: '50px',
              padding: '0.3rem 1rem',
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <i className={`fas fa-${theme === 'dark' ? 'moon' : 'sun'}`} style={{ marginRight: 6 }} />
            {theme === 'dark' ? '深色' : '浅色'}
          </button>
        </div>
      </div>
    </header>
  );
}
