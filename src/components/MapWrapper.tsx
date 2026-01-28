'use client';

import dynamic from 'next/dynamic';
import { Shipment } from '@/types/shipment';

const ShipmentMap = dynamic(() => import('./ShipmentMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-100 rounded-lg">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-gray-500 text-sm">Loading map...</span>
      </div>
    </div>
  ),
});

interface MapWrapperProps {
  shipments: Shipment[];
  selectedShipment: Shipment | null;
}

export default function MapWrapper({ shipments, selectedShipment }: MapWrapperProps) {
  return <ShipmentMap shipments={shipments} selectedShipment={selectedShipment} />;
}
