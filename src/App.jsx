// src/App.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import Header from './components/Header';
import VoiceTable from './components/VoiceTable';
import Toast from './components/Toast';
import './App.css';

function AppContent() {
  const [voices, setVoices] = useState({ flash: [], plus: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('flash');
  const [toast, setToast] = useState({ message: '', visible: false, icon: 'info-circle' });

  const showToast = useCallback((msg, icon = 'info-circle') => {
    setToast({ message: msg, icon, visible: true });
    clearTimeout(window.toastTimer);
    window.toastTimer = setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 2000);
  }, []);

  useEffect(() => {
    fetch('/voices.json')
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(data => {
        setVoices({ flash: data.flash || [], plus: data.plus || [] });
        setLoading(false);
        const total = (data.flash?.length || 0) + (data.plus?.length || 0);
        showToast(`✅ 加载成功 · ${total} 个音色`, 'check-circle');
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
        showToast(`❌ 数据加载失败: ${err.message}`, 'times-circle');
      });
  }, []);

  const currentData = useMemo(() => voices[activeTab] || [], [voices, activeTab]);

  if (loading) {
    return (
      <div className="app" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="app" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#c0392b' }}>
        <div style={{ textAlign: 'center' }}>
          <i className="fas fa-exclamation-triangle" style={{ fontSize: '2rem' }} />
          <p><strong>数据加载失败</strong></p>
          <p className="small">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <Header />
      <main className="container py-4" style={{ flex: 1 }}>
        {/* 选项卡 */}
        <ul className="nav nav-tabs mb-3" role="tablist">
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === 'flash' ? 'active' : ''}`}
              onClick={() => setActiveTab('flash')}
              type="button"
              role="tab"
            >
              <i className="fas fa-bolt"></i> Flash
              <span className="tab-badge">{voices.flash.length}</span>
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === 'plus' ? 'active' : ''}`}
              onClick={() => setActiveTab('plus')}
              type="button"
              role="tab"
            >
              <i className="fas fa-plus-circle"></i> Plus
              <span className="tab-badge">{voices.plus.length}</span>
            </button>
          </li>
        </ul>

        <VoiceTable
          key={activeTab}
          tab={activeTab}
          data={currentData}
          onToast={showToast}
        />
        <div className="text-center text-muted small mt-4 pt-2 border-top">
          <i className="fas fa-music me-1"></i> 点击 <i className="fas fa-play-circle mx-1 text-primary"></i> 播放 · 点击 <i className="fas fa-copy mx-1 text-success"></i> 复制 voice_id · 共 <strong>{currentData.length}</strong> 个音色
        </div>
      </main>
      <Toast message={toast.message} icon={toast.icon} visible={toast.visible} />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
