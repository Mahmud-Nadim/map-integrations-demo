'use client';

import dynamic from 'next/dynamic';
import { Shipment } from '@/types/shipment';

const GoogleMapsMap = dynamic(() => import('./GoogleMapsMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-50 to-yellow-50">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="absolute inset-0 border-4 border-red-200 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-red-500 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p className="text-red-600 font-medium">Loading Google Maps...</p>
        <p className="text-sm text-red-400 mt-1">Initializing map renderer</p>
      </div>
    </div>
  ),
});

interface GoogleMapsWrapperProps {
  shipments: Shipment[];
  selectedShipment: Shipment | null;
}

export default function GoogleMapsWrapper({ shipments, selectedShipment }: GoogleMapsWrapperProps) {
  return <GoogleMapsMap shipments={shipments} selectedShipment={selectedShipment} />;
}
