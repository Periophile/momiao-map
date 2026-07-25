import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { getMarkerIcon } from '../utils/markers';
import { getCategory } from '../utils/categories';
import { wgs84ToGcj02, gcj02ToWgs84 } from '../utils/coord';
import './MapView.css';

// 高德地图瓦片 URL（GCJ-02 火星坐标系）
const AMAP_TILE = 'https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}';
const AMAP_SATELLITE = 'https://webst0{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}';

// 许昌市中心坐标 (GCJ-02)
const DEFAULT_CENTER = [34.0358, 113.8520];
const DEFAULT_ZOOM = 13;

/* ==========================================
   Sub-components
   ========================================== */

// Handle locate-me and set-position events (coords in WGS-84)
function EventHandler({ onMapClick }) {
  const map = useMap();

  useEffect(() => {
    function handleLocate(e) {
      // GPS coords → GCJ-02 for 高德 map display
      const gcj = wgs84ToGcj02(e.detail.lat, e.detail.lng);
      map.flyTo([gcj.lat, gcj.lng], 16, { duration: 1.2 });
    }
    function handleSetPosition(e) {
      // Nominatim returns WGS-84 → convert to GCJ-02 for map
      const gcj = wgs84ToGcj02(e.detail.lat, e.detail.lng);
      map.flyTo([gcj.lat, gcj.lng], 18, { duration: 1 });
      // Pass original WGS-84 coords to parent for storage
      if (onMapClick) {
        onMapClick({ lat: e.detail.lat, lng: e.detail.lng });
      }
    }
    window.addEventListener('locate-me', handleLocate);
    window.addEventListener('set-position', handleSetPosition);
    return () => {
      window.removeEventListener('locate-me', handleLocate);
      window.removeEventListener('set-position', handleSetPosition);
    };
  }, [map, onMapClick]);

  return null;
}

// Fly to marker (location stored as WGS-84 → convert to GCJ-02 for 高德)
function FlyToMarker({ activeId, locations }) {
  const map = useMap();
  const prevIdRef = useRef(null);

  useEffect(() => {
    if (!activeId || activeId === prevIdRef.current) return;
    prevIdRef.current = activeId;
    const loc = locations.find((l) => l.id === activeId);
    if (loc) {
      const gcj = wgs84ToGcj02(loc.lat, loc.lng);
      map.flyTo([gcj.lat, gcj.lng], 17, { duration: 1.2 });
    }
  }, [activeId, locations, map]);

  return null;
}

// Handle map click → GCJ-02 from 高德 → convert to WGS-84 for storage
function MapClickHandler({ onMapClick, addMode }) {
  useMapEvents({
    click(e) {
      if (addMode && onMapClick) {
        // Map gives GCJ-02 coords, convert to WGS-84 for storage
        const wgs = gcj02ToWgs84(e.latlng.lat, e.latlng.lng);
        onMapClick(wgs);
      }
    },
  });
  return null;
}

// Flash map container when Header badge clicked
function FlashHandler() {
  const map = useMap();

  useEffect(() => {
    function handleFlash() {
      const container = map.getContainer();
      container.style.transition = 'filter 0.15s ease';
      container.style.filter = 'brightness(1.6)';
      setTimeout(() => {
        container.style.filter = 'brightness(1)';
      }, 150);
    }
    window.addEventListener('flash-map', handleFlash);
    return () => window.removeEventListener('flash-map', handleFlash);
  }, [map]);

  return null;
}

// Stars display
function Stars({ rating }) {
  return (
    <div className="popup-stars">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={`star${i > rating ? ' empty' : ''}`}>
          {i <= rating ? '⭐' : '☆'}
        </span>
      ))}
    </div>
  );
}

/* ==========================================
   Main MapView with 高德地图
   ========================================== */

export default function MapView({
  locations,
  activeId,
  onMarkerClick,
  onMapClick,
  addMode,
  onDelete,
  onEdit,
  onCancelAdd,
  onSearchClick,
}) {
  return (
    <div className="map-view">
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%' }}
      >
        {/* 高德矢量地图 */}
        <TileLayer
          attribution='&copy; 高德地图 | 🗺️ 妙妙地图'
          url={AMAP_TILE}
          subdomains={['1', '2', '3', '4']}
          maxZoom={18}
        />

        <EventHandler onMapClick={onMapClick} />
        <FlashHandler />
        <FlyToMarker activeId={activeId} locations={locations} />
        <MapClickHandler onMapClick={onMapClick} addMode={addMode} />

        {/* Markers: convert WGS-84 → GCJ-02 for correct display on 高德 */}
        {locations.map((loc) => {
          const gcj = wgs84ToGcj02(loc.lat, loc.lng);
          return (
            <Marker
              key={loc.id}
              position={[gcj.lat, gcj.lng]}
              icon={getMarkerIcon(loc.category, activeId === loc.id)}
              eventHandlers={{
                click: () => {
                  onMarkerClick(loc.id);
                  // 播放对应分类音效
                  window.dispatchEvent(new CustomEvent('play-cat-sound', { detail: loc.category }));
                },
              }}
            >
              <Popup>
                <div className="popup-card">
                  <span className={`popup-category ${loc.category}`}>
                    {(() => { const c = getCategory(loc.category); return `${c.emoji} ${c.label}`; })()}
                  </span>
                  <div className="popup-name">{loc.name}</div>
                  <Stars rating={loc.rating} />
                  <div className="popup-desc">{loc.description}</div>
                  <div className="popup-author">👤 {loc.createdBy || '匿名'}</div>
                  <div className="popup-actions">
                    <button
                      className="popup-edit-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(loc.id);
                      }}
                    >
                      ✏️ 编辑
                    </button>
                    <button
                      className="popup-delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('确定要删除这个地点吗？')) {
                          onDelete(loc.id);
                        }
                      }}
                    >
                      🗑️ 删除
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Locate me button */}
      <button
        className="locate-btn"
        title="定位到当前位置"
        onClick={() => {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                window.dispatchEvent(
                  new CustomEvent('locate-me', {
                    detail: {
                      lat: pos.coords.latitude,
                      lng: pos.coords.longitude,
                    },
                  })
                );
              },
              () => alert('无法获取位置，请检查浏览器权限设置')
            );
          }
        }}
      >
        📍
      </button>

      {addMode && (
        <div className="add-hint-bar">
          <div className="add-hint">
            <span className="hint-dot" />
            点击地图选择新地点的位置
          </div>
          <button className="hint-search-btn" onClick={onSearchClick}>
            🔍 搜索地址
          </button>
          <button className="hint-cancel-btn" onClick={onCancelAdd}>
            取消
          </button>
        </div>
      )}
    </div>
  );
}

export { Stars };
