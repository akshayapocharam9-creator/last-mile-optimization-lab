import { Customer, Depot, DeliveryStopResult, RouteResult, Point, Scenario } from '../types';

export const VEHICLE_COLORS = [
  '#3b82f6', // Electric Blue
  '#10b981', // Emerald Green
  '#f59e0b', // Amber Orange
  '#ec4899', // Bright Pink
  '#8b5cf6', // Violet Purple
  '#06b6d4', // Cyan
  '#f97316', // Bright Orange
  '#14b8a6', // Teal
];

/**
 * Calculates Euclidean distance between two points.
 */
export function euclideanDistance(p1: Point, p2: Point): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Standard shared evaluator for a single vehicle route.
 * Evaluates route order against the depot, customers, 2-minute service duration, and deadlines.
 */
export function evaluateSingleRoute(
  vehicleId: number,
  customerOrder: number[],
  customerMap: Map<number, Customer>,
  depot: Depot,
  serviceDuration: number = 2.0,
  vehicleSpeed: number = 1.0,
  vehicleColor?: string
): RouteResult {
  const color = vehicleColor || VEHICLE_COLORS[(vehicleId - 1) % VEHICLE_COLORS.length];
  const fullPath: Point[] = [depot];
  const stops: DeliveryStopResult[] = [];

  let currentTime = 0.0;
  let totalDistance = 0.0;
  let prevPoint: Point = depot;
  let onTimeCount = 0;
  let lateCount = 0;

  for (const custId of customerOrder) {
    const cust = customerMap.get(custId);
    if (!cust) continue;

    fullPath.push(cust);
    const legDistance = euclideanDistance(prevPoint, cust);
    totalDistance += legDistance;

    const travelTime = legDistance / vehicleSpeed;
    const arrivalTime = currentTime + travelTime;
    const isOnTime = arrivalTime <= cust.deadline + 1e-6;

    if (isOnTime) {
      onTimeCount++;
    } else {
      lateCount++;
    }

    const completionTime = arrivalTime + serviceDuration;
    const departureTime = completionTime;

    stops.push({
      customerId: cust.id,
      coordinates: { x: cust.x, y: cust.y },
      arrivalTime: Number(arrivalTime.toFixed(2)),
      serviceDuration,
      completionTime: Number(completionTime.toFixed(2)),
      departureTime: Number(departureTime.toFixed(2)),
      deadline: cust.deadline,
      isOnTime,
      lateness: Number(Math.max(0, arrivalTime - cust.deadline).toFixed(2)),
      vehicleId,
      distanceFromPrev: Number(legDistance.toFixed(2)),
      cumulativeDistance: Number(totalDistance.toFixed(2)),
    });

    currentTime = departureTime;
    prevPoint = cust;
  }

  // Return leg to depot
  if (customerOrder.length > 0) {
    const returnDistance = euclideanDistance(prevPoint, depot);
    totalDistance += returnDistance;
    currentTime += returnDistance / vehicleSpeed;
    fullPath.push(depot);
  }

  return {
    vehicleId,
    vehicleColor: color,
    customerOrder,
    fullPath,
    stops,
    totalDistance: Number(totalDistance.toFixed(2)),
    completionTime: Number(currentTime.toFixed(2)),
    onTimeCount,
    lateCount,
  };
}

/**
 * Common shared evaluator for all routes across an entire scenario.
 * Ensures identical mathematical rules for every algorithm.
 */
export function evaluateAllRoutes(
  routesCustomerOrders: number[][],
  scenario: Scenario
): {
  routes: RouteResult[];
  totalCustomers: number;
  onTimeCount: number;
  lateCount: number;
  onTimePercentage: number;
  totalDistance: number;
  totalCompletionTime: number;
  isFeasibleAllOnTime: boolean;
} {
  const customerMap = new Map<number, Customer>(scenario.customers.map((c) => [c.id, c]));
  const evaluatedRoutes: RouteResult[] = [];

  let aggregateOnTime = 0;
  let aggregateLate = 0;
  let aggregateDistance = 0;
  let maxCompletionTime = 0;

  routesCustomerOrders.forEach((order, index) => {
    const route = evaluateSingleRoute(
      index + 1,
      order,
      customerMap,
      scenario.depot,
      scenario.serviceDuration,
      scenario.vehicleSpeed
    );
    evaluatedRoutes.push(route);
    aggregateOnTime += route.onTimeCount;
    aggregateLate += route.lateCount;
    aggregateDistance += route.totalDistance;
    if (route.completionTime > maxCompletionTime) {
      maxCompletionTime = route.completionTime;
    }
  });

  const totalEvaluated = aggregateOnTime + aggregateLate;
  const onTimePercentage =
    totalEvaluated > 0 ? Number(((aggregateOnTime / totalEvaluated) * 100).toFixed(1)) : 0;

  return {
    routes: evaluatedRoutes,
    totalCustomers: scenario.customers.length,
    onTimeCount: aggregateOnTime,
    lateCount: aggregateLate,
    onTimePercentage,
    totalDistance: Number(aggregateDistance.toFixed(2)),
    totalCompletionTime: Number(maxCompletionTime.toFixed(2)),
    isFeasibleAllOnTime: aggregateLate === 0 && totalEvaluated === scenario.customers.length,
  };
}
