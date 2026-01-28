'use client';

import { Shipment, SeaShipment, AirShipment } from '@/types/shipment';

interface ShipmentCardProps {
  shipment: Shipment;
  isSelected: boolean;
  onClick: () => void;
}

export default function ShipmentCard({ shipment, isSelected, onClick }: ShipmentCardProps) {
  const isSea = shipment.type === 'sea';

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'IN_TRANSIT':
        return { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500', label: 'In Transit' };
      case 'DELIVERED':
        return { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Delivered' };
      case 'ARRIVED':
        return { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Arrived' };
      case 'SCHEDULED':
        return { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500', label: 'Scheduled' };
      default:
        return { bg: 'bg-gray-50', text: 'text-gray-700', dot: 'bg-gray-500', label: status };
    }
  };

  const statusConfig = getStatusConfig(shipment.status);
  const seaShipment = isSea ? (shipment as SeaShipment) : null;
  const airShipment = !isSea ? (shipment as AirShipment) : null;

  return (
    <div
      onClick={onClick}
      className={`group relative p-4 rounded-xl cursor-pointer transition-all duration-300 border-2 overflow-hidden ${
        isSelected
          ? 'border-indigo-500 bg-gradient-to-br from-indigo-50 to-white shadow-lg shadow-indigo-100'
          : 'border-transparent bg-white hover:border-indigo-200 hover:shadow-md hover:-translate-y-0.5'
      }`}
    >
      {/* Decorative gradient strip */}
      <div
        className={`absolute top-0 left-0 w-full h-1 ${
          isSea
            ? 'bg-gradient-to-r from-pink-500 to-rose-400'
            : 'bg-gradient-to-r from-teal-500 to-cyan-400'
        }`}
      />

      <div className="flex items-start gap-3">
        {/* Icon with gradient background */}
        <div
          className={`relative w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg transition-transform duration-300 group-hover:scale-105 ${
            isSea
              ? 'bg-gradient-to-br from-pink-500 to-rose-600 shadow-pink-200'
              : 'bg-gradient-to-br from-teal-500 to-cyan-600 shadow-teal-200'
          }`}
        >
          {isSea ? (
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 21c-1.39 0-2.78-.47-4-1.32-2.44 1.71-5.56 1.71-8 0C6.78 20.53 5.39 21 4 21H2v2h2c1.38 0 2.74-.35 4-.99 2.52 1.29 5.48 1.29 8 0 1.26.64 2.62.99 4 .99h2v-2h-2zm-3.5-5l-1.5-3h-6l-1.5 3H6c-.83 0-1.5-.67-1.5-1.5S5.17 13 6 13h1l2.25-4.5C9.5 8.2 9.82 8 10.15 8h3.7c.33 0 .65.2.9.5L17 13h1c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-1.5z"/>
            </svg>
          ) : (
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
            </svg>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header row */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <h3 className="font-bold text-gray-900 text-sm tracking-tight">{shipment.id}</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                {isSea ? seaShipment?.vessel.name : airShipment?.flight.number}
              </p>
            </div>
            {/* Status badge */}
            <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot} animate-pulse`} />
              {statusConfig.label}
            </span>
          </div>

          {/* Route info */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-medium text-gray-800">{shipment.route.origin}</span>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
              <span className="font-medium text-gray-800">{shipment.route.destination}</span>
            </div>
          </div>

          {/* Meta info */}
          <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              {shipment.shipper}
            </span>
            <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${isSea ? 'bg-pink-100 text-pink-700' : 'bg-teal-100 text-teal-700'}`}>
              {isSea ? 'SEA' : 'AIR'}
            </span>
          </div>

          {/* Progress bar */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="text-gray-500">Journey Progress</span>
              <span className="font-semibold text-gray-700">{shipment.progress}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ease-out ${
                  shipment.progress === 100
                    ? 'bg-gradient-to-r from-emerald-500 to-green-400'
                    : isSea
                      ? 'bg-gradient-to-r from-pink-500 to-rose-400'
                      : 'bg-gradient-to-r from-teal-500 to-cyan-400'
                }`}
                style={{ width: `${shipment.progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute top-3 right-3">
          <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}
