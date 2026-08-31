// src/components/VoiceTable.jsx
import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import FilterBar from './FilterBar';
import VoiceRow from './VoiceRow';
import StatsBar from './StatsBar';

const ROW_HEIGHT = 48;

export default function VoiceTable({ tab, data, onToast }) {
  const [filtered, setFiltered] = useState(data);
  const [sortOrder, setSortOrder] = useState('none');
  const [playingID, setPlayingID] = useState(null);
  const audioRef = useRef(new Audio());

  useEffect(() => {
    setFiltered(data);
  }, [data]);

  const handleFilterChange = useCallback((newFiltered) => {
    setFiltered(newFiltered);
  }, []);

  const handleSort = useCallback((order) => {
    setSortOrder(order);
  }, []);

  const handlePlay = useCallback((rowID, audioUrl, filename) => {
    const audio = audioRef.current;
    if (playingID === rowID && !audio.paused) {
      audio.pause();
      setPlayingID(null);
      return;
    }
    if (playingID) setPlayingID(null);
    audio.src = audioUrl;
    audio.load();
    audio.play().then(() => {
      setPlayingID(rowID);
      onToast(`🎵 播放: ${filename || '音色'}`, 'music');
    }).catch(() => {
      onToast('⚠️ 无法播放，检查路径', 'exclamation-triangle');
      setPlayingID(null);
    });
  }, [playingID, onToast]);

  useEffect(() => {
    const audio = audioRef.current;
    const onEnd = () => setPlayingID(null);
    const onError = () => { setPlayingID(null); onToast('⚠️ 音频加载失败', 'exclamation-triangle'); };
    audio.addEventListener('ended', onEnd);
    audio.addEventListener('error', onError);
    return () => { audio.removeEventListener('ended', onEnd); audio.removeEventListener('error', onError); };
  }, [onToast]);

  const sortedData = useMemo(() => {
    if (sortOrder === 'none') return filtered;
    const sorted = [...filtered];
    sorted.sort((a, b) => {
      const ageA = parseAge(a.年龄);
      const ageB = parseAge(b.年龄);
      if (ageA === null && ageB === null) return 0;
      if (ageA === null) return 1;
      if (ageB === null) return -1;
      return sortOrder === 'asc' ? ageA - ageB : ageB - ageA;
    });
    return sorted;
  }, [filtered, sortOrder]);

  const tableContainerRef = useRef(null);
  const rowVirtualizer = useVirtualizer({
    count: sortedData.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 8,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();

  // 列宽定义：名称列占用剩余空间，其余固定
  const colDef = '40px 1fr 70px 60px 150px 200px 60px 80px 60px';

  return (
    <div className="table-wrap" style={{
      background: 'var(--table-wrap-bg)',
      borderRadius: 16,
      border: '1px solid var(--table-wrap-border)',
      overflow: 'hidden',
      transition: 'background 0.2s, border-color 0.2s'
    }}>
      <FilterBar
        tab={tab}
        data={data}
        onFilterChange={handleFilterChange}
        onSortChange={handleSort}
        sortOrder={sortOrder}
        onToast={onToast}
      />

      <div
        ref={tableContainerRef}
        className="table-scroll"
        style={{
          maxHeight: '62vh',
          overflowY: 'auto',
          position: 'relative',
          background: 'var(--table-wrap-bg)',
          transition: 'background 0.2s'
        }}
      >
        {/* 表头 */}
        <div className="voice-grid-header" style={{
          display: 'grid',
          gridTemplateColumns: colDef,
          background: 'var(--table-header-bg)',
          color: 'var(--table-header-text)',
          borderBottom: '2px solid var(--table-header-border)',
          fontWeight: 600,
          fontSize: '0.8rem',
          textTransform: 'uppercase',
          padding: '0.7rem 0.4rem',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          transition: 'background 0.2s, color 0.2s, border-color 0.2s'
        }}>
          <div>#</div>
          <div>名称</div>
          <div>性别</div>
          <div style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => {
            const next = sortOrder === 'none' ? 'asc' : sortOrder === 'asc' ? 'desc' : 'none';
            handleSort(next);
          }}>
            年龄 <i className={`fas ${sortOrder === 'asc' ? 'fa-sort-up' : sortOrder === 'desc' ? 'fa-sort-down' : 'fa-sort'}`} style={{ opacity: 0.6 }} />
          </div>
          <div>特质</div>
          <div>场景</div>
          <div>语种</div>
          <div style={{ textAlign: 'center' }}>试听</div>
          <div style={{ textAlign: 'center' }}>复制</div>
        </div>

        {/* 表体 */}
        <div style={{ position: 'relative', height: `${rowVirtualizer.getTotalSize()}px` }}>
          {virtualRows.map(virtualRow => {
            const item = sortedData[virtualRow.index];
            const audioUrl = getAudioUrl(item.预览音频文件名);
            const isPlaying = playingID === (item.voice参数 || item.序号);
            return (
              <VoiceRow
                key={virtualRow.key}
                item={item}
                audioUrl={audioUrl}
                isPlaying={isPlaying}
                onPlay={() => handlePlay(item.voice参数 || item.序号, audioUrl, item.预览音频文件名)}
                onCopy={(voiceId, btn) => {
                  if (!voiceId) { onToast('⚠️ 没有可复制的 voice_id', 'exclamation-triangle'); return; }
                  if (navigator.clipboard?.writeText) {
                    navigator.clipboard.writeText(voiceId)
                      .then(() => {
                        onToast(`✅ 已复制: ${voiceId}`, 'check-circle');
                        const orig = btn.innerHTML;
                        btn.innerHTML = '<i class="fas fa-check"></i>';
                        setTimeout(() => btn.innerHTML = orig, 1200);
                      })
                      .catch(() => onToast('⚠️ 复制失败，请手动复制', 'exclamation-triangle'));
                  } else {
                    onToast('⚠️ 您的浏览器不支持自动复制，请手动复制', 'exclamation-triangle');
                  }
                }}
                onExclude={(type, value) => {
                  const event = new CustomEvent('exclude-click', { detail: { tab, type, value } });
                  document.dispatchEvent(event);
                }}
                colDef={colDef}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: ROW_HEIGHT,
                  transform: `translateY(${virtualRow.start}px)`,
                  background: isPlaying ? 'var(--table-row-playing)' : 'var(--table-wrap-bg)',
                  transition: 'background 0.15s',
                  borderBottom: '1px solid var(--table-cell-border)',
                }}
              />
            );
          })}
        </div>
        {sortedData.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--empty-color)' }}>
            <i className="fas fa-filter me-2" /> 没有匹配的音色
          </div>
        )}
      </div>

      <StatsBar count={sortedData.length} total={data.length} />
    </div>
  );
}

function parseAge(val) {
  if (!val || val === '不能' || val === '—') return null;
  const num = Number(val);
  return isNaN(num) ? null : num;
}

function getAudioUrl(filename) {
  if (!filename) return '';
  // 如果已经是完整 URL，直接返回
  if (filename.startsWith('http://') || filename.startsWith('https://')) return filename;
  // 从环境变量获取基础 URL，默认为本地开发路径
  const base = import.meta.env.VITE_AUDIO_BASE_URL || './audio/';
  return base + filename;
}
