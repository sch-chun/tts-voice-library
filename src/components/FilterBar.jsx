import React, { useState, useEffect, useMemo } from 'react';

export default function FilterBar({ tab, data, onFilterChange, onSortChange, sortOrder, onToast }) {
  // 筛选状态
  const [search, setSearch] = useState('');
  const [gender, setGender] = useState('');
  const [lang, setLang] = useState('');
  const [ageMin, setAgeMin] = useState('');
  const [ageMax, setAgeMax] = useState('');
  const [traitSelected, setTraitSelected] = useState([]);
  const [sceneSelected, setSceneSelected] = useState([]);
  const [traitMode, setTraitMode] = useState('include');
  const [sceneMode, setSceneMode] = useState('include');

  // 从数据中提取所有特质和场景
  const allTraits = useMemo(() => [...new Set(data.map(d => d.特质).filter(Boolean))].sort(), [data]);
  const allScenes = useMemo(() => [...new Set(data.map(d => d.适用场景).filter(Boolean))].sort(), [data]);

  // 排除点击事件监听（从VoiceRow发出）
  useEffect(() => {
    const handler = (e) => {
      const { tab: eventTab, type, value } = e.detail;
      if (eventTab !== tab) return;
      if (type === 'trait') {
        if (traitMode === 'include') {
          const idx = traitSelected.indexOf(value);
          if (idx >= 0) {
            const newSel = traitSelected.filter(v => v !== value);
            setTraitSelected(newSel);
            onToast(`已取消勾选 “${value}”`, 'info');
          } else {
            if (traitSelected.length === 0) {
              setTraitMode('exclude');
              setTraitSelected([value]);
              onToast(`🔴 排除模式：排除 “${value}”`, 'exclamation-triangle');
            } else {
              onToast(`“${value}” 未被选中，无法移除`, 'info');
            }
          }
        } else {
          if (!traitSelected.includes(value)) {
            setTraitSelected([...traitSelected, value]);
            onToast(`🔴 排除 “${value}”`, 'exclamation-triangle');
          } else {
            onToast(`“${value}” 已在排除列表中`, 'info');
          }
        }
      } else if (type === 'scene') {
        if (sceneMode === 'include') {
          const idx = sceneSelected.indexOf(value);
          if (idx >= 0) {
            setSceneSelected(sceneSelected.filter(v => v !== value));
            onToast(`已取消勾选 “${value}”`, 'info');
          } else {
            if (sceneSelected.length === 0) {
              setSceneMode('exclude');
              setSceneSelected([value]);
              onToast(`🔴 排除模式：排除 “${value}”`, 'exclamation-triangle');
            } else {
              onToast(`“${value}” 未被选中，无法移除`, 'info');
            }
          }
        } else {
          if (!sceneSelected.includes(value)) {
            setSceneSelected([...sceneSelected, value]);
            onToast(`🔴 排除 “${value}”`, 'exclamation-triangle');
          } else {
            onToast(`“${value}” 已在排除列表中`, 'info');
          }
        }
      }
    };
    document.addEventListener('exclude-click', handler);
    return () => document.removeEventListener('exclude-click', handler);
  }, [tab, traitMode, traitSelected, sceneMode, sceneSelected, onToast]);

  // 筛选逻辑
  useEffect(() => {
    const minAge = ageMin !== '' ? Number(ageMin) : -Infinity;
    const maxAge = ageMax !== '' ? Number(ageMax) : Infinity;

    let filtered = data.filter(item => {
      if (search) {
        const s = [item.名称, item.voice参数, item.性别, String(item.年龄), item.特质, item.适用场景, item.语种, String(item.序号)].join(' ').toLowerCase();
        if (!s.includes(search.toLowerCase())) return false;
      }
      if (gender && item.性别 !== gender) return false;
      if (lang && item.语种 !== lang) return false;
      const ageNum = parseAge(item.年龄);
      if (ageNum !== null) {
        if (ageNum < minAge || ageNum > maxAge) return false;
      } else {
        if (minAge !== -Infinity || maxAge !== Infinity) return false;
      }
      const t = item.特质 || '';
      if (traitMode === 'include') {
        if (traitSelected.length > 0 && !traitSelected.includes(t)) return false;
      } else {
        if (traitSelected.length > 0 && traitSelected.includes(t)) return false;
      }
      const s2 = item.适用场景 || '';
      if (sceneMode === 'include') {
        if (sceneSelected.length > 0 && !sceneSelected.includes(s2)) return false;
      } else {
        if (sceneSelected.length > 0 && sceneSelected.includes(s2)) return false;
      }
      return true;
    });

    onFilterChange(filtered);
  }, [data, search, gender, lang, ageMin, ageMax, traitSelected, traitMode, sceneSelected, sceneMode, onFilterChange]);

  const toggleTraitMode = () => setTraitMode(prev => prev === 'include' ? 'exclude' : 'include');
  const toggleSceneMode = () => setSceneMode(prev => prev === 'include' ? 'exclude' : 'include');

  const resetTrait = () => { setTraitSelected([]); setTraitMode('include'); onToast('已重置 特质 筛选', 'info'); };
  const resetScene = () => { setSceneSelected([]); setSceneMode('include'); onToast('已重置 场景 筛选', 'info'); };

  const handleTraitCheck = (val) => {
    if (traitMode === 'include') {
      setTraitSelected(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]);
    } else {
      setTraitSelected(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]);
    }
  };

  const handleSceneCheck = (val) => {
    if (sceneMode === 'include') {
      setSceneSelected(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]);
    } else {
      setSceneSelected(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]);
    }
  };

  return (
    <div className="filter-bar" style={{
      background: 'var(--bg-filter)',
      borderRadius: 16,
      padding: '1rem 1.5rem 0.8rem',
      border: '1px solid var(--border-filter)',
      transition: 'background 0.2s, border-color 0.2s'
    }}>
      {/* 第一行：搜索、性别、语种、年龄 */}
      <div className="filter-row" style={{
        display: 'flex',
        flexWrap: 'nowrap',          // 改为 nowrap，禁止换行
        gap: '0.8rem 1.2rem',
        alignItems: 'center',
        marginBottom: '0.6rem',
        overflowX: 'auto',           // 如果屏幕过窄，出现水平滚动而不是换行
      }}>
        <div className="filter-group" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem 0.6rem',
          flexWrap: 'nowrap',        // 内部也不换行
          flexShrink: 1,             // 允许收缩
          minWidth: 0,               // 防止溢出
        }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--label-color)', margin: 0, whiteSpace: 'nowrap' }}>
            <i className="fas fa-search"></i>
          </label>
          <input
            type="text"
            className="form-control form-control-sm"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="搜索..."
            style={{
              minWidth: 80,            // 缩小最小宽度
              maxWidth: 150,
              flex: '1 1 auto',
              borderRadius: 8,
              borderColor: 'var(--input-border)',
              background: 'var(--input-bg)',
              color: 'var(--input-text)',
              fontSize: '0.85rem',
              padding: '0.2rem 0.6rem',
            }}
          />
        </div>

        <div className="filter-group" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem 0.6rem',
          flexWrap: 'nowrap',
          flexShrink: 0,              // 性别、语种、年龄不收缩，保持固定宽度
        }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--label-color)', margin: 0, whiteSpace: 'nowrap' }}>性别</label>
          <select
            className="form-select form-select-sm"
            value={gender}
            onChange={e => setGender(e.target.value)}
            style={{
              borderRadius: 8,
              borderColor: 'var(--input-border)',
              background: 'var(--input-bg)',
              color: 'var(--input-text)',
              fontSize: '0.85rem',
              padding: '0.2rem 0.6rem',
              width: 'auto',
              minWidth: 70,
            }}
          >
            <option value="">全部</option><option value="男">男</option><option value="女">女</option>
          </select>
        </div>

        <div className="filter-group" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem 0.6rem',
          flexWrap: 'nowrap',
          flexShrink: 0,
        }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--label-color)', margin: 0, whiteSpace: 'nowrap' }}>语种</label>
          <select
            className="form-select form-select-sm"
            value={lang}
            onChange={e => setLang(e.target.value)}
            style={{
              borderRadius: 8,
              borderColor: 'var(--input-border)',
              background: 'var(--input-bg)',
              color: 'var(--input-text)',
              fontSize: '0.85rem',
              padding: '0.2rem 0.6rem',
              width: 'auto',
              minWidth: 70,
            }}
          >
            <option value="">全部</option><option value="中文">中文</option><option value="英文">英文</option>
          </select>
        </div>

        <div className="filter-group" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem 0.6rem',
          flexWrap: 'nowrap',
          flexShrink: 0,
        }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--label-color)', margin: 0, whiteSpace: 'nowrap' }}>年龄</label>
          <input
            type="number"
            className="form-control form-control-sm"
            value={ageMin}
            onChange={e => setAgeMin(e.target.value)}
            placeholder="最小"
            style={{
              width: 60,
              borderRadius: 8,
              borderColor: 'var(--input-border)',
              background: 'var(--input-bg)',
              color: 'var(--input-text)',
              fontSize: '0.85rem',
              padding: '0.2rem 0.4rem',
            }}
          />
          <span style={{ color: 'var(--text-muted)' }}>—</span>
          <input
            type="number"
            className="form-control form-control-sm"
            value={ageMax}
            onChange={e => setAgeMax(e.target.value)}
            placeholder="最大"
            style={{
              width: 60,
              borderRadius: 8,
              borderColor: 'var(--input-border)',
              background: 'var(--input-bg)',
              color: 'var(--input-text)',
              fontSize: '0.85rem',
              padding: '0.2rem 0.4rem',
            }}
          />
        </div>
      </div>

      {/* 特质 */}
      <div className="filter-row" style={{ marginBottom: '0.3rem', display: 'flex', flexWrap: 'wrap', gap: '0.3rem 0.6rem', alignItems: 'flex-start' }}>
        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--label-color)', margin: '0.2rem 0 0 0' }}>特质</label>
        <div className={`multi-filter-wrapper ${traitMode === 'exclude' ? 'exclude-mode' : ''}`} style={{
          flex: 1, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.4rem 0.8rem',
          borderRadius: 8, border: '1px solid var(--multi-border)',
          padding: '0.2rem 0.4rem', transition: 'background 0.2s, border-color 0.2s'
        }}>
          <div className="multi-filter-group" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem 0.8rem', alignItems: 'center', flex: 1, maxHeight: 70, overflowY: 'auto', padding: '0.1rem 0' }}>
            {allTraits.map(t => (
              <div className="form-check form-check-inline" key={t} style={{ margin: 0, paddingLeft: '1.4rem', fontSize: '0.8rem' }}>
                <input className="form-check-input" type="checkbox" checked={traitSelected.includes(t)} onChange={() => handleTraitCheck(t)} style={{ width: '0.9rem', height: '0.9rem' }} />
                <label className="form-check-label" style={{ fontSize: '0.8rem', color: 'var(--multi-label)' }}>{t}</label>
              </div>
            ))}
          </div>
          <div className="filter-actions" style={{ display: 'flex', gap: '0.3rem', alignItems: 'center', flexShrink: 0 }}>
            <button className={`btn btn-sm btn-exclude-mode ${traitMode === 'exclude' ? 'active' : ''}`} onClick={toggleTraitMode} style={{ padding: '0.1rem 0.5rem', fontSize: '0.7rem', borderRadius: 12, background: traitMode === 'exclude' ? 'var(--btn-exclude-active-bg)' : 'var(--btn-exclude-bg)', color: traitMode === 'exclude' ? 'var(--btn-exclude-active-text)' : 'var(--btn-exclude-text)', border: '1px solid ' + (traitMode === 'exclude' ? 'var(--btn-exclude-active-bg)' : 'var(--btn-exclude-border)') }}>{traitMode === 'exclude' ? '排除' : '包括'}</button>
            <button className="btn btn-sm btn-reset" onClick={resetTrait} style={{ padding: '0.1rem 0.5rem', fontSize: '0.7rem', borderRadius: 12, background: 'var(--btn-reset-bg)', color: 'var(--btn-reset-text)', border: '1px solid var(--btn-reset-border)' }}><i className="fas fa-undo-alt"></i></button>
          </div>
        </div>
      </div>

      {/* 场景 */}
      <div className="filter-row" style={{ marginBottom: 0, display: 'flex', flexWrap: 'wrap', gap: '0.3rem 0.6rem', alignItems: 'flex-start' }}>
        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--label-color)', margin: '0.2rem 0 0 0' }}>场景</label>
        <div className={`multi-filter-wrapper ${sceneMode === 'exclude' ? 'exclude-mode' : ''}`} style={{
          flex: 1, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.4rem 0.8rem',
          borderRadius: 8, border: '1px solid var(--multi-border)',
          padding: '0.2rem 0.4rem', transition: 'background 0.2s, border-color 0.2s'
        }}>
          <div className="multi-filter-group" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem 0.8rem', alignItems: 'center', flex: 1, maxHeight: 70, overflowY: 'auto', padding: '0.1rem 0' }}>
            {allScenes.map(s => (
              <div className="form-check form-check-inline" key={s} style={{ margin: 0, paddingLeft: '1.4rem', fontSize: '0.8rem' }}>
                <input className="form-check-input" type="checkbox" checked={sceneSelected.includes(s)} onChange={() => handleSceneCheck(s)} style={{ width: '0.9rem', height: '0.9rem' }} />
                <label className="form-check-label" style={{ fontSize: '0.8rem', color: 'var(--multi-label)' }}>{s}</label>
              </div>
            ))}
          </div>
          <div className="filter-actions" style={{ display: 'flex', gap: '0.3rem', alignItems: 'center', flexShrink: 0 }}>
            <button className={`btn btn-sm btn-exclude-mode ${sceneMode === 'exclude' ? 'active' : ''}`} onClick={toggleSceneMode} style={{ padding: '0.1rem 0.5rem', fontSize: '0.7rem', borderRadius: 12, background: sceneMode === 'exclude' ? 'var(--btn-exclude-active-bg)' : 'var(--btn-exclude-bg)', color: sceneMode === 'exclude' ? 'var(--btn-exclude-active-text)' : 'var(--btn-exclude-text)', border: '1px solid ' + (sceneMode === 'exclude' ? 'var(--btn-exclude-active-bg)' : 'var(--btn-exclude-border)') }}>{sceneMode === 'exclude' ? '排除' : '包括'}</button>
            <button className="btn btn-sm btn-reset" onClick={resetScene} style={{ padding: '0.1rem 0.5rem', fontSize: '0.7rem', borderRadius: 12, background: 'var(--btn-reset-bg)', color: 'var(--btn-reset-text)', border: '1px solid var(--btn-reset-border)' }}><i className="fas fa-undo-alt"></i></button>
          </div>
        </div>
      </div>
    </div>
  );
}

function parseAge(val) {
  if (!val || val === '不能' || val === '—') return null;
  const num = Number(val);
  return isNaN(num) ? null : num;
}
