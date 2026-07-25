import { useState, useRef, useCallback, useEffect } from 'react';
import AMAP_KEY from '../config';
import { gcj02ToWgs84 } from '../utils/coord';
import { getCategoryList } from '../utils/categories';
import './AddLocationModal.css';

// 许昌城市编码
const XUCHANG_CODE = '411000';

export default function AddLocationModal({
  selectedPosition,
  editingLocation,   // null = 新增, object = 编辑
  onSave,
  onClose,
}) {
  const isEditing = !!editingLocation;

  const [name, setName] = useState(editingLocation?.name || '');
  const [category, setCategory] = useState(editingLocation?.category || 'food');
  const [description, setDescription] = useState(editingLocation?.description || '');
  const [createdBy, setCreatedBy] = useState(
    editingLocation?.createdBy || localStorage.getItem('momiao-nickname') || '王源'
  );
  const [rating, setRating] = useState(editingLocation?.rating || 4);
  const [saving, setSaving] = useState(false);

  // 编辑模式：预填数据
  useEffect(() => {
    if (editingLocation) {
      setName(editingLocation.name);
      setCategory(editingLocation.category);
      setDescription(editingLocation.description);
      setRating(editingLocation.rating);
    }
  }, [editingLocation]);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchTimer = useRef(null);
  const [searchError, setSearchError] = useState('');

  const canSave = name.trim() && selectedPosition;

  // 搜索：用高德 POI 搜索 API（真实商户数据）
  const doSearch = useCallback(async (query) => {
    if (!query.trim() || query.trim().length < 1) {
      setSearchResults([]);
      setShowResults(false);
      setSearchError('');
      return;
    }
    if (AMAP_KEY === '你的KEY填这里') {
      setSearchError('请先配置高德API Key（免费）→ src/config.js');
      setSearchResults([]);
      return;
    }
    setSearching(true);
    setSearchError('');
    try {
      const kw = encodeURIComponent(query.trim());
      const resp = await fetch(
        `https://restapi.amap.com/v3/place/text?keywords=${kw}&city=${XUCHANG_CODE}&citylimit=true&offset=10&output=json&key=${AMAP_KEY}`
      );
      const data = await resp.json();
      if (data.status === '1' && data.pois) {
        setSearchResults(data.pois);
        setShowResults(true);
      } else {
        setSearchResults([]);
        if (data.info) setSearchError(data.info);
      }
    } catch (e) {
      console.warn('搜索失败:', e);
      setSearchError('搜索失败，请检查网络');
    } finally {
      setSearching(false);
    }
  }, []);

  function handleSearchChange(e) {
    const val = e.target.value;
    setSearchQuery(val);
    setSearchError('');
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => doSearch(val), 350);
  }

  // 选中搜索结果 → 在地图上定位 + 填入表单
  function selectSearchResult(item) {
    // 高德返回 GCJ-02，转 WGS-84 存储
    const [lng, lat] = item.location.split(',').map(Number);
    const wgs = gcj02ToWgs84(lat, lng);

    // 通知地图飞到该位置 + 更新选中坐标
    window.dispatchEvent(
      new CustomEvent('set-position', { detail: { lat: wgs.lat, lng: wgs.lng } })
    );

    // 自动填入名称
    setName(item.name);
    // 自动填入地址作为描述
    if (item.address && !description.trim()) {
      setDescription(item.address);
    }

    setShowResults(false);
    setSearchQuery(item.name);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!canSave) return;
    setSaving(true);
    // 记住昵称
    localStorage.setItem('momiao-nickname', createdBy.trim());
    onSave({
      name: name.trim(),
      category,
      lat: selectedPosition.lat,
      lng: selectedPosition.lng,
      description: description.trim(),
      rating,
      createdBy: createdBy.trim(),
    });
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            {isEditing ? '✏️ 编辑地点' : '✨ 添加新地点'}
          </div>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <form className="modal-body" onSubmit={handleSubmit}>
          {/* 搜索框 */}
          <div className="form-group">
            <label className="form-label">🔍 搜索许昌商户（高德数据）</label>
            <div className="search-wrapper">
              <input
                className="form-input search-input"
                type="text"
                placeholder="搜店名或类型，如：牛肉面 / 烟酒店 / 便利店"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => searchResults.length > 0 && setShowResults(true)}
                onBlur={() => setTimeout(() => setShowResults(false), 200)}
              />
              {searching && <span className="search-spinner">⏳</span>}
            </div>
            {searchError && (
              <div className="search-error">{searchError}</div>
            )}
            {showResults && searchResults.length > 0 && (
              <ul className="search-results">
                {searchResults.map((item, i) => (
                  <li
                    key={i}
                    className="search-result-item"
                    onMouseDown={() => selectSearchResult(item)}
                  >
                    <span className="search-icon">📍</span>
                    <div className="search-info">
                      <div className="search-name">{item.name}</div>
                      <div className="search-addr">{item.address}</div>
                      {item.type && (
                        <div className="search-type">{item.type.split(';').slice(0, 2).join(' · ')}</div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {showResults && searchResults.length === 0 && !searching && searchQuery && !searchError && (
              <div className="search-no-result">未找到匹配商户，试试其他关键词</div>
            )}
          </div>

          {/* 已选位置 */}
          <div className="location-preview">
            <span className="preview-icon">📍</span>
            <div>
              <div>
                {selectedPosition
                  ? '位置已选定 ✅'
                  : '搜索商户后自动定位，或在地图上点击选点'}
              </div>
              {selectedPosition && (
                <div className="preview-coords">
                  {selectedPosition.lat.toFixed(4)},{' '}
                  {selectedPosition.lng.toFixed(4)}
                </div>
              )}
            </div>
          </div>

          {/* 名称 */}
          <div className="form-group">
            <label className="form-label">🏷️ 地点名称</label>
            <input
              className="form-input"
              type="text"
              placeholder="例如：老王记牛肉面"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          {/* 昵称 */}
          <div className="form-group">
            <label className="form-label">👤 你的昵称</label>
            <input
              className="form-input"
              type="text"
              placeholder="输入你的昵称"
              value={createdBy}
              onChange={(e) => setCreatedBy(e.target.value)}
            />
          </div>

          {/* 分类 */}
          <div className="form-group">
            <label className="form-label">📂 分类</label>
            <select
              className="form-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {getCategoryList().map((c) => (
                <option key={c.key} value={c.key}>
                  {c.emoji} {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* 评分 */}
          <div className="form-group">
            <label className="form-label">⭐ 评分</label>
            <div className="rating-select">
              {[1, 2, 3, 4, 5].map((i) => (
                <span
                  key={i}
                  className={`rating-star${i <= rating ? ' filled' : ' empty'}`}
                  onClick={() => setRating(i)}
                >
                  {i <= rating ? '⭐' : '☆'}
                </span>
              ))}
            </div>
          </div>

          {/* 描述 */}
          <div className="form-group">
            <label className="form-label">📝 描述</label>
            <textarea
              className="form-textarea"
              placeholder="简单描述一下这个地方吧~"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* 保存 */}
          <button
            type="submit"
            className="modal-submit"
            disabled={!canSave || saving}
          >
            {saving ? '保存中...' : isEditing ? '💾 保存修改' : '💾 保存到妙妙地图'}
          </button>
        </form>
      </div>
    </div>
  );
}
