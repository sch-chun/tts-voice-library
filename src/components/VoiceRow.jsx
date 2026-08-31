// src/components/VoiceRow.jsx
import React from 'react';

export default function VoiceRow({ item, audioUrl, isPlaying, onPlay, onCopy, onExclude, colDef, style }) {
  const genderCls = item.性别 === '男' ? 'gender-m' : item.性别 === '女' ? 'gender-f' : '';
  const langCls = item.语种 === '英文' ? 'lang-en' : '';
  const ageDisplay = item.年龄 && item.年龄 !== '不能' ? item.年龄 : '—';

  // 单元格公用样式：防止内容换行
  const cellStyle = {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  };

  return (
    <div
      style={{
        ...style,
        display: 'grid',
        gridTemplateColumns: colDef || '40px 1fr 70px 60px 90px 100px 60px 80px 60px',
        alignItems: 'center',
        padding: '0.4rem 0.4rem',
        boxSizing: 'border-box',
        transition: 'background 0.15s',
        cursor: 'default',
      }}
      onMouseEnter={(e) => { if (!isPlaying) e.currentTarget.style.background = 'var(--table-row-hover)'; }}
      onMouseLeave={(e) => { if (!isPlaying) e.currentTarget.style.background = 'var(--table-wrap-bg)'; }}
    >
      <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{item.序号 || ''}</div>
      <div style={cellStyle}><span className="voice-name">{item.名称 || ''}</span></div>
      <div><span className={`voice-tag ${genderCls}`}>{item.性别 || '—'}</span></div>
      <div style={{ fontSize: '0.85rem' }}>{ageDisplay}</div>
      <div className="cell-content" style={{ ...cellStyle, display: 'flex', alignItems: 'center', gap: '2px' }}>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.特质 || ''}</span>
        <button className="btn-exclude-cell" onClick={() => onExclude('trait', item.特质 || '')} title="排除/反选此特质">−</button>
      </div>
      <div className="cell-content" style={{ ...cellStyle, display: 'flex', alignItems: 'center', gap: '2px' }}>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.适用场景 || ''}</span>
        <button className="btn-exclude-cell" onClick={() => onExclude('scene', item.适用场景 || '')} title="排除/反选此场景">−</button>
      </div>
      <div><span className={`voice-tag ${langCls}`}>{item.语种 || ''}</span></div>
      <div style={{ textAlign: 'center' }}>
        <button className={`btn-icon play-btn ${isPlaying ? 'playing' : ''}`} onClick={onPlay} title="播放">
          <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
        </button>
      </div>
      <div style={{ textAlign: 'center' }}>
        <button className="btn-icon copy-btn" onClick={(e) => onCopy(item.voice参数 || '', e.currentTarget)} title="复制 voice_id">
          <i className="fas fa-copy"></i>
        </button>
      </div>
    </div>
  );
}
