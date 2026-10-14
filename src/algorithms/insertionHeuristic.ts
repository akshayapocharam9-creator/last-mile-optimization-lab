import { AlgorithmDecisionStep, AlgorithmResult, Customer, Scenario } from '../types';
import { evaluateAllRoutes, evaluateSingleRoute } from './evaluator';

/**
 * Insertion Heuristic (INS)
 * Considers customers in deadline order and inserts each customer at the best position
 * that preserves or maximizes on-time deliveries while minimizing incremental detour distance.
 * Complexity: O(N^3)
 */
export function runInsertionHeuristic(scenario: Scenario): AlgorithmResult {
  const startTime = performance.now();
  const decisionSteps: AlgorithmDecisionStep[] = [];
  const customerMap = new Map<number, Customer>(scenario.customers.map((c) => [c.id, c]));

  // 1. Sort customers by deadline ascending
  const sortedCustomers = [...scenario.customers].sort((a, b) => a.deadline - b.deadline);

  // Initialize empty customer routes for each vehicle
  const vehicleRoutes: number[][] = Array.from({ length: scenario.fleetSize }, () => []);

  let stepCounter = 1;

  for (const customer of sortedCustomers) {
    let bestVehicleIdx = 0;
    let bestInsertPos = 0;
    let bestOnTimeCount = -1;
    let minDeltaDist = Infinity;
    let foundFeasible = false;

    // Try inserting into each vehicle route at each valid position
    for (let v = 0; v < scenario.fleetSize; v++) {
      const currentRoute = vehicleRoutes[v];
      const currentEval = evaluateSingleRoute(
        v + 1,
        currentRoute,
        customerMap,
        scenario.depot,
        scenario.serviceDuration,
        scenario.vehicleSpeed
      );

      for (let pos = 0; pos <= currentRoute.length; pos++) {
        const testRoute = [...currentRoute.slice(0, pos), customer.id, ...currentRoute.slice(pos)];
        const testEval = evaluateSingleRoute(
          v + 1,
          testRoute,
          customerMap,
          scenario.depot,
          scenario.serviceDuration,
          scenario.vehicleSpeed
        );

        const deltaDist = testEval.totalDistance - currentEval.totalDistance;
        const isAllOnTime = testEval.lateCount === 0;

        // Lexicographic criteria:
        // 1. Prefer solutions with higher on-time deliveries
        // 2. If equal, prefer lower incremental distance
        if (isAllOnTime) {
          if (!foundFeasible || deltaDist < minDeltaDist) {
            foundFeasible = true;
            bestOnTimeCount = testEval.onTimeCount;
            minDeltaDist = deltaDist;
            bestVehicleIdx = v;
            bestInsertPos = pos;
          }
        } else if (!foundFeasible) {
          if (testEval.onTimeCount > bestOnTimeCount || (testEval.onTimeCount === bestOnTimeCount && deltaDist < minDeltaDist)) {
            bestOnTimeCount = testEval.onTimeCount;
            minDeltaDist = deltaDist;
            bestVehicleIdx = v;
            bestInsertPos = pos;
          }
        }
      }
    }

    // Insert customer at best determined position
    vehicleRoutes[bestVehicleIdx].splice(bestInsertPos, 0, customer.id);

    decisionSteps.push({
      step: stepCounter++,
      action: 'FEASIBLE_INSERTION',
      customerId: customer.id,
      vehicleId: bestVehicleIdx + 1,
      description: `Inserted Customer #${customer.id} into Vehicle ${bestVehicleIdx + 1} at pos ${bestInsertPos} (Δdist: +${minDeltaDist === Infinity ? 0 : minDeltaDist.toFixed(1)}, deadline: ${customer.deadline.toFixed(1)})`,
      metricValue: Number((minDeltaDist === Infinity ? 0 : minDeltaDist).toFixed(2)),
    });
  }

  const evalSummary = evaluateAllRoutes(vehicleRoutes, scenario);
  const endTime = performance.now();

  return {
    algorithmId: 'ins',
    algorithmName: 'Insertion Heuristic',
    shortName: 'INS',
    ...evalSummary,
    executionTimeMs: Number((endTime - startTime).toFixed(3)),
    decisionSteps,
    theoreticalComplexity: 'O(N³)',
  };
}
