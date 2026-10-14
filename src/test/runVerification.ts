import { euclideanDistance, evaluateSingleRoute, evaluateAllRoutes } from '../algorithms/evaluator';
import { generateScenario, PRESET_5_CUSTOMER } from '../algorithms/generator';
import { runNearestNeighbour } from '../algorithms/nearestNeighbour';
import { runEarliestDeadlineFirst } from '../algorithms/earliestDeadlineFirst';
import { runInsertionHeuristic } from '../algorithms/insertionHeuristic';
import { runInsertionWithTwoOpt } from '../algorithms/twoOpt';
import { runHeldKarp, HELD_KARP_MAX_SAFE_N } from '../algorithms/heldKarp';
import { executeAllAlgorithms } from '../algorithms/runner';
import { Customer, Depot } from '../types';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, message: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${message}`);
  } else {
    failedTests++;
    console.error(`  ✗ FAIL: ${message}`);
  }
}

function runAllVerificationTests() {
  console.log('====================================================');
  console.log('DAA LAST-MILE OPTIMIZATION LAB — ALGORITHM VERIFICATION SUITE');
  console.log('====================================================\n');

  // 1. Mathematical Correctness & Distance Metric
  console.log('[SUITE 1] Mathematical Correctness & Evaluator Constraints');
  const p1 = { x: 0, y: 0 };
  const p2 = { x: 3, y: 4 };
  const dist = euclideanDistance(p1, p2);
  assert(Math.abs(dist - 5.0) < 1e-6, 'Euclidean distance formula: (0,0) to (3,4) must equal exactly 5.0');

  const depot: Depot = { id: 0, name: 'Depot', x: 50, y: 50 };
  const cust1: Customer = { id: 1, x: 50, y: 60, deadline: 15.0, readyTime: 0, demand: 1 }; // dist = 10
  const custMap = new Map<number, Customer>([[1, cust1]]);
  
  // Speed 1 unit/min, dist 10 -> arrival 10. Service 2 min -> departure 12. Return 10 -> total dist 20, completion 22
  const singleEval = evaluateSingleRoute(1, [1], custMap, depot, 2.0, 1.0);
  assert(singleEval.totalDistance === 20.0, 'Total distance includes leg to customer (10.0) + return to depot (10.0) = 20.0');
  assert(singleEval.stops[0].arrivalTime === 10.0, 'Arrival time at customer #1 is exactly 10.0 minutes');
  assert(singleEval.stops[0].serviceDuration === 2.0, 'Service dwell time is verified as exactly 2.0 minutes');
  assert(singleEval.stops[0].completionTime === 12.0, 'Completion/departure time is arrival (10.0) + service (2.0) = 12.0 minutes');
  assert(singleEval.stops[0].isOnTime === true, 'Arrival (10.0) <= Deadline (15.0) evaluates strictly as On-Time');
  assert(singleEval.completionTime === 22.0, 'Vehicle tour completion at depot is 12.0 + return transit (10.0) = 22.0 minutes');

  // Test deadline failure check
  const lateCust: Customer = { id: 2, x: 50, y: 80, deadline: 10.0, readyTime: 0, demand: 1 }; // dist = 30 -> arrival 30 > deadline 10
  const lateCustMap = new Map<number, Customer>([[2, lateCust]]);
  const lateEval = evaluateSingleRoute(1, [2], lateCustMap, depot, 2.0, 1.0);
  assert(lateEval.stops[0].isOnTime === false, 'Arrival (30.0) > Deadline (10.0) evaluates strictly as Late');
  assert(lateEval.stops[0].lateness === 20.0, 'Lateness is evaluated as arrival (30.0) - deadline (10.0) = +20.0 min');

  // 2. Preset 5-Customer Benchmark & Lexicographic Objective
  console.log('\n[SUITE 2] Preset 5-Customer Pedagogical Case');
  const presetResults = executeAllAlgorithms(PRESET_5_CUSTOMER);

  console.log(`  NN Result: ${presetResults['nn'].onTimeCount}/5 on time, distance ${presetResults['nn'].totalDistance}`);
  console.log(`  EDF Result: ${presetResults['edf'].onTimeCount}/5 on time, distance ${presetResults['edf'].totalDistance}`);
  console.log(`  INS Result: ${presetResults['ins'].onTimeCount}/5 on time, distance ${presetResults['ins'].totalDistance}`);
  console.log(`  INS+2opt Result: ${presetResults['ins-2opt'].onTimeCount}/5 on time, distance ${presetResults['ins-2opt'].totalDistance}`);
  console.log(`  Held-Karp Result: ${presetResults['held-karp'].onTimeCount}/5 on time, distance ${presetResults['held-karp'].totalDistance}`);

  assert(presetResults['ins'].onTimeCount === 5, 'Insertion Heuristic satisfies 100% (5/5) customer deadlines');
  assert(presetResults['ins-2opt'].onTimeCount === 5, 'INS + 2-opt preserves 100% (5/5) feasibility');
  assert(presetResults['held-karp'].onTimeCount === 5, 'Held-Karp exact DP satisfies 100% (5/5) customer deadlines');
  assert(presetResults['ins-2opt'].totalDistance <= presetResults['edf'].totalDistance, 'INS + 2-opt avoids EDF excessive zigzagging detour');

  // 3. Multi-Vehicle Fleet Partitioning & Tour Invariants
  console.log('\n[SUITE 3] Multi-Vehicle Scheduling & Partitioning');
  const multiScen20 = generateScenario(20, 3, 0.35, 123);
  const multiRes20 = runInsertionWithTwoOpt(multiScen20);

  assert(multiRes20.routes.length === 3, 'Fleet size of 3 generates exactly 3 distinct vehicle routes');
  
  // Verify all customers visited exactly once
  const visitedCustomerIds = new Set<number>();
  let duplicateFound = false;
  multiRes20.routes.forEach(r => {
    r.customerOrder.forEach(id => {
      if (visitedCustomerIds.has(id)) duplicateFound = true;
      visitedCustomerIds.add(id);
    });
  });
  assert(!duplicateFound && visitedCustomerIds.size === 20, 'All 20 customers are partitioned and visited exactly once with no duplicates');
  
  // Verify every route starts and returns to depot
  const allRoutesStartEndAtDepot = multiRes20.routes.every(r => {
    return r.fullPath[0].x === multiScen20.depot.x &&
           r.fullPath[0].y === multiScen20.depot.y &&
           r.fullPath[r.fullPath.length - 1].x === multiScen20.depot.x &&
           r.fullPath[r.fullPath.length - 1].y === multiScen20.depot.y;
  });
  assert(allRoutesStartEndAtDepot, 'All vehicle routes start and terminate at the Central Logistics Depot');

  // 4. Fixed-Seed Reproducibility
  console.log('\n[SUITE 4] Reproducibility with Fixed Random Seeds');
  const scenA = generateScenario(50, 2, 0.4, 9999);
  const scenB = generateScenario(50, 2, 0.4, 9999);
  const identicalCoords = scenA.customers.every((c, i) => c.x === scenB.customers[i].x && c.y === scenB.customers[i].y && c.deadline === scenB.customers[i].deadline);
  assert(identicalCoords, 'Fixed seed 9999 produces 100% deterministic, identical customer coordinates and deadlines');

  // 5. Held-Karp Computational Safety Limit Protection
  console.log('\n[SUITE 5] Held-Karp Asymptotic Guard & Safety Limit');
  const largeScen = generateScenario(20, 1, 0.5, 42); // N = 20 > 14
  const heldKarpLarge = runHeldKarp(largeScen);
  assert(heldKarpLarge.warning !== undefined && heldKarpLarge.warning.includes('safe exact limit'), 'Held-Karp safely blocks exponential search when N = 20 > 14 and emits protective warning');
  assert(heldKarpLarge.executionTimeMs < 100, 'Held-Karp protection prevents browser UI freezing (returns instantly with safe benchmark)');

  // 6. Feasibility-Preserving 2-Opt Invariant
  console.log('\n[SUITE 6] Feasibility Preservation Invariant in 2-Opt');
  const scen100 = generateScenario(50, 2, 0.35, 555);
  const insRes = runInsertionHeuristic(scen100);
  const twoOptRes = runInsertionWithTwoOpt(scen100);
  assert(twoOptRes.onTimeCount >= insRes.onTimeCount, '2-Opt never degrades on-time delivery count (onTime(2opt) >= onTime(INS))');
  assert(twoOptRes.totalDistance <= insRes.totalDistance + 1e-4, '2-Opt total route distance is strictly less than or equal to initial insertion distance');

  console.log('\n====================================================');
  console.log(`VERIFICATION SUMMARY: ${passedTests} / ${totalTests} TESTS PASSED`);
  if (failedTests === 0) {
    console.log('STATUS: ALL MATHEMATICAL AND ALGORITHMIC CHECKS VERIFIED SUCCESSFULLY!');
  } else {
    console.error(`STATUS: ${failedTests} FAILURES DETECTED!`);
    process.exit(1);
  }
  console.log('====================================================\n');
}

runAllVerificationTests();
