'use client';

import { useState, useMemo, ReactNode } from 'react';
import { Shipment } from '@/types/shipment';
import ShipmentCard from './ShipmentCard';

interface ShipmentListProps {
  shipments: Shipment[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

type FilterType = 'all' | 'sea' | 'air' | 'transit';

export default function ShipmentList({ shipments, selectedId, onSelect }: ShipmentListProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredShipments = useMemo(() => {
    let result = shipments;

    // Apply type filter
    if (activeFilter === 'sea') {
      result = result.filter((s) => s.type === 'sea');
    } else if (activeFilter === 'air') {
      result = result.filter((s) => s.type === 'air');
    } else if (activeFilter === 'transit') {
      result = result.filter((s) => s.status === 'IN_TRANSIT');
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.id.toLowerCase().includes(query) ||
          s.shipper.toLowerCase().includes(query) ||
          s.route.origin.toLowerCase().includes(query) ||
          s.route.destination.toLowerCase().includes(query)
      );
    }

    return result;
  }, [shipments, activeFilter, searchQuery]);

  const stats = useMemo(() => ({
    total: shipments.length,
    inTransit: shipments.filter((s) => s.status === 'IN_TRANSIT').length,
    sea: shipments.filter((s) => s.type === 'sea').length,
    air: shipments.filter((s) => s.type === 'air').length,
  }), [shipments]);

  const filters: { key: FilterType; label: string; count: number; icon: ReactNode }[] = [
    {
      key: 'all',
      label: 'All',
      count: stats.total,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      ),
    },
    {
      key: 'sea',
      label: 'Sea',
      count: stats.sea,
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20 21c-1.39 0-2.78-.47-4-1.32-2.44 1.71-5.56 1.71-8 0C6.78 20.53 5.39 21 4 21H2v2h2c1.38 0 2.74-.35 4-.99 2.52 1.29 5.48 1.29 8 0 1.26.64 2.62.99 4 .99h2v-2h-2z"/>
        </svg>
      ),
    },
    {
      key: 'air',
      label: 'Air',
      count: stats.air,
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
        </svg>
      ),
    },
    {
      key: 'transit',
      label: 'In Transit',
      count: stats.inTransit,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="p-5 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Live Tracking</h2>
            <p className="text-xs text-indigo-200">
              {stats.total} shipments • {stats.inTransit} active
            </p>
          </div>
        </div>

        {/* Search in header */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search by ID, shipper, route..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white/10 backdrop-blur border border-white/20 rounded-xl text-sm text-white placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white/20 transition-all"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-200"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-200 hover:text-white"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 py-3 border-b border-gray-100 bg-white">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {filters.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                activeFilter === filter.key
                  ? 'bg-indigo-100 text-indigo-700 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {filter.icon}
              <span>{filter.label}</span>
              <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${
                activeFilter === filter.key
                  ? 'bg-indigo-200 text-indigo-800'
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {filter.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Shipment Cards */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredShipments.length > 0 ? (
          filteredShipments.map((shipment) => (
            <ShipmentCard
              key={shipment.id}
              shipment={shipment}
              isSelected={selectedId === shipment.id}
              onClick={() => onSelect(shipment.id)}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="font-medium text-gray-500">No shipments found</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
          </div>
        )}
      </div>

      {/* Footer stats */}
      <div className="p-3 bg-gray-50 border-t border-gray-100">
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>Showing {filteredShipments.length} of {stats.total}</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-pink-500"></span>
              {stats.sea} Sea
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-teal-500"></span>
              {stats.air} Air
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
