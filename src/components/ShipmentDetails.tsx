'use client';

import { ReactNode } from 'react';
import { Shipment, SeaShipment, AirShipment } from '@/types/shipment';

interface ShipmentDetailsProps {
  shipment: Shipment;
  onClose: () => void;
}

export default function ShipmentDetails({ shipment, onClose }: ShipmentDetailsProps) {
  const isSea = shipment.type === 'sea';
  const seaShipment = isSea ? (shipment as SeaShipment) : null;
  const airShipment = !isSea ? (shipment as AirShipment) : null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'IN_TRANSIT':
        return { bg: 'bg-blue-500/20', text: 'text-blue-100', border: 'border-blue-400/30' };
      case 'SCHEDULED':
        return { bg: 'bg-amber-500/20', text: 'text-amber-100', border: 'border-amber-400/30' };
      case 'ARRIVED':
      case 'DELIVERED':
        return { bg: 'bg-emerald-500/20', text: 'text-emerald-100', border: 'border-emerald-400/30' };
      default:
        return { bg: 'bg-white/20', text: 'text-white', border: 'border-white/30' };
    }
  };

  const statusConfig = getStatusConfig(shipment.status);

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
      {/* Header with gradient */}
      <div className={`relative overflow-hidden ${isSea ? 'bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500' : 'bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500'}`}>
        {/* Decorative circles */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full" />

        <div className="relative p-5">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-xl transition-all duration-200 group"
          >
            <svg className="w-5 h-5 text-white/80 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Type badge */}
          <div className="flex items-center gap-2 mb-3">
            <div className={`px-2.5 py-1 rounded-lg ${isSea ? 'bg-pink-500/30' : 'bg-cyan-500/30'} backdrop-blur-sm`}>
              <span className="text-xs font-semibold text-white/90">
                {isSea ? 'Sea Freight' : 'Air Freight'}
              </span>
            </div>
            <div className={`px-2.5 py-1 rounded-lg border ${statusConfig.bg} ${statusConfig.border} backdrop-blur-sm`}>
              <span className={`text-xs font-semibold ${statusConfig.text}`}>
                {shipment.status.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Main title */}
          <h2 className="text-2xl font-bold text-white mb-1">
            {isSea ? seaShipment?.vessel.name : airShipment?.flight.carrier}
          </h2>

          {/* Route display */}
          <div className="flex items-center gap-2 text-white/90 mb-4">
            <span className="font-medium">
              {isSea ? shipment.route.origin : airShipment?.positions.origin.airport_code}
            </span>
            <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
            <span className="font-medium">
              {isSea ? shipment.route.destination : airShipment?.positions.destination.airport_code}
            </span>
          </div>

          {/* ETA Card */}
          <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-white/70 mb-0.5">Estimated Arrival</p>
                <p className="text-lg font-bold text-white">{formatDate(shipment.dates.eta)}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="p-4 bg-gradient-to-b from-gray-50 to-white border-b border-gray-100">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-semibold text-gray-700">Journey Progress</span>
          <span className={`text-lg font-bold ${shipment.progress === 100 ? 'text-emerald-600' : isSea ? 'text-indigo-600' : 'text-teal-600'}`}>
            {shipment.progress}%
          </span>
        </div>
        <div className="relative">
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${
                shipment.progress === 100
                  ? 'bg-gradient-to-r from-emerald-500 to-green-400'
                  : isSea
                    ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500'
                    : 'bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500'
              }`}
              style={{ width: `${shipment.progress}%` }}
            />
          </div>
          {/* Progress markers */}
          <div className="absolute top-0 left-0 w-full h-3 flex justify-between px-1">
            {[0, 25, 50, 75, 100].map((mark) => (
              <div
                key={mark}
                className={`w-0.5 h-3 ${shipment.progress >= mark ? 'bg-white/50' : 'bg-gray-300'}`}
              />
            ))}
          </div>
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>Departed</span>
          <span>Arrived</span>
        </div>
      </div>

      {/* Scrollable Details */}
      <div className="max-h-[350px] overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 gap-2">
            <InfoCard
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                </svg>
              }
              label="Shipment ID"
              value={shipment.id}
              color="indigo"
            />
            <InfoCard
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              }
              label="Customer"
              value={shipment.customer}
              color="purple"
            />
          </div>

          {/* Date Cards */}
          <div className="flex gap-2">
            <div className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-100">
              <p className="text-xs text-blue-600 font-medium mb-1">ETD</p>
              <p className="text-sm font-bold text-blue-900">{formatDate(shipment.dates.etd)}</p>
            </div>
            <div className="flex-1 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-3 border border-emerald-100">
              <p className="text-xs text-emerald-600 font-medium mb-1">ETA</p>
              <p className="text-sm font-bold text-emerald-900">{formatDate(shipment.dates.eta)}</p>
            </div>
          </div>

          {/* Sea-specific details */}
          {isSea && seaShipment && (
            <>
              {/* Vessel Section */}
              <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-4 border border-pink-100">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-pink-500 flex items-center justify-center shadow-lg shadow-pink-200">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20 21c-1.39 0-2.78-.47-4-1.32-2.44 1.71-5.56 1.71-8 0C6.78 20.53 5.39 21 4 21H2v2h2c1.38 0 2.74-.35 4-.99 2.52 1.29 5.48 1.29 8 0 1.26.64 2.62.99 4 .99h2v-2h-2z"/>
                    </svg>
                  </div>
                  <h3 className="text-sm font-bold text-pink-900">Vessel Details</h3>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white/60 rounded-lg p-2">
                    <p className="text-pink-600">Vessel</p>
                    <p className="font-semibold text-gray-900">{seaShipment.vessel.name}</p>
                  </div>
                  <div className="bg-white/60 rounded-lg p-2">
                    <p className="text-pink-600">IMO</p>
                    <p className="font-semibold text-gray-900">{seaShipment.vessel.imo_number}</p>
                  </div>
                  <div className="bg-white/60 rounded-lg p-2">
                    <p className="text-pink-600">Container</p>
                    <p className="font-semibold text-gray-900 truncate">{seaShipment.container.reference}</p>
                  </div>
                  <div className="bg-white/60 rounded-lg p-2">
                    <p className="text-pink-600">Type</p>
                    <p className="font-semibold text-gray-900">{seaShipment.container.type}</p>
                  </div>
                </div>
              </div>

              {/* Current Position */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-100">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-200">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                  </div>
                  <h3 className="text-sm font-bold text-blue-900">Current Position</h3>
                </div>
                <p className="font-semibold text-gray-900 mb-2">{seaShipment.positions.current.location}</p>
                <div className="flex gap-4 text-xs">
                  <div className="flex items-center gap-1 text-blue-700">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    {seaShipment.positions.current.speed_knots} knots
                  </div>
                  <div className="flex items-center gap-1 text-blue-700">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                    {seaShipment.positions.current.heading}° heading
                  </div>
                </div>
              </div>

              {/* Events Timeline */}
              {seaShipment.events && seaShipment.events.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Shipment Events
                  </h3>
                  <div className="space-y-0">
                    {seaShipment.events.map((event, index) => (
                      <div key={event.event_id} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-3 h-3 rounded-full border-2 ${
                              event.status === 'completed'
                                ? 'bg-emerald-500 border-emerald-500'
                                : 'bg-white border-gray-300'
                            }`}
                          />
                          {index < seaShipment.events.length - 1 && (
                            <div className={`w-0.5 flex-1 min-h-[40px] ${
                              event.status === 'completed' ? 'bg-emerald-200' : 'bg-gray-200'
                            }`} />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <p className="text-sm font-medium text-gray-900">
                            {event.event_description}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                            {event.location}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {formatDateTime(event.event_datetime)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Air-specific details */}
          {!isSea && airShipment && (
            <>
              {/* Flight Section */}
              <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-4 border border-teal-100">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center shadow-lg shadow-teal-200">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                    </svg>
                  </div>
                  <h3 className="text-sm font-bold text-teal-900">Flight Details</h3>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white/60 rounded-lg p-2">
                    <p className="text-teal-600">Flight</p>
                    <p className="font-semibold text-gray-900">{airShipment.flight.number}</p>
                  </div>
                  <div className="bg-white/60 rounded-lg p-2">
                    <p className="text-teal-600">Carrier</p>
                    <p className="font-semibold text-gray-900">{airShipment.flight.carrier}</p>
                  </div>
                  <div className="col-span-2 bg-white/60 rounded-lg p-2">
                    <p className="text-teal-600">Aircraft</p>
                    <p className="font-semibold text-gray-900">{airShipment.flight.aircraft}</p>
                  </div>
                </div>
              </div>

              {/* Route Visual */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-sm font-bold text-gray-900 mb-4">Flight Route</h3>
                <div className="flex items-center">
                  <div className="flex-1 text-center">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-teal-200 mb-2">
                      <span className="text-white font-bold text-lg">{airShipment.positions.origin.airport_code}</span>
                    </div>
                    <p className="text-xs font-medium text-gray-900">{airShipment.positions.origin.city}</p>
                    <p className="text-xs text-gray-500">{airShipment.positions.origin.country}</p>
                  </div>

                  <div className="flex-1 flex flex-col items-center px-2">
                    <div className="w-full h-0.5 bg-gradient-to-r from-teal-500 to-cyan-500 relative">
                      <svg className="w-5 h-5 text-teal-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-50" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                      </svg>
                    </div>
                  </div>

                  <div className="flex-1 text-center">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-200 mb-2">
                      <span className="text-white font-bold text-lg">{airShipment.positions.destination.airport_code}</span>
                    </div>
                    <p className="text-xs font-medium text-gray-900">{airShipment.positions.destination.city}</p>
                    <p className="text-xs text-gray-500">{airShipment.positions.destination.country}</p>
                  </div>
                </div>
              </div>

              {/* Cargo */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-200">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-bold text-amber-900">Cargo Information</h3>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                  <div className="bg-white/60 rounded-lg p-2 text-center">
                    <p className="text-amber-600">AWB</p>
                    <p className="font-semibold text-gray-900 text-xs">{airShipment.cargo.awb}</p>
                  </div>
                  <div className="bg-white/60 rounded-lg p-2 text-center">
                    <p className="text-amber-600">Pieces</p>
                    <p className="font-semibold text-gray-900">{airShipment.cargo.pieces}</p>
                  </div>
                  <div className="bg-white/60 rounded-lg p-2 text-center">
                    <p className="text-amber-600">Weight</p>
                    <p className="font-semibold text-gray-900">{airShipment.cargo.weight_kg}kg</p>
                  </div>
                </div>
                <div className="bg-white/60 rounded-lg p-2">
                  <p className="text-xs text-amber-600 mb-1">Description</p>
                  <p className="text-xs font-medium text-gray-900">{airShipment.cargo.description}</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoCard({
  icon,
  label,
  value,
  color
}: {
  icon: ReactNode;
  label: string;
  value: string;
  color: 'indigo' | 'purple' | 'teal' | 'pink';
}) {
  const colorClasses = {
    indigo: 'bg-indigo-50 border-indigo-100 text-indigo-600',
    purple: 'bg-purple-50 border-purple-100 text-purple-600',
    teal: 'bg-teal-50 border-teal-100 text-teal-600',
    pink: 'bg-pink-50 border-pink-100 text-pink-600',
  };

  return (
    <div className={`rounded-xl p-3 border ${colorClasses[color]}`}>
      <div className="flex items-center gap-1.5 mb-1">
        {icon}
        <p className="text-xs">{label}</p>
      </div>
      <p className="text-sm font-bold text-gray-900 truncate">{value}</p>
    </div>
  );
}
