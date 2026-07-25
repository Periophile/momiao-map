import { getCategoryList } from '../utils/categories';
import './Header.css';

export default function Header({ categoryCounts, totalCount, filter, onFilterChange }) {
  const cats = getCategoryList();

  function handleBadgeClick(key) {
    // Set filter
    onFilterChange(key);
    // Flash map
    window.dispatchEvent(new CustomEvent('flash-map'));
    // Play sound for this category
    window.dispatchEvent(new CustomEvent('play-cat-sound', { detail: key }));
  }

  function handleXiaoheiziClick() {
    handleBadgeClick('all');
  }

  const badges = [
    { key: 'all', emoji: null, count: totalCount, isImage: true },
    ...cats.map((c) => ({ key: c.key, emoji: c.emoji, label: c.label, count: categoryCounts[c.key] || 0, isImage: false })),
  ];

  return (
    <header className="header">
      <div className="header-brand" onClick={handleXiaoheiziClick} style={{ cursor: 'pointer' }}>
        <img className="header-logo" src="/xiaoheizi.jpg" alt="logo" />
        <div>
          <div className="header-title">神奇的妙妙地图</div>
          <div className="header-subtitle">分享我的私藏美食 & 宝藏小店</div>
        </div>
      </div>
      <div className="header-stats">
        {badges.map((b) => (
          <div
            key={b.key}
            className={`stat-badge ${b.key}${filter === b.key ? ' active' : ''}`}
            onClick={() => handleBadgeClick(b.key)}
          >
            {b.isImage ? (
              <img className="stat-icon-img" src="/xiaoheizi.jpg" alt="" />
            ) : (
              <span className="emoji">{b.emoji}</span>
            )}
            <span className="num">{b.count}</span>
            {b.label || '全部'}
          </div>
        ))}
      </div>
    </header>
  );
}
