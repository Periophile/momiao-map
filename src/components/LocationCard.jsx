import { getCategory } from '../utils/categories';
import './LocationCard.css';

export default function LocationCard({ location, isActive, onClick, onDelete, onEdit }) {
  const { id, name, category, description, rating, createdAt } = location;
  const cat = getCategory(category);

  return (
    <div
      className={`location-card${isActive ? ' active' : ''}`}
      onClick={() => onClick(id)}
      style={{ animationDelay: '0s' }}
    >
      <div className="card-icon" style={{ background: cat.bg }}>
        {cat.emoji}
      </div>
      <div className="card-content">
        <div className="card-header">
          <span className="card-name">{name}</span>
          <span className="card-rating">
            {'⭐'.repeat(rating)}
          </span>
        </div>
        <div className="card-desc">{description}</div>
        <div className="card-footer-row">
          <span className="card-author">👤 {location.createdBy || '匿名'}</span>
          <span className="card-date">{createdAt}</span>
        </div>
      </div>
      <div className="card-actions">
        <button
          className="card-edit-btn"
          title="编辑"
          onClick={(e) => { e.stopPropagation(); onEdit(id); }}
        >
          ✏️
        </button>
        <button
          className="card-delete-btn"
          title="删除"
          onClick={(e) => {
            e.stopPropagation();
            if (window.confirm('确定要删除这个地点吗？')) { onDelete(id); }
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
