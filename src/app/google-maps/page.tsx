'use client';

import { useState } from 'react';
import Link from 'next/link';
import shipmentsData from '../../../data/shipments.json';
import { Shipment } from '@/types/shipment';
import ShipmentList from '@/components/ShipmentList';
import ShipmentDetails from '@/components/ShipmentDetails';
import GoogleMapsWrapper from '@/components/GoogleMapsWrapper';

export default function GoogleMapsDashboard() {
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
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-yellow-500 flex items-center justify-center shadow-lg shadow-red-500/25">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Google Maps <span className="text-red-600">Dashboard</span>
                </h1>
                <p className="text-sm text-gray-500">Industry-standard mapping</p>
              </div>
            </div>
          </div>

          {/* Stats badges */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
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
          <GoogleMapsWrapper
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
