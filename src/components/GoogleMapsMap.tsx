'use client';

import { useEffect, useRef, useCallback } from 'react';
import { Shipment, SeaShipment, AirShipment } from '@/types/shipment';

interface GoogleMapsMapProps {
  shipments: Shipment[];
  selectedShipment: Shipment | null;
}

// Generate curved arc points for air routes
function generateArcPoints(
  start: { lat: number; lng: number },
  end: { lat: number; lng: number },
  numPoints: number = 60
): google.maps.LatLngLiteral[] {
  const points: google.maps.LatLngLiteral[] = [];
  const distance = Math.sqrt(
    Math.pow(end.lng - start.lng, 2) + Math.pow(end.lat - start.lat, 2)
  );

  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    const lng = start.lng + (end.lng - start.lng) * t;
    const lat = start.lat + (end.lat - start.lat) * t;

    // Add curvature - higher arc for longer distances
    const curveFactor = Math.sin(Math.PI * t) * Math.min(distance * 0.12, 15);
    points.push({ lat: lat + curveFactor, lng });
  }

  return points;
}

// Create ship marker icon
const createShipIcon = (isSelected: boolean = false): google.maps.Symbol => ({
  path: 'M20 21c-1.39 0-2.78-.47-4-1.32-2.44 1.71-5.56 1.71-8 0C6.78 20.53 5.39 21 4 21H2v2h2c1.38 0 2.74-.35 4-.99 2.52 1.29 5.48 1.29 8 0 1.26.64 2.62.99 4 .99h2v-2h-2zm-3.5-5l-1.5-3h-6l-1.5 3H6c-.83 0-1.5-.67-1.5-1.5S5.17 13 6 13h1l2.25-4.5C9.5 8.2 9.82 8 10.15 8h3.7c.33 0 .65.2.9.5L17 13h1c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-1.5z',
  fillColor: '#ec4899',
  fillOpacity: 1,
  strokeColor: '#ffffff',
  strokeWeight: 2,
  scale: isSelected ? 1.8 : 1.4,
  anchor: new google.maps.Point(12, 12),
});

// Create plane marker icon
const createPlaneIcon = (isSelected: boolean = false): google.maps.Symbol => ({
  path: 'M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z',
  fillColor: '#14b8a6',
  fillOpacity: 1,
  strokeColor: '#ffffff',
  strokeWeight: 2,
  scale: isSelected ? 1.8 : 1.4,
  anchor: new google.maps.Point(12, 12),
});

// Create location marker icon
const createLocationIcon = (type: 'origin' | 'destination', isSea: boolean = true): google.maps.Symbol => {
  const colors = {
    origin: isSea ? '#ec4899' : '#14b8a6',
    destination: '#6366f1',
  };
  return {
    path: google.maps.SymbolPath.CIRCLE,
    fillColor: colors[type],
    fillOpacity: 1,
    strokeColor: '#ffffff',
    strokeWeight: 3,
    scale: 8,
  };
};

export default function GoogleMapsMap({ shipments, selectedShipment }: GoogleMapsMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const polylinesRef = useRef<google.maps.Polyline[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  // Clear all markers and polylines
  const clearMap = useCallback(() => {
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
    polylinesRef.current.forEach(polyline => polyline.setMap(null));
    polylinesRef.current = [];
    if (infoWindowRef.current) {
      infoWindowRef.current.close();
    }
  }, []);

  // Render sea shipment
  const renderSeaShipment = useCallback((shipment: SeaShipment) => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    const { positions } = shipment;

    // Historical path coordinates
    const historicalCoords: google.maps.LatLngLiteral[] = positions.historical.map(
      (p) => ({ lat: p.lat, lng: p.lng })
    );
    historicalCoords.push({ lat: positions.current.lat, lng: positions.current.lng });

    // Add historical route polyline
    if (historicalCoords.length > 1) {
      const historicalPolyline = new google.maps.Polyline({
        path: historicalCoords,
        geodesic: true,
        strokeColor: '#ec4899',
        strokeOpacity: 1.0,
        strokeWeight: 4,
        map,
      });
      polylinesRef.current.push(historicalPolyline);

      // Origin marker
      const origin = positions.historical[0];
      const originMarker = new google.maps.Marker({
        position: { lat: origin.lat, lng: origin.lng },
        map,
        icon: createLocationIcon('origin', true),
        title: 'Origin Port',
      });
      originMarker.addListener('click', () => {
        if (infoWindowRef.current) {
          infoWindowRef.current.setContent(`
            <div style="font-family: system-ui; padding: 8px;">
              <strong>Origin Port</strong>
              <p style="margin: 4px 0 0; color: #666;">${origin.location}</p>
            </div>
          `);
          infoWindowRef.current.open(map, originMarker);
        }
      });
      markersRef.current.push(originMarker);
    }

    // Current position (ship icon)
    const shipMarker = new google.maps.Marker({
      position: { lat: positions.current.lat, lng: positions.current.lng },
      map,
      icon: createShipIcon(true),
      title: shipment.vessel.name,
      zIndex: 100,
    });
    shipMarker.addListener('click', () => {
      if (infoWindowRef.current) {
        infoWindowRef.current.setContent(`
          <div style="font-family: system-ui; padding: 8px;">
            <strong>${shipment.vessel.name}</strong>
            <p style="margin: 4px 0 0; color: #666;">${positions.current.location}</p>
            <p style="margin: 4px 0 0; font-size: 12px; color: #888;">
              Speed: ${positions.current.speed_knots} knots | Heading: ${positions.current.heading}°
            </p>
          </div>
        `);
        infoWindowRef.current.open(map, shipMarker);
      }
    });
    markersRef.current.push(shipMarker);

    // Predicted path
    if (positions.predicted.length > 0) {
      const predictedCoords: google.maps.LatLngLiteral[] = [
        { lat: positions.current.lat, lng: positions.current.lng },
        ...positions.predicted.map((p) => ({ lat: p.lat, lng: p.lng })),
      ];

      const predictedPolyline = new google.maps.Polyline({
        path: predictedCoords,
        geodesic: true,
        strokeColor: '#ec4899',
        strokeOpacity: 0.5,
        strokeWeight: 3,
        icons: [{
          icon: { path: 'M 0,-1 0,1', strokeOpacity: 1, scale: 3 },
          offset: '0',
          repeat: '15px',
        }],
        map,
      });
      polylinesRef.current.push(predictedPolyline);

      // Destination marker
      const dest = positions.predicted[positions.predicted.length - 1];
      const destMarker = new google.maps.Marker({
        position: { lat: dest.lat, lng: dest.lng },
        map,
        icon: createLocationIcon('destination', true),
        title: 'Destination',
      });
      destMarker.addListener('click', () => {
        if (infoWindowRef.current) {
          infoWindowRef.current.setContent(`
            <div style="font-family: system-ui; padding: 8px;">
              <strong>Destination</strong>
              <p style="margin: 4px 0 0; color: #666;">${dest.location}</p>
            </div>
          `);
          infoWindowRef.current.open(map, destMarker);
        }
      });
      markersRef.current.push(destMarker);
    }

    // Fit bounds
    const bounds = new google.maps.LatLngBounds();
    positions.historical.forEach((p) => bounds.extend({ lat: p.lat, lng: p.lng }));
    bounds.extend({ lat: positions.current.lat, lng: positions.current.lng });
    positions.predicted.forEach((p) => bounds.extend({ lat: p.lat, lng: p.lng }));
    map.fitBounds(bounds, 60);
  }, []);

  // Render air shipment
  const renderAirShipment = useCallback((shipment: AirShipment) => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    const { positions } = shipment;
    const origin = positions.origin;
    const destination = positions.destination;

    // Generate curved arc
    const arcPoints = generateArcPoints(
      { lat: origin.lat, lng: origin.lng },
      { lat: destination.lat, lng: destination.lng }
    );

    // Add arc route polyline
    const arcPolyline = new google.maps.Polyline({
      path: arcPoints,
      geodesic: false,
      strokeColor: '#14b8a6',
      strokeOpacity: 1.0,
      strokeWeight: 4,
      map,
    });
    polylinesRef.current.push(arcPolyline);

    // Origin marker
    const originMarker = new google.maps.Marker({
      position: { lat: origin.lat, lng: origin.lng },
      map,
      icon: createLocationIcon('origin', false),
      title: origin.airport_code,
    });
    originMarker.addListener('click', () => {
      if (infoWindowRef.current) {
        infoWindowRef.current.setContent(`
          <div style="font-family: system-ui; padding: 8px;">
            <strong>${origin.airport_code}</strong>
            <p style="margin: 4px 0 0; color: #666;">${origin.airport_name}</p>
            <p style="margin: 4px 0 0; font-size: 12px; color: #888;">${origin.city}, ${origin.country}</p>
          </div>
        `);
        infoWindowRef.current.open(map, originMarker);
      }
    });
    markersRef.current.push(originMarker);

    // Destination marker
    const destMarker = new google.maps.Marker({
      position: { lat: destination.lat, lng: destination.lng },
      map,
      icon: createLocationIcon('destination', false),
      title: destination.airport_code,
    });
    destMarker.addListener('click', () => {
      if (infoWindowRef.current) {
        infoWindowRef.current.setContent(`
          <div style="font-family: system-ui; padding: 8px;">
            <strong>${destination.airport_code}</strong>
            <p style="margin: 4px 0 0; color: #666;">${destination.airport_name}</p>
            <p style="margin: 4px 0 0; font-size: 12px; color: #888;">${destination.city}, ${destination.country}</p>
          </div>
        `);
        infoWindowRef.current.open(map, destMarker);
      }
    });
    markersRef.current.push(destMarker);

    // Plane icon at progress point
    if (shipment.progress > 0 && shipment.progress < 100) {
      const progressIndex = Math.floor((shipment.progress / 100) * arcPoints.length);
      const planePosition = arcPoints[Math.min(progressIndex, arcPoints.length - 1)];

      const planeMarker = new google.maps.Marker({
        position: planePosition,
        map,
        icon: createPlaneIcon(true),
        title: `${shipment.flight.carrier} ${shipment.flight.number}`,
        zIndex: 100,
      });
      planeMarker.addListener('click', () => {
        if (infoWindowRef.current) {
          infoWindowRef.current.setContent(`
            <div style="font-family: system-ui; padding: 8px;">
              <strong>${shipment.flight.carrier} ${shipment.flight.number}</strong>
              <p style="margin: 4px 0 0; color: #666;">${shipment.flight.aircraft}</p>
              <p style="margin: 4px 0 0; font-size: 12px; color: #888;">Progress: ${shipment.progress}%</p>
            </div>
          `);
          infoWindowRef.current.open(map, planeMarker);
        }
      });
      markersRef.current.push(planeMarker);
    }

    // Fit bounds
    const bounds = new google.maps.LatLngBounds();
    bounds.extend({ lat: origin.lat, lng: origin.lng });
    bounds.extend({ lat: destination.lat, lng: destination.lng });
    map.fitBounds(bounds, 80);
  }, []);

  // Render all shipments overview
  const renderAllShipments = useCallback(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    shipments.forEach((shipment) => {
      if (shipment.type === 'sea') {
        const seaShipment = shipment as SeaShipment;
        const pos = seaShipment.positions.current;

        const marker = new google.maps.Marker({
          position: { lat: pos.lat, lng: pos.lng },
          map,
          icon: createShipIcon(false),
          title: shipment.id,
        });
        marker.addListener('click', () => {
          if (infoWindowRef.current) {
            infoWindowRef.current.setContent(`
              <div style="font-family: system-ui; padding: 8px;">
                <strong>${shipment.id}</strong>
                <p style="margin: 4px 0 0; color: #666;">${seaShipment.vessel.name}</p>
                <p style="margin: 4px 0 0; font-size: 12px; color: #888;">
                  ${shipment.route.origin} → ${shipment.route.destination}
                </p>
              </div>
            `);
            infoWindowRef.current.open(map, marker);
          }
        });
        markersRef.current.push(marker);
      } else {
        const airShipment = shipment as AirShipment;
        const origin = airShipment.positions.origin;
        const dest = airShipment.positions.destination;

        // Position plane at progress point
        const progress = shipment.progress / 100;
        const arcPoints = generateArcPoints(
          { lat: origin.lat, lng: origin.lng },
          { lat: dest.lat, lng: dest.lng }
        );
        const progressIndex = Math.floor(progress * arcPoints.length);
        const position = arcPoints[Math.min(progressIndex, arcPoints.length - 1)];

        const marker = new google.maps.Marker({
          position,
          map,
          icon: createPlaneIcon(false),
          title: shipment.id,
        });
        marker.addListener('click', () => {
          if (infoWindowRef.current) {
            infoWindowRef.current.setContent(`
              <div style="font-family: system-ui; padding: 8px;">
                <strong>${shipment.id}</strong>
                <p style="margin: 4px 0 0; color: #666;">${airShipment.flight.carrier} ${airShipment.flight.number}</p>
                <p style="margin: 4px 0 0; font-size: 12px; color: #888;">
                  ${shipment.route.origin} → ${shipment.route.destination}
                </p>
              </div>
            `);
            infoWindowRef.current.open(map, marker);
          }
        });
        markersRef.current.push(marker);
      }
    });

    // Reset view to world
    map.setCenter({ lat: 25, lng: 10 });
    map.setZoom(2);
  }, [shipments]);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const initMap = () => {
      if (!mapContainerRef.current) return;

      mapRef.current = new google.maps.Map(mapContainerRef.current, {
        center: { lat: 25, lng: 10 },
        zoom: 2,
        minZoom: 1,
        maxZoom: 12,
        mapTypeControl: true,
        mapTypeControlOptions: {
          style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
          position: google.maps.ControlPosition.TOP_LEFT,
        },
        zoomControl: true,
        zoomControlOptions: {
          position: google.maps.ControlPosition.RIGHT_CENTER,
        },
        streetViewControl: false,
        fullscreenControl: true,
        fullscreenControlOptions: {
          position: google.maps.ControlPosition.RIGHT_TOP,
        },
        styles: [
          {
            featureType: 'water',
            elementType: 'geometry',
            stylers: [{ color: '#cce7ff' }, { lightness: 40 }],
          },
          {
            featureType: 'landscape',
            elementType: 'geometry',
            stylers: [{ color: '#f8f9fa' }, { lightness: 20 }],
          },
          {
            featureType: 'road.highway',
            elementType: 'geometry.fill',
            stylers: [{ color: '#ffffff' }, { lightness: 20 }],
          },
          {
            featureType: 'road.highway',
            elementType: 'geometry.stroke',
            stylers: [{ color: '#e0e0e0' }, { lightness: 25 }],
          },
          {
            featureType: 'road.arterial',
            elementType: 'geometry.fill',
            stylers: [{ color: '#ffffff' }],
          },
          {
            featureType: 'road.local',
            elementType: 'geometry.fill',
            stylers: [{ color: '#ffffff' }],
          },
          {
            featureType: 'administrative',
            elementType: 'geometry.stroke',
            stylers: [{ color: '#d0d0d0' }, { lightness: 30 }, { weight: 1 }],
          },
          {
            featureType: 'administrative.country',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#9e9e9e' }],
          },
          {
            featureType: 'poi',
            elementType: 'geometry',
            stylers: [{ color: '#f0f0f0' }, { lightness: 20 }],
          },
          {
            featureType: 'poi.park',
            elementType: 'geometry',
            stylers: [{ color: '#e8f5e9' }, { lightness: 20 }],
          },
          {
            featureType: 'transit',
            stylers: [{ visibility: 'off' }],
          },
        ],
      });

      infoWindowRef.current = new google.maps.InfoWindow();
    };

    // Load Google Maps script if not already loaded
    if (typeof google === 'undefined' || !google.maps) {
      const script = document.createElement('script');
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry`;
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      document.head.appendChild(script);
    } else {
      initMap();
    }

    return () => {
      clearMap();
      mapRef.current = null;
    };
  }, [clearMap]);

  // Update markers and routes when selection changes
  useEffect(() => {
    if (!mapRef.current) return;

    clearMap();

    if (selectedShipment) {
      if (selectedShipment.type === 'sea') {
        renderSeaShipment(selectedShipment as SeaShipment);
      } else {
        renderAirShipment(selectedShipment as AirShipment);
      }
    } else {
      renderAllShipments();
    }
  }, [selectedShipment, shipments, clearMap, renderSeaShipment, renderAirShipment, renderAllShipments]);

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

      {/* Google Maps badge */}
      <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg shadow px-2 py-1 border border-gray-100">
        <span className="text-xs text-gray-500">Powered by Google Maps</span>
      </div>
    </div>
  );
}
