'use client';

import { useState } from 'react';
import Link from 'next/link';
import shipmentsData from '../../../data/shipments.json';
import { Shipment } from '@/types/shipment';
import ShipmentList from '@/components/ShipmentList';
import ShipmentDetails from '@/components/ShipmentDetails';
import MapWrapper from '@/components/MapWrapper';

export default function LeafletDashboard() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const shipments = shipmentsData.shipments as Shipment[];

  const selectedShipment = selectedId
    ? shipments.find((s) => s.id === selectedId) || null
    : null;

  const stats = {
    total: shipments.length,
    inTransit: shipments.filter((s) => s.status === 'IN_TRANSIT').length,
    sea: shipments.filter((s) => s.type === 'sea').length,
    air: shipments.filter((s) => s.type === 'air').length,
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Back to Home"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/25">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Leaflet <span className="text-green-600">Dashboard</span>
                </h1>
                <p className="text-sm text-gray-500">Open-source mapping</p>
              </div>
            </div>
          </div>

          {/* Stats badges */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              <span className="text-sm font-medium text-gray-700">{stats.inTransit} Active</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-pink-50 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-pink-500"></span>
              <span className="text-sm font-medium text-pink-700">{stats.sea} Sea</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-teal-50 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-teal-500"></span>
              <span className="text-sm font-medium text-teal-700">{stats.air} Air</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Shipment List */}
        <div className="w-96 flex-shrink-0 border-r border-gray-200 overflow-hidden">
          <ShipmentList
            shipments={shipments}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </div>

        {/* Center - Map */}
        <div className="flex-1 relative">
          <MapWrapper
            shipments={shipments}
            selectedShipment={selectedShipment}
          />
        </div>

        {/* Right Panel - Details */}
        {selectedShipment && (
          <div className="w-[420px] flex-shrink-0 border-l border-gray-200 overflow-y-auto bg-gray-50 p-4 animate-in">
            <ShipmentDetails
              shipment={selectedShipment}
              onClose={() => setSelectedId(null)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
