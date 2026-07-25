import LocationCard from './LocationCard';
import { getCategoryList } from '../utils/categories';
import './Sidebar.css';

export default function Sidebar({
  locations,
  activeId,
  onLocationClick,
  filter,
  onFilterChange,
  onAddClick,
  totalCount,
  isOpen,
  onClose,
  onDelete,
  onEdit,
}) {
  const cats = getCategoryList();

  return (
    <>
      <div
        className={`sidebar-overlay${isOpen ? ' open' : ''}`}
        onClick={onClose}
      />

      <aside className={`sidebar${isOpen ? ' open' : ''}`}>
        <div className="sidebar-handle" />

        <div className="sidebar-header">
          <div className="sidebar-header-title">
            📍 我的私藏地点
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 400 }}>
              ({locations.length})
            </span>
          </div>
          <div className="category-filters">
            <button
              className={`filter-btn${filter === 'all' ? ' active' : ''}`}
              onClick={() => onFilterChange('all')}
            >
              <img className="filter-icon-img" src="/xiaoheizi.jpg" alt="" /> 全部
            </button>
            {cats.map((c) => (
              <button
                key={c.key}
                className={`filter-btn filter-${c.key}${filter === c.key ? ' active' : ''}`}
                onClick={() => onFilterChange(c.key)}
              >
                <span className="filter-emoji">{c.emoji}</span> {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="location-list">
          {locations.length === 0 ? (
            <div className="empty-state">
              <div className="empty-emoji">🔍</div>
              <div className="empty-text">
                还没有添加任何地点哦~ 点击下方按钮添加第一个吧！
              </div>
            </div>
          ) : (
            locations.map((loc) => (
              <LocationCard
                key={loc.id}
                location={loc}
                isActive={activeId === loc.id}
                onClick={() => {
                  onLocationClick(loc.id);
                  if (window.innerWidth <= 768 && onClose) {
                    onClose();
                  }
                }}
                onDelete={onDelete}
                onEdit={onEdit}
              />
            ))
          )}
        </div>

        <button className="sidebar-add-btn" onClick={onAddClick}>
          ✨ 添加新地点
        </button>
      </aside>
    </>
  );
}
