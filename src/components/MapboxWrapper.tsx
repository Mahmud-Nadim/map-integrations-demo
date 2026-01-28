'use client';

import dynamic from 'next/dynamic';
import { Shipment } from '@/types/shipment';

const MapboxMap = dynamic(() => import('./MapboxMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p className="text-blue-600 font-medium">Loading Mapbox...</p>
        <p className="text-sm text-blue-400 mt-1">Initializing WebGL renderer</p>
      </div>
    </div>
  ),
});

interface MapboxWrapperProps {
  shipments: Shipment[];
  selectedShipment: Shipment | null;
}

export default function MapboxWrapper({ shipments, selectedShipment }: MapboxWrapperProps) {
  return <MapboxMap shipments={shipments} selectedShipment={selectedShipment} />;
}
