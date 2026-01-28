export interface Position {
  lat: number;
  lng: number;
  timestamp?: string;
  location?: string;
}

export interface CurrentPosition extends Position {
  speed_knots?: number;
  heading?: number;
}

export interface AirportPosition extends Position {
  airport_code: string;
  airport_name: string;
  city: string;
  country: string;
}

export interface Vessel {
  name: string;
  imo_number: string;
  carrier_code: string;
}

export interface Container {
  reference: string;
  type: string;
  bill_of_lading: string;
}

export interface Flight {
  number: string;
  carrier: string;
  aircraft: string;
}

export interface Cargo {
  awb: string;
  pieces: number;
  weight_kg: number;
  description: string;
}

export interface ShipmentEvent {
  event_id: string;
  event_type: string;
  event_datetime: string;
  event_description: string;
  location: string;
  status: 'completed' | 'pending';
}

export interface SeaPositions {
  historical: Position[];
  current: CurrentPosition;
  predicted: Position[];
}

export interface AirPositions {
  origin: AirportPosition;
  destination: AirportPosition;
}

export interface ShipmentDates {
  etd: string;
  eta: string;
  actual_departure?: string;
  actual_arrival?: string;
}

export interface Route {
  origin: string;
  destination: string;
}

export interface BaseShipment {
  id: string;
  status: 'SCHEDULED' | 'IN_TRANSIT' | 'ARRIVED' | 'DELIVERED';
  shipper: string;
  customer: string;
  route: Route;
  dates: ShipmentDates;
  progress: number;
}

export interface SeaShipment extends BaseShipment {
  type: 'sea';
  vessel: Vessel;
  container: Container;
  positions: SeaPositions;
  events: ShipmentEvent[];
}

export interface AirShipment extends BaseShipment {
  type: 'air';
  flight: Flight;
  cargo: Cargo;
  positions: AirPositions;
}

export type Shipment = SeaShipment | AirShipment;

export interface ShipmentsData {
  shipments: Shipment[];
}
