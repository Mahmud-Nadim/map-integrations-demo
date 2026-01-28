'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Shipment, SeaShipment, AirShipment } from '@/types/shipment';

interface ShipmentMapProps {
  shipments: Shipment[];
  selectedShipment: Shipment | null;
}

// Custom ship icon with gradient and shadow
const createShipIcon = (isSelected: boolean = false) => {
  const size = isSelected ? 56 : 44;
  return L.divIcon({
    className: 'custom-ship-icon',
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: linear-gradient(135deg, #ec4899 0%, #db2777 50%, #be185d 100%);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 8px 24px rgba(236, 72, 153, 0.5), 0 0 0 4px rgba(255,255,255,0.9);
        transform: ${isSelected ? 'scale(1)' : 'scale(0.85)'};
        transition: transform 0.3s ease;
      ">
        <svg width="${size * 0.5}" height="${size * 0.5}" viewBox="0 0 24 24" fill="white" style="filter: drop-shadow(0 1px 2px rgba(0,0,0,0.2));">
          <path d="M20 21c-1.39 0-2.78-.47-4-1.32-2.44 1.71-5.56 1.71-8 0C6.78 20.53 5.39 21 4 21H2v2h2c1.38 0 2.74-.35 4-.99 2.52 1.29 5.48 1.29 8 0 1.26.64 2.62.99 4 .99h2v-2h-2zm-3.5-5l-1.5-3h-6l-1.5 3H6c-.83 0-1.5-.67-1.5-1.5S5.17 13 6 13h1l2.25-4.5C9.5 8.2 9.82 8 10.15 8h3.7c.33 0 .65.2.9.5L17 13h1c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-1.5z"/>
        </svg>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

// Custom plane icon with gradient
const createPlaneIcon = (isSelected: boolean = false) => {
  const size = isSelected ? 56 : 44;
  return L.divIcon({
    className: 'custom-plane-icon',
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: linear-gradient(135deg, #14b8a6 0%, #0d9488 50%, #0f766e 100%);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 8px 24px rgba(20, 184, 166, 0.5), 0 0 0 4px rgba(255,255,255,0.9);
        transform: ${isSelected ? 'scale(1)' : 'scale(0.85)'};
        transition: transform 0.3s ease;
      ">
        <svg width="${size * 0.5}" height="${size * 0.5}" viewBox="0 0 24 24" fill="white" style="filter: drop-shadow(0 1px 2px rgba(0,0,0,0.2));">
          <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
        </svg>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

// Airport/port marker icons
const createLocationIcon = (type: 'origin' | 'destination' | 'port', isSea: boolean = true) => {
  const colors = {
    origin: isSea ? '#ec4899' : '#14b8a6',
    destination: isSea ? '#6366f1' : '#6366f1',
    port: '#ec4899',
  };
  const color = colors[type];
  const size = type === 'port' ? 14 : 18;

  return L.divIcon({
    className: 'custom-location-icon',
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.25);
      "></div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

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
    const lat = start[0] + (end[0] - start[0]) * t;
    const lng = start[1] + (end[1] - start[1]) * t;

    // Add curvature - higher arc for longer distances
    const curveFactor = Math.sin(Math.PI * t) * Math.min(distance * 0.12, 15);
    points.push([lat + curveFactor, lng]);
  }

  return points;
}

// Create styled popup content
const createPopupContent = (title: string, subtitle: string, details: string[], color: string) => {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; min-width: 220px; padding: 4px;">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
        <div style="width: 8px; height: 8px; background: ${color}; border-radius: 50%;"></div>
        <strong style="color: #1e1b4b; font-size: 14px;">${title}</strong>
      </div>
      <div style="color: #4b5563; font-size: 13px; margin-bottom: 6px;">${subtitle}</div>
      ${details.map(d => `<div style="color: #6b7280; font-size: 12px; margin-top: 4px;">${d}</div>`).join('')}
    </div>
  `;
};

export default function ShipmentMap({ shipments, selectedShipment }: ShipmentMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const routesRef = useRef<L.LayerGroup | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    mapRef.current = L.map(mapContainerRef.current, {
      center: [25, 10],
      zoom: 2,
      minZoom: 2,
      maxZoom: 12,
      worldCopyJump: true,
      zoomControl: false,
    });

    // Add zoom control to top-right
    L.control.zoom({ position: 'topright' }).addTo(mapRef.current);

    // Styled map tiles - using Voyager for a cleaner look
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20,
    }).addTo(mapRef.current);

    markersRef.current = L.layerGroup().addTo(mapRef.current);
    routesRef.current = L.layerGroup().addTo(mapRef.current);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update markers and routes
  useEffect(() => {
    if (!mapRef.current || !markersRef.current || !routesRef.current) return;

    markersRef.current.clearLayers();
    routesRef.current.clearLayers();

    if (selectedShipment) {
      if (selectedShipment.type === 'sea') {
        renderSeaShipment(selectedShipment as SeaShipment);
      } else {
        renderAirShipment(selectedShipment as AirShipment);
      }
    } else {
      renderAllShipments();
    }
  }, [selectedShipment, shipments]);

  const renderSeaShipment = (shipment: SeaShipment) => {
    if (!mapRef.current || !markersRef.current || !routesRef.current) return;

    const { positions } = shipment;

    // Historical path (solid gradient line)
    if (positions.historical.length > 0) {
      const historicalCoords = positions.historical.map(
        (p) => [p.lat, p.lng] as [number, number]
      );
      historicalCoords.push([positions.current.lat, positions.current.lng]);

      // Create path with shadow effect
      const shadowLine = L.polyline(historicalCoords, {
        color: '#00000020',
        weight: 8,
        opacity: 1,
      });
      routesRef.current.addLayer(shadowLine);

      const historicalLine = L.polyline(historicalCoords, {
        color: '#ec4899',
        weight: 4,
        opacity: 1,
        lineCap: 'round',
        lineJoin: 'round',
      });
      routesRef.current.addLayer(historicalLine);

      // Origin marker
      const origin = positions.historical[0];
      const originMarker = L.marker([origin.lat, origin.lng], {
        icon: createLocationIcon('origin', true),
      }).bindPopup(createPopupContent(
        'Origin Port',
        origin.location || 'Departure',
        [`Departed: ${new Date(origin.timestamp!).toLocaleDateString()}`],
        '#ec4899'
      ));
      markersRef.current.addLayer(originMarker);
    }

    // Current position (ship icon)
    const shipMarker = L.marker([positions.current.lat, positions.current.lng], {
      icon: createShipIcon(true),
      zIndexOffset: 1000,
    }).bindPopup(createPopupContent(
      shipment.vessel.name,
      positions.current.location || 'At Sea',
      [
        `Speed: ${positions.current.speed_knots} knots`,
        `Heading: ${positions.current.heading}°`,
        `Progress: ${shipment.progress}%`
      ],
      '#ec4899'
    ));
    markersRef.current.addLayer(shipMarker);

    // Predicted path (dashed line)
    if (positions.predicted.length > 0) {
      const predictedCoords: [number, number][] = [
        [positions.current.lat, positions.current.lng],
        ...positions.predicted.map((p) => [p.lat, p.lng] as [number, number]),
      ];

      const predictedLine = L.polyline(predictedCoords, {
        color: '#ec4899',
        weight: 3,
        opacity: 0.5,
        dashArray: '12, 8',
        lineCap: 'round',
      });
      routesRef.current.addLayer(predictedLine);

      // Destination marker
      const dest = positions.predicted[positions.predicted.length - 1];
      const destMarker = L.marker([dest.lat, dest.lng], {
        icon: createLocationIcon('destination', true),
      }).bindPopup(createPopupContent(
        'Destination',
        dest.location || 'Arrival Port',
        [`ETA: ${new Date(dest.timestamp!).toLocaleDateString()}`],
        '#6366f1'
      ));
      markersRef.current.addLayer(destMarker);
    }

    // Fit bounds
    const allCoords = [
      ...positions.historical.map((p) => [p.lat, p.lng] as [number, number]),
      [positions.current.lat, positions.current.lng] as [number, number],
      ...positions.predicted.map((p) => [p.lat, p.lng] as [number, number]),
    ];

    if (allCoords.length > 0) {
      const bounds = L.latLngBounds(allCoords);
      mapRef.current.fitBounds(bounds, { padding: [60, 60], maxZoom: 6 });
    }
  };

  const renderAirShipment = (shipment: AirShipment) => {
    if (!mapRef.current || !markersRef.current || !routesRef.current) return;

    const { positions } = shipment;
    const origin = positions.origin;
    const destination = positions.destination;

    // Generate curved arc
    const arcPoints = generateArcPoints(
      [origin.lat, origin.lng],
      [destination.lat, destination.lng]
    );

    // Shadow arc
    const shadowArc = L.polyline(arcPoints, {
      color: '#00000015',
      weight: 8,
      opacity: 1,
    });
    routesRef.current.addLayer(shadowArc);

    // Main arc with gradient effect (using two overlapping lines)
    const arcLine = L.polyline(arcPoints, {
      color: '#14b8a6',
      weight: 4,
      opacity: 1,
      lineCap: 'round',
      lineJoin: 'round',
    });
    routesRef.current.addLayer(arcLine);

    // Origin marker
    const originMarker = L.marker([origin.lat, origin.lng], {
      icon: createLocationIcon('origin', false),
    }).bindPopup(createPopupContent(
      origin.airport_code,
      origin.airport_name,
      [`${origin.city}, ${origin.country}`],
      '#14b8a6'
    ));
    markersRef.current.addLayer(originMarker);

    // Destination marker
    const destMarker = L.marker([destination.lat, destination.lng], {
      icon: createLocationIcon('destination', false),
    }).bindPopup(createPopupContent(
      destination.airport_code,
      destination.airport_name,
      [`${destination.city}, ${destination.country}`],
      '#6366f1'
    ));
    markersRef.current.addLayer(destMarker);

    // Plane icon at progress point
    if (shipment.progress > 0 && shipment.progress < 100) {
      const progressIndex = Math.floor((shipment.progress / 100) * arcPoints.length);
      const planePosition = arcPoints[Math.min(progressIndex, arcPoints.length - 1)];

      const planeMarker = L.marker(planePosition, {
        icon: createPlaneIcon(true),
        zIndexOffset: 1000,
      }).bindPopup(createPopupContent(
        `${shipment.flight.carrier} ${shipment.flight.number}`,
        shipment.flight.aircraft,
        [`Progress: ${shipment.progress}%`],
        '#14b8a6'
      ));
      markersRef.current.addLayer(planeMarker);
    }

    // Fit bounds
    const bounds = L.latLngBounds([
      [origin.lat, origin.lng],
      [destination.lat, destination.lng],
    ]);
    mapRef.current.fitBounds(bounds, { padding: [80, 80], maxZoom: 5 });
  };

  const renderAllShipments = () => {
    if (!mapRef.current || !markersRef.current) return;

    shipments.forEach((shipment) => {
      if (shipment.type === 'sea') {
        const seaShipment = shipment as SeaShipment;
        const pos = seaShipment.positions.current;

        const marker = L.marker([pos.lat, pos.lng], {
          icon: createShipIcon(false),
        }).bindPopup(createPopupContent(
          shipment.id,
          seaShipment.vessel.name,
          [`${shipment.route.origin} → ${shipment.route.destination}`, `Progress: ${shipment.progress}%`],
          '#ec4899'
        ));
        markersRef.current!.addLayer(marker);
      } else {
        const airShipment = shipment as AirShipment;
        const origin = airShipment.positions.origin;
        const dest = airShipment.positions.destination;

        // Position plane at progress point
        const progress = shipment.progress / 100;
        const arcPoints = generateArcPoints(
          [origin.lat, origin.lng],
          [dest.lat, dest.lng]
        );
        const progressIndex = Math.floor(progress * arcPoints.length);
        const position = arcPoints[Math.min(progressIndex, arcPoints.length - 1)];

        const marker = L.marker(position, {
          icon: createPlaneIcon(false),
        }).bindPopup(createPopupContent(
          shipment.id,
          `${airShipment.flight.carrier} ${airShipment.flight.number}`,
          [`${shipment.route.origin} → ${shipment.route.destination}`, `Progress: ${shipment.progress}%`],
          '#14b8a6'
        ));
        markersRef.current!.addLayer(marker);
      }
    });

    // Reset view
    mapRef.current.setView([25, 10], 2);
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
    </div>
  );
}
