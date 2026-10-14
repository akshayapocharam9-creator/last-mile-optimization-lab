import { Customer, Depot, Scenario } from '../types';

/**
 * Seeded pseudo-random number generator (Mulberry32) for reproducible scenarios.
 */
export function createRNG(seed: number) {
  let s = Math.floor(seed);
  return function () {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const DEFAULT_DEPOT: Depot = {
  id: 0,
  name: 'Central Logistics Depot',
  x: 50,
  y: 50,
};

/**
 * Preset scenario specifically configured to demonstrate the core pedagogical trade-off
 * from the DAA presentation (where NN is distance-greedy, EDF is deadline-greedy, and INS finds the balance).
 */
export const PRESET_5_CUSTOMER: Scenario = {
  id: 'preset-5-customer',
  name: 'DAA Presentation 5-Customer Benchmark',
  depot: { id: 0, name: 'Depot', x: 50, y: 50 },
  fleetSize: 1,
  tightness: 0.35,
  seed: 42,
  serviceDuration: 2.0,
  vehicleSpeed: 1.0,
  customers: [
    { id: 1, x: 55, y: 50, deadline: 48.0, readyTime: 0, demand: 1, name: 'Customer #1' },
    { id: 2, x: 60, y: 52, deadline: 41.0, readyTime: 0, demand: 1, name: 'Customer #2' },
    { id: 3, x: 63, y: 57, deadline: 33.0, readyTime: 0, demand: 1, name: 'Customer #3' },
    { id: 4, x: 52, y: 58, deadline: 34.0, readyTime: 0, demand: 1, name: 'Customer #4' },
    { id: 5, x: 44, y: 52, deadline: 7.5, readyTime: 0, demand: 1, name: 'Customer #5' },
  ],
};

/**
 * Generates a reproducible delivery scenario with given customer count, fleet size, seed, and tightness.
 */
export function generateScenario(
  customerCount: number,
  fleetSize: number = 1,
  tightness: number = 0.5,
  seed: number = 42,
  serviceDuration: number = 2.0
): Scenario {
  const rng = createRNG(seed);
  const depot = { ...DEFAULT_DEPOT };
  const customers: Customer[] = [];

  // Generate customer spatial positions
  for (let i = 1; i <= customerCount; i++) {
    // Spatial distribution: mix of radial dispersion and regional clustering around depot
    const angle = rng() * 2 * Math.PI;
    // Radius between 10 and 45 units from depot (center is 50, 50)
    const radius = 10 + rng() * 35;
    const x = Number(Math.max(5, Math.min(95, depot.x + Math.cos(angle) * radius)).toFixed(1));
    const y = Number(Math.max(5, Math.min(95, depot.y + Math.sin(angle) * radius)).toFixed(1));

    // Distance from depot
    const distToDepot = Math.sqrt((x - depot.x) ** 2 + (y - depot.y) ** 2);

    // Realistic deadline: direct travel time + service + slack scaled by tightness
    // Tighter tightness means less slack, looser means generous window.
    // Average multi-stop tour progression allowance:
    const avgTourMultiplier = 1.2 + (customerCount / Math.max(1, fleetSize)) * 0.8;
    const baseWindow = distToDepot + serviceDuration;
    const maxWindow = baseWindow + radius * avgTourMultiplier * (0.8 + tightness * 1.5);
    const slack = (maxWindow - baseWindow) * (0.2 + rng() * tightness);

    const deadline = Number((baseWindow + slack).toFixed(1));

    customers.push({
      id: i,
      x,
      y,
      deadline,
      readyTime: 0,
      demand: 1,
      name: `Customer #${i}`,
    });
  }

  return {
    id: `scenario-n${customerCount}-k${fleetSize}-t${tightness}-s${seed}`,
    name: `Scenario (N=${customerCount}, Vehicles=${fleetSize}, Tightness=${tightness})`,
    depot,
    customers,
    fleetSize,
    tightness,
    seed,
    serviceDuration,
    vehicleSpeed: 1.0,
  };
}
