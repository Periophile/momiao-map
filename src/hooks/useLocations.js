import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import sampleLocations from '../data/sampleData';

const STORAGE_KEY = 'momiao-map-locations';

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch (e) {
    console.warn('Failed to parse localStorage locations, using defaults.');
  }
  // First time: seed with sample data
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleLocations));
  return sampleLocations;
}

export default function useLocations() {
  const [locations, setLocations] = useState(loadFromStorage);
  const [activeId, setActiveId] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all' | 'food' | 'cigarette'

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(locations));
  }, [locations]);

  const filtered = locations.filter((loc) => {
    if (filter === 'all') return true;
    return loc.category === filter;
  });

  const addLocation = useCallback(({ name, category, lat, lng, description, rating, createdBy }) => {
    const newLoc = {
      id: uuidv4(),
      name,
      category,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      description,
      rating: parseInt(rating, 10),
      createdBy: createdBy || '匿名',
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setLocations((prev) => [...prev, newLoc]);
    return newLoc;
  }, []);

  const updateLocation = useCallback((id, { name, category, lat, lng, description, rating, createdBy }) => {
    setLocations((prev) =>
      prev.map((loc) =>
        loc.id === id
          ? {
              ...loc,
              name,
              category,
              lat: parseFloat(lat),
              lng: parseFloat(lng),
              description,
              rating: parseInt(rating, 10),
              createdBy: createdBy || loc.createdBy,
            }
          : loc
      )
    );
  }, []);

  const deleteLocation = useCallback((id) => {
    setLocations((prev) => prev.filter((loc) => loc.id !== id));
    setActiveId((prev) => (prev === id ? null : prev));
  }, []);

  const getLocationById = useCallback(
    (id) => locations.find((loc) => loc.id === id),
    [locations]
  );

  const categoryCounts = {};
  locations.forEach((l) => {
    categoryCounts[l.category] = (categoryCounts[l.category] || 0) + 1;
  });

  return {
    locations: filtered,
    allLocations: locations,
    activeId,
    setActiveId,
    filter,
    setFilter,
    addLocation,
    updateLocation,
    deleteLocation,
    getLocationById,
    totalCount: locations.length,
    categoryCounts,
  };
}
