const CATEGORIES = {
  food:      { emoji: '🍜', label: '美食',     color: '#FFB347', bg: 'rgba(255,179,71,0.12)',  textColor: '#CC8A1A', audio: '/zhenxiang.mp3' },
  cigarette: { emoji: '🚬', label: '守旧派',   color: '#7EC8A0', bg: 'rgba(126,200,160,0.12)', textColor: '#4A8C63', audio: '/xiangyan.mp4' },
  vape:      { emoji: '💨', label: '维新派',   color: '#9B7ED8', bg: 'rgba(155,126,216,0.12)', textColor: '#6B4FB0', audio: '/dianziyan.mp4' },
  bar:       { emoji: '🍺', label: '酒馆',     color: '#E8A840', bg: 'rgba(232,168,64,0.12)',  textColor: '#B8861E', audio: '/jiuguan.mp4' },
  drink:     { emoji: '🧋', label: '饮料店',   color: '#5EC4C4', bg: 'rgba(94,196,196,0.12)',  textColor: '#3A8A8A', audio: '/yinliaodian.mp4' },
};

// 全部的音效
export const ALL_AUDIO = '/quanbu.mp4';

export function getCategory(cat) {
  return CATEGORIES[cat] || CATEGORIES.food;
}

export function getAllCategories() {
  return Object.keys(CATEGORIES);
}

export function getCategoryList() {
  return Object.entries(CATEGORIES).map(([key, val]) => ({ key, ...val }));
}

export default CATEGORIES;
