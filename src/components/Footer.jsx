import './Footer.css';

export default function Footer({ totalCount }) {
  return (
    <footer className="footer">
      共 {totalCount} 个私藏地点 | 神奇的妙妙地图 © 2026
    </footer>
  );
}
