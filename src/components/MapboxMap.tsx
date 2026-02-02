'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Shipment, SeaShipment, AirShipment } from '@/types/shipment';

// You can set your Mapbox token here or use an environment variable
// For demo purposes, we'll use a public token placeholder
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';

interface MapboxMapProps {
  shipments: Shipment[];
  selectedShipment: Shipment | null;
}

// Generate curved arc points for air routes
function generateArcPoints(
  start: [number, number],
  end: [number, number],
  numPoints: number = 60
): [number, number][] {
  const points: [number, number][] = [];
  const distance = Math.sqrt(
    Math.pow(end[0] - start[0], 2) + Math.pow(end[1] - start[1], 2)
  );

  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    const lng = start[0] + (end[0] - start[0]) * t;
    const lat = start[1] + (end[1] - start[1]) * t;

    // Add curvature - higher arc for longer distances
    const curveFactor = Math.sin(Math.PI * t) * Math.min(distance * 0.12, 15);
    points.push([lng, lat + curveFactor]);
  }

  return points;
}

// Create HTML for ship marker
const createShipMarkerHTML = (isSelected: boolean = false): string => {
  const size = isSelected ? 56 : 44;
  return `
    <div style="
      width: ${size}px;
      height: ${size}px;
      background: linear-gradient(135deg, #ec4899 0%, #db2777 50%, #be185d 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 24px rgba(236, 72, 153, 0.5), 0 0 0 4px rgba(255,255,255,0.9);
      cursor: pointer;
    ">
      <svg width="${size * 0.5}" height="${size * 0.5}" viewBox="0 0 24 24" fill="white">
        <path d="M20 21c-1.39 0-2.78-.47-4-1.32-2.44 1.71-5.56 1.71-8 0C6.78 20.53 5.39 21 4 21H2v2h2c1.38 0 2.74-.35 4-.99 2.52 1.29 5.48 1.29 8 0 1.26.64 2.62.99 4 .99h2v-2h-2zm-3.5-5l-1.5-3h-6l-1.5 3H6c-.83 0-1.5-.67-1.5-1.5S5.17 13 6 13h1l2.25-4.5C9.5 8.2 9.82 8 10.15 8h3.7c.33 0 .65.2.9.5L17 13h1c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-1.5z"/>
      </svg>
    </div>
  `;
};

// Create HTML for plane marker
const createPlaneMarkerHTML = (isSelected: boolean = false): string => {
  const size = isSelected ? 56 : 44;
  return `
    <div style="
      width: ${size}px;
      height: ${size}px;
      background: linear-gradient(135deg, #14b8a6 0%, #0d9488 50%, #0f766e 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 24px rgba(20, 184, 166, 0.5), 0 0 0 4px rgba(255,255,255,0.9);
      cursor: pointer;
    ">
      <svg width="${size * 0.5}" height="${size * 0.5}" viewBox="0 0 24 24" fill="white">
        <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
      </svg>
    </div>
  `;
};

// Create HTML for location marker
const createLocationMarkerHTML = (type: 'origin' | 'destination', isSea: boolean = true): string => {
  const colors = {
    origin: isSea ? '#ec4899' : '#14b8a6',
    destination: '#6366f1',
  };
  const color = colors[type];
  const size = 18;

  return `
    <div style="
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 4px 12px rgba(0,0,0,0.25);
    "></div>
  `;
};

export default function MapboxMap({ shipments, selectedShipment }: MapboxMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const currentBoundsRef = useRef<mapboxgl.LngLatBounds | null>(null);
  const [projection, setProjection] = useState<'globe' | 'mercator'>('mercator');

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [10, 25],
      zoom: 1.5,
      minZoom: 1,
      maxZoom: 12,
      projection: 'mercator',
    });

    mapRef.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    mapRef.current.on('load', () => {
      // Map is ready
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update projection when toggled, preserving current view state
  useEffect(() => {
    if (mapRef.current) {
      const center = mapRef.current.getCenter();
      const zoom = mapRef.current.getZoom();
      const bearing = mapRef.current.getBearing();
      const pitch = mapRef.current.getPitch();

      mapRef.current.setProjection(projection);

      // Restore the view state after projection change
      mapRef.current.jumpTo({ center, zoom, bearing, pitch });
    }
  }, [projection]);

  // Handle container resize - re-center map when details pane opens/closes
  useEffect(() => {
    if (!mapContainerRef.current || !mapRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      if (mapRef.current) {
        // Notify Mapbox that the container size changed
        mapRef.current.resize();

        // Re-fit bounds if we have them stored, to keep content centered
        if (currentBoundsRef.current) {
          mapRef.current.fitBounds(currentBoundsRef.current, {
            padding: 60,
            maxZoom: 6,
            duration: 300
          });
        }
      }
    });

    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Update markers and routes
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Remove existing sources and layers
    const map = mapRef.current;

    // Wait for map to be loaded
    const updateMap = () => {
      // Remove existing layers and sources
      const layerIds = ['sea-route-historical', 'sea-route-predicted', 'air-route', 'sea-route-shadow', 'air-route-shadow'];
      layerIds.forEach(id => {
        if (map.getLayer(id)) map.removeLayer(id);
      });

      const sourceIds = ['sea-route-historical', 'sea-route-predicted', 'air-route'];
      sourceIds.forEach(id => {
        if (map.getSource(id)) map.removeSource(id);
      });

      if (selectedShipment) {
        if (selectedShipment.type === 'sea') {
          renderSeaShipment(selectedShipment as SeaShipment);
        } else {
          renderAirShipment(selectedShipment as AirShipment);
        }
      } else {
        renderAllShipments();
      }
    };

    if (map.isStyleLoaded()) {
      updateMap();
    } else {
      map.on('load', updateMap);
    }
  }, [selectedShipment, shipments]);

  const renderSeaShipment = (shipment: SeaShipment) => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    const { positions } = shipment;

    // Historical path coordinates
    const historicalCoords: [number, number][] = positions.historical.map(
      (p) => [p.lng, p.lat]
    );
    historicalCoords.push([positions.current.lng, positions.current.lat]);

    // Add historical route source and layer
    if (historicalCoords.length > 1) {
      map.addSource('sea-route-historical', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: historicalCoords,
          },
        },
      });

      map.addLayer({
        id: 'sea-route-historical',
        type: 'line',
        source: 'sea-route-historical',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#ec4899',
          'line-width': 4,
        },
      });

      // Origin marker
      const origin = positions.historical[0];
      const originEl = document.createElement('div');
      originEl.innerHTML = createLocationMarkerHTML('origin', true);
      const originMarker = new mapboxgl.Marker({ element: originEl.firstElementChild as HTMLElement })
        .setLngLat([origin.lng, origin.lat])
        .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`
          <div style="font-family: system-ui; padding: 8px;">
            <strong>Origin Port</strong>
            <p style="margin: 4px 0 0; color: #666;">${origin.location}</p>
          </div>
        `))
        .addTo(map);
      markersRef.current.push(originMarker);
    }

    // Current position (ship icon)
    const shipEl = document.createElement('div');
    shipEl.innerHTML = createShipMarkerHTML(true);
    const shipMarker = new mapboxgl.Marker({ element: shipEl.firstElementChild as HTMLElement })
      .setLngLat([positions.current.lng, positions.current.lat])
      .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div style="font-family: system-ui; padding: 8px;">
          <strong>${shipment.vessel.name}</strong>
          <p style="margin: 4px 0 0; color: #666;">${positions.current.location}</p>
          <p style="margin: 4px 0 0; font-size: 12px; color: #888;">
            Speed: ${positions.current.speed_knots} knots | Heading: ${positions.current.heading}°
          </p>
        </div>
      `))
      .addTo(map);
    markersRef.current.push(shipMarker);

    // Predicted path
    if (positions.predicted.length > 0) {
      const predictedCoords: [number, number][] = [
        [positions.current.lng, positions.current.lat],
        ...positions.predicted.map((p) => [p.lng, p.lat] as [number, number]),
      ];

      map.addSource('sea-route-predicted', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: predictedCoords,
          },
        },
      });

      map.addLayer({
        id: 'sea-route-predicted',
        type: 'line',
        source: 'sea-route-predicted',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#ec4899',
          'line-width': 3,
          'line-opacity': 0.5,
          'line-dasharray': [3, 2],
        },
      });

      // Destination marker
      const dest = positions.predicted[positions.predicted.length - 1];
      const destEl = document.createElement('div');
      destEl.innerHTML = createLocationMarkerHTML('destination', true);
      const destMarker = new mapboxgl.Marker({ element: destEl.firstElementChild as HTMLElement })
        .setLngLat([dest.lng, dest.lat])
        .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`
          <div style="font-family: system-ui; padding: 8px;">
            <strong>Destination</strong>
            <p style="margin: 4px 0 0; color: #666;">${dest.location}</p>
          </div>
        `))
        .addTo(map);
      markersRef.current.push(destMarker);
    }

    // Fit bounds
    const allCoords = [
      ...positions.historical.map((p) => [p.lng, p.lat] as [number, number]),
      [positions.current.lng, positions.current.lat] as [number, number],
      ...positions.predicted.map((p) => [p.lng, p.lat] as [number, number]),
    ];

    if (allCoords.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      allCoords.forEach(coord => bounds.extend(coord as [number, number]));
      currentBoundsRef.current = bounds;
      map.fitBounds(bounds, { padding: 60, maxZoom: 6 });
    }
  };

  const renderAirShipment = (shipment: AirShipment) => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    const { positions } = shipment;
    const origin = positions.origin;
    const destination = positions.destination;

    // Generate curved arc
    const arcPoints = generateArcPoints(
      [origin.lng, origin.lat],
      [destination.lng, destination.lat]
    );

    // Add arc route
    map.addSource('air-route', {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: arcPoints,
        },
      },
    });

    map.addLayer({
      id: 'air-route',
      type: 'line',
      source: 'air-route',
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
      },
      paint: {
        'line-color': '#14b8a6',
        'line-width': 4,
      },
    });

    // Origin marker
    const originEl = document.createElement('div');
    originEl.innerHTML = createLocationMarkerHTML('origin', false);
    const originMarker = new mapboxgl.Marker({ element: originEl.firstElementChild as HTMLElement })
      .setLngLat([origin.lng, origin.lat])
      .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div style="font-family: system-ui; padding: 8px;">
          <strong>${origin.airport_code}</strong>
          <p style="margin: 4px 0 0; color: #666;">${origin.airport_name}</p>
          <p style="margin: 4px 0 0; font-size: 12px; color: #888;">${origin.city}, ${origin.country}</p>
        </div>
      `))
      .addTo(map);
    markersRef.current.push(originMarker);

    // Destination marker
    const destEl = document.createElement('div');
    destEl.innerHTML = createLocationMarkerHTML('destination', false);
    const destMarker = new mapboxgl.Marker({ element: destEl.firstElementChild as HTMLElement })
      .setLngLat([destination.lng, destination.lat])
      .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div style="font-family: system-ui; padding: 8px;">
          <strong>${destination.airport_code}</strong>
          <p style="margin: 4px 0 0; color: #666;">${destination.airport_name}</p>
          <p style="margin: 4px 0 0; font-size: 12px; color: #888;">${destination.city}, ${destination.country}</p>
        </div>
      `))
      .addTo(map);
    markersRef.current.push(destMarker);

    // Plane icon at progress point
    if (shipment.progress > 0 && shipment.progress < 100) {
      const progressIndex = Math.floor((shipment.progress / 100) * arcPoints.length);
      const planePosition = arcPoints[Math.min(progressIndex, arcPoints.length - 1)];

      const planeEl = document.createElement('div');
      planeEl.innerHTML = createPlaneMarkerHTML(true);
      const planeMarker = new mapboxgl.Marker({ element: planeEl.firstElementChild as HTMLElement })
        .setLngLat(planePosition)
        .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`
          <div style="font-family: system-ui; padding: 8px;">
            <strong>${shipment.flight.carrier} ${shipment.flight.number}</strong>
            <p style="margin: 4px 0 0; color: #666;">${shipment.flight.aircraft}</p>
            <p style="margin: 4px 0 0; font-size: 12px; color: #888;">Progress: ${shipment.progress}%</p>
          </div>
        `))
        .addTo(map);
      markersRef.current.push(planeMarker);
    }

    // Fit bounds
    const bounds = new mapboxgl.LngLatBounds()
      .extend([origin.lng, origin.lat])
      .extend([destination.lng, destination.lat]);
    currentBoundsRef.current = bounds;
    map.fitBounds(bounds, { padding: 80, maxZoom: 5 });
  };

  const renderAllShipments = () => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    shipments.forEach((shipment) => {
      if (shipment.type === 'sea') {
        const seaShipment = shipment as SeaShipment;
        const pos = seaShipment.positions.current;

        const el = document.createElement('div');
        el.innerHTML = createShipMarkerHTML(false);
        const marker = new mapboxgl.Marker({ element: el.firstElementChild as HTMLElement })
          .setLngLat([pos.lng, pos.lat])
          .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`
            <div style="font-family: system-ui; padding: 8px;">
              <strong>${shipment.id}</strong>
              <p style="margin: 4px 0 0; color: #666;">${seaShipment.vessel.name}</p>
              <p style="margin: 4px 0 0; font-size: 12px; color: #888;">
                ${shipment.route.origin} → ${shipment.route.destination}
              </p>
            </div>
          `))
          .addTo(map);
        markersRef.current.push(marker);
      } else {
        const airShipment = shipment as AirShipment;
        const origin = airShipment.positions.origin;
        const dest = airShipment.positions.destination;

        // Position plane at progress point
        const progress = shipment.progress / 100;
        const arcPoints = generateArcPoints(
          [origin.lng, origin.lat],
          [dest.lng, dest.lat]
        );
        const progressIndex = Math.floor(progress * arcPoints.length);
        const position = arcPoints[Math.min(progressIndex, arcPoints.length - 1)];

        const el = document.createElement('div');
        el.innerHTML = createPlaneMarkerHTML(false);
        const marker = new mapboxgl.Marker({ element: el.firstElementChild as HTMLElement })
          .setLngLat(position)
          .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`
            <div style="font-family: system-ui; padding: 8px;">
              <strong>${shipment.id}</strong>
              <p style="margin: 4px 0 0; color: #666;">${airShipment.flight.carrier} ${airShipment.flight.number}</p>
              <p style="margin: 4px 0 0; font-size: 12px; color: #888;">
                ${shipment.route.origin} → ${shipment.route.destination}
              </p>
            </div>
          `))
          .addTo(map);
        markersRef.current.push(marker);
      }
    });

    // Reset view and clear bounds
    currentBoundsRef.current = null;
    map.flyTo({ center: [10, 25], zoom: 1.5 });
  };

  return (
    <div className="relative w-full h-full">
      <div
        ref={mapContainerRef}
        className="w-full h-full"
        style={{ minHeight: '400px' }}
      />

      {/* Map legend overlay */}
      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-3 border border-gray-100">
        <p className="text-xs font-semibold text-gray-700 mb-2">Legend</p>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <div className="w-6 h-0.5 bg-pink-500 rounded"></div>
            <span>Sea Route (Traveled)</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <div className="w-6 h-0.5 bg-pink-500/50 rounded" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #ec4899 0, #ec4899 4px, transparent 4px, transparent 8px)' }}></div>
            <span>Sea Route (Predicted)</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <div className="w-6 h-0.5 bg-teal-500 rounded"></div>
            <span>Air Route</span>
          </div>
        </div>
      </div>

      {/* Selected shipment indicator */}
      {selectedShipment && (
        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg px-4 py-2 border border-gray-100">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${selectedShipment.type === 'sea' ? 'bg-pink-500' : 'bg-teal-500'}`}></div>
            <span className="text-sm font-semibold text-gray-800">{selectedShipment.id}</span>
            <span className="text-xs text-gray-500">•</span>
            <span className="text-xs text-gray-500">{selectedShipment.type === 'sea' ? 'Sea Freight' : 'Air Freight'}</span>
          </div>
        </div>
      )}

      {/* Globe / Flat toggle */}
      <div className="absolute bottom-12 right-4 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 flex overflow-hidden z-10">
        <button
          onClick={() => setProjection('globe')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-all duration-200 ${
            projection === 'globe'
              ? 'bg-indigo-100 text-indigo-700'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
          title="Globe view"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <path d="M2 12h20"/>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          </svg>
          Globe
        </button>
        <button
          onClick={() => setProjection('mercator')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-all duration-200 ${
            projection === 'mercator'
              ? 'bg-indigo-100 text-indigo-700'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
          title="Flat map view"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <path d="M3 12h18"/>
            <path d="M12 3v18"/>
          </svg>
          Flat
        </button>
      </div>

      {/* Mapbox badge */}
      <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg shadow px-2 py-1 border border-gray-100">
        <span className="text-xs text-gray-500">Powered by Mapbox</span>
      </div>
    </div>
  );
}
