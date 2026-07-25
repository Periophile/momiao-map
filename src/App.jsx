import { useState, useCallback } from 'react';
import Header from './components/Header';
import MapView from './components/MapView';
import Sidebar from './components/Sidebar';
import AddLocationModal from './components/AddLocationModal';
import Footer from './components/Footer';
import MusicPlayer from './components/MusicPlayer';
import WelcomeModal from './components/WelcomeModal';
import useLocations from './hooks/useLocations';
import './App.css';

export default function App() {
  const {
    locations,
    activeId,
    setActiveId,
    filter,
    setFilter,
    addLocation,
    updateLocation,
    deleteLocation,
    totalCount,
    categoryCounts,
  } = useLocations();

  const [addMode, setAddMode] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [editingId, setEditingId] = useState(null);   // null = adding new, id = editing
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Click map → set position
  const handleMapClick = useCallback((latlng) => {
    if (!addMode && !showModal) return;
    setSelectedPosition(latlng);
    if (!showModal) {
      setShowModal(true);
    }
  }, [addMode, showModal]);

  // Click marker → fly to it
  const handleMarkerClick = useCallback((id) => {
    setActiveId(id);
  }, [setActiveId]);

  // Save (new or edit)
  const handleSave = useCallback((data) => {
    if (editingId) {
      updateLocation(editingId, data);
      setActiveId(editingId);
    } else {
      const newLoc = addLocation(data);
      setActiveId(newLoc.id);
    }
    setShowModal(false);
    setSelectedPosition(null);
    setAddMode(false);
    setEditingId(null);
    setSidebarOpen(false);
  }, [editingId, addLocation, updateLocation, setActiveId]);

  // Click "添加新地点"
  const handleAddClick = useCallback(() => {
    setEditingId(null);
    setSelectedPosition(null);
    setShowModal(false);
    setAddMode(true);
    setSidebarOpen(false);
  }, []);

  // Click "编辑" on a location card
  const handleEditClick = useCallback((id) => {
    // Get the location data from locations state
    const loc = locations.find((l) => l.id === id);
    if (!loc) return;
    setEditingId(id);
    setSelectedPosition({ lat: loc.lat, lng: loc.lng });
    setAddMode(false);
    setShowModal(true);
  }, [locations]);

  // Search button on map hint bar
  const handleSearchClick = useCallback(() => {
    setEditingId(null);
    setShowModal(true);
  }, []);

  // Cancel
  const handleCancelAdd = useCallback(() => {
    setAddMode(false);
    setSelectedPosition(null);
    setShowModal(false);
    setEditingId(null);
  }, []);

  return (
    <div className="app-container">
      <Header
        categoryCounts={categoryCounts}
        totalCount={totalCount}
        filter={filter}
        onFilterChange={setFilter}
      />

      <div className="app-main">
        <Sidebar
          locations={locations}
          activeId={activeId}
          onLocationClick={handleMarkerClick}
          filter={filter}
          onFilterChange={setFilter}
          onAddClick={handleAddClick}
          totalCount={totalCount}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onDelete={deleteLocation}
          onEdit={handleEditClick}
        />

        <MapView
          locations={locations}
          activeId={activeId}
          onMarkerClick={handleMarkerClick}
          onMapClick={handleMapClick}
          addMode={addMode}
          onDelete={deleteLocation}
          onEdit={handleEditClick}
          onCancelAdd={handleCancelAdd}
          onSearchClick={handleSearchClick}
        />

        {/* Mobile toggle */}
        <button
          className="mobile-drawer-toggle"
          onClick={() => setSidebarOpen((v) => !v)}
        >
          {sidebarOpen ? '✕ 关闭列表' : '📍 查看列表'}
          <span className="count">{locations.length}</span>
        </button>
      </div>

      <Footer totalCount={totalCount} />
      <WelcomeModal />
      <MusicPlayer />

      {/* Modal：add or edit */}
      {showModal && (
        <AddLocationModal
          selectedPosition={selectedPosition}
          editingLocation={
            editingId ? locations.find((l) => l.id === editingId) : null
          }
          onSave={handleSave}
          onClose={() => {
            setShowModal(false);
            if (!editingId && !selectedPosition) {
              setAddMode(false);
            }
            setEditingId(null);
          }}
        />
      )}
    </div>
  );
}
