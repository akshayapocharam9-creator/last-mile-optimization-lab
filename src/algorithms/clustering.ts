import { Customer, Depot, Point } from '../types';
import { euclideanDistance } from './evaluator';

/**
 * Partitions customers across K vehicles using polar angle sweep around depot.
 * This is a classic logistics sweep heuristic that creates compact, geographically coherent zones.
 */
export function partitionCustomersForFleet(
  customers: Customer[],
  depot: Depot,
  fleetSize: number
): Customer[][] {
  if (fleetSize <= 1 || customers.length === 0) {
    return [customers];
  }

  // Sort customers by polar angle relative to depot: atan2(y - depot.y, x - depot.x)
  const sorted = [...customers].sort((a, b) => {
    const angleA = Math.atan2(a.y - depot.y, a.x - depot.x);
    const angleB = Math.atan2(b.y - depot.y, b.x - depot.x);
    if (Math.abs(angleA - angleB) > 1e-5) {
      return angleA - angleB;
    }
    return euclideanDistance(depot, a) - euclideanDistance(depot, b);
  });

  const partitions: Customer[][] = Array.from({ length: fleetSize }, () => []);
  const baseSize = Math.floor(sorted.length / fleetSize);
  const remainder = sorted.length % fleetSize;

  let currentIndex = 0;
  for (let v = 0; v < fleetSize; v++) {
    const size = baseSize + (v < remainder ? 1 : 0);
    partitions[v] = sorted.slice(currentIndex, currentIndex + size);
    currentIndex += size;
  }

  return partitions;
}
