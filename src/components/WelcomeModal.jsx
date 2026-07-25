import { useState, useEffect } from 'react';
import './WelcomeModal.css';

const STORAGE_KEY = 'momiao-welcome-seen';

export default function WelcomeModal() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem(STORAGE_KEY);
    if (!seen) {
      setVisible(true);
    }
  }, []);

  function handleClose() {
    setVisible(false);
    localStorage.setItem(STORAGE_KEY, 'true');
  }

  if (!visible) return null;

  return (
    <div className="welcome-overlay" onClick={handleClose}>
      <div className="welcome-card" onClick={(e) => e.stopPropagation()}>
        <div className="welcome-icon">🗺️</div>
        <h2 className="welcome-title">欢迎来到神奇的妙妙地图</h2>
        <div className="welcome-body">
          <p>👆 <strong>点击地图上的图标</strong>，查看每个地点的详细描述。</p>
          <p>📍 所有地点均为<strong>本人亲历</strong>，一些日常爱去的小店，分享给大家。</p>
          <p>💬 欢迎大家<strong>补充推荐</strong>，好的店一起分享！</p>
        </div>
        <div className="welcome-footer">
          <span className="welcome-emoji">🍜</span>
          <span className="welcome-emoji">🚬</span>
          <span className="welcome-emoji">💨</span>
          <span className="welcome-emoji">🍺</span>
          <span className="welcome-emoji">🧋</span>
        </div>
        <button className="welcome-btn" onClick={handleClose}>
          知道了，开始探索 ✨
        </button>
      </div>
    </div>
  );
}
