import L from 'leaflet';
import { getCategory } from './categories';

function createMarkerIcon(category, isActive = false) {
  const cat = getCategory(category);
  const size = isActive ? 48 : 40;
  const fontSize = isActive ? 26 : 22;

  return L.divIcon({
    className: 'custom-marker-wrapper',
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background: ${cat.color};
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: ${fontSize}px;
        box-shadow: 0 4px 16px ${cat.color}55, 0 0 0 4px white, 0 0 0 6px ${cat.color}44;
        cursor: pointer;
        transition: all 0.25s cubic-bezier(0.68, -0.55, 0.27, 1.55);
        animation: bounceIn 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55) both;
        border: 3px solid white;
      ">
        ${cat.emoji}
      </div>
      <div style="
        width: 10px;
        height: 10px;
        background: ${cat.color};
        border-radius: 50%;
        margin: -5px auto 0;
        box-shadow: 0 0 6px ${cat.color}88;
      "></div>
    `,
    iconSize: [size + 8, size + 20],
    iconAnchor: [size / 2 + 4, size + 18],
    popupAnchor: [0, -(size + 16)],
  });
}

export function getMarkerIcon(category, isActive = false) {
  return createMarkerIcon(category, isActive);
}
