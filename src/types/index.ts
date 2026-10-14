export interface Point {
  x: number;
  y: number;
}

export interface Customer extends Point {
  id: number;
  deadline: number; // in minutes from start (t=0)
  readyTime: number; // default 0
  demand: number; // default 1
  name?: string;
}

export interface Depot extends Point {
  id: 0;
  name: string;
}

export interface Scenario {
  id: string;
  name: string;
  depot: Depot;
  customers: Customer[];
  fleetSize: number;
  tightness: number; // e.g. 0.25 to 1.0 (lower means tighter deadlines)
  seed: number;
  serviceDuration: number; // 2 minutes per customer
  vehicleSpeed: number; // 1 unit per minute (for schematic coordinate map)
}

export interface DeliveryStopResult {
  customerId: number;
  coordinates: Point;
  arrivalTime: number;
  serviceDuration: number;
  completionTime: number;
  departureTime: number;
  deadline: number;
  isOnTime: boolean;
  lateness: number; // arrivalTime - deadline (0 if on time)
  vehicleId: number;
  distanceFromPrev: number;
  cumulativeDistance: number;
}

export interface RouteResult {
  vehicleId: number;
  vehicleColor: string;
  customerOrder: number[]; // customer IDs in order of visit
  fullPath: Point[]; // [depot, ...customers, depot]
  stops: DeliveryStopResult[];
  totalDistance: number;
  completionTime: number; // when vehicle returns to depot
  onTimeCount: number;
  lateCount: number;
}

export interface AlgorithmDecisionStep {
  step: number;
  action: string;
  customerId?: number;
  vehicleId?: number;
  description: string;
  metricValue?: number;
  routeSnapshot?: number[][];
}

export interface AlgorithmResult {
  algorithmId: 'nn' | 'edf' | 'ins' | 'ins-2opt' | 'held-karp';
  algorithmName: string;
  shortName: string;
  routes: RouteResult[];
  totalCustomers: number;
  onTimeCount: number;
  lateCount: number;
  onTimePercentage: number;
  totalDistance: number;
  totalCompletionTime: number; // max completion time across all vehicles
  executionTimeMs: number;
  isFeasibleAllOnTime: boolean;
  decisionSteps?: AlgorithmDecisionStep[];
  warning?: string;
  theoreticalComplexity: string;
}

export type ActiveSection =
  | 'simulation'
  | 'comparison'
  | 'analytics'
  | 'scalability'
  | 'explorer'
  | 'results'
  | 'presentation'
  | 'about';
