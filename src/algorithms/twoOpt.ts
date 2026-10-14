import { AlgorithmDecisionStep, AlgorithmResult, Customer, Scenario } from '../types';
import { evaluateAllRoutes, evaluateSingleRoute } from './evaluator';
import { runInsertionHeuristic } from './insertionHeuristic';

/**
 * Insertion + 2-Opt Heuristic
 * Takes the route constructed by the Insertion Heuristic and performs iterative 2-opt
 * subsegment reversals, strictly accepting moves that improve distance without violating
 * deadline feasibility (or moves that improve on-time count).
 * Complexity: O(N³)
 */
export function runInsertionWithTwoOpt(scenario: Scenario): AlgorithmResult {
  const startTime = performance.now();
  const baseInsertion = runInsertionHeuristic(scenario);
  const decisionSteps: AlgorithmDecisionStep[] = [...(baseInsertion.decisionSteps || [])];
  const customerMap = new Map<number, Customer>(scenario.customers.map((c) => [c.id, c]));

  let stepCounter = decisionSteps.length + 1;
  const optimizedRoutes: number[][] = [];
  let totalReversalsAccepted = 0;

  for (const baseRoute of baseInsertion.routes) {
    let currentOrder = [...baseRoute.customerOrder];
    let improved = true;
    let iteration = 0;
    const maxIterations = 50; // Safeguard against infinite cycles

    while (improved && iteration < maxIterations) {
      improved = false;
      iteration++;

      let currentEval = evaluateSingleRoute(
        baseRoute.vehicleId,
        currentOrder,
        customerMap,
        scenario.depot,
        scenario.serviceDuration,
        scenario.vehicleSpeed
      );

      for (let i = 0; i < currentOrder.length - 1; i++) {
        for (let j = i + 1; j < currentOrder.length; j++) {
          // Perform 2-opt subsegment reversal between index i and j
          const candidateOrder = [
            ...currentOrder.slice(0, i),
            ...currentOrder.slice(i, j + 1).reverse(),
            ...currentOrder.slice(j + 1),
          ];

          const candidateEval = evaluateSingleRoute(
            baseRoute.vehicleId,
            candidateOrder,
            customerMap,
            scenario.depot,
            scenario.serviceDuration,
            scenario.vehicleSpeed
          );

          // Feasibility preservation rule:
          // Accept if on-time deliveries improve, OR if on-time deliveries stay the same and distance strictly decreases.
          const improvesOnTime = candidateEval.onTimeCount > currentEval.onTimeCount;
          const maintainsOnTimeAndReducesDist =
            candidateEval.onTimeCount === currentEval.onTimeCount &&
            candidateEval.totalDistance < currentEval.totalDistance - 0.05;

          if (improvesOnTime || maintainsOnTimeAndReducesDist) {
            const distReduction = currentEval.totalDistance - candidateEval.totalDistance;
            currentOrder = candidateOrder;
            currentEval = candidateEval;
            improved = true;
            totalReversalsAccepted++;

            decisionSteps.push({
              step: stepCounter++,
              action: '2OPT_SUBSEGMENT_REVERSAL',
              vehicleId: baseRoute.vehicleId,
              description: `Vehicle ${baseRoute.vehicleId}: 2-opt reversed segment [${i}..${j}], saved ${distReduction.toFixed(1)} dist (On-time: ${candidateEval.onTimeCount}/${candidateOrder.length})`,
              metricValue: Number(distReduction.toFixed(2)),
            });
            break; // restart search with updated route
          }
        }
        if (improved) break;
      }
    }

    optimizedRoutes.push(currentOrder);
  }

  const evalSummary = evaluateAllRoutes(optimizedRoutes, scenario);
  const endTime = performance.now();

  return {
    algorithmId: 'ins-2opt',
    algorithmName: 'Insertion + 2-Opt',
    shortName: 'INS + 2-opt',
    ...evalSummary,
    executionTimeMs: Number((endTime - startTime).toFixed(3)),
    decisionSteps,
    theoreticalComplexity: 'O(N³)',
    warning:
      totalReversalsAccepted > 0
        ? `2-opt performed ${totalReversalsAccepted} feasibility-preserving segment reversal(s).`
        : '2-opt found no segment reversals that improved distance without compromising deadlines.',
  };
}
