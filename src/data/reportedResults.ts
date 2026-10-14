export interface ReportedBenchmark5Customer {
  algorithm: string;
  onTimeFraction: string;
  onTimePercent: number;
  totalDistance: number;
  notes: string;
}

export interface ReportedScalabilityRow {
  customers: number;
  nn: number;
  edf: number;
  ins: number;
  ins2opt: number;
}

export interface ReportedKeyFinding {
  title: string;
  highlight: string;
  comparison: string;
  category: 'tightness' | 'fleet' | 'runtime' | 'distance';
  description: string;
}

export const REPORTED_5_CUSTOMER_RESULTS: ReportedBenchmark5Customer[] = [
  {
    algorithm: 'Nearest Neighbour (NN)',
    onTimeFraction: '4 / 5',
    onTimePercent: 80.0,
    totalDistance: 34.0,
    notes: 'Shortest path greedy distance (34.0), but misses 1 customer deadline due to lack of temporal awareness.',
  },
  {
    algorithm: 'Earliest Deadline First (EDF)',
    onTimeFraction: '4 / 5',
    onTimePercent: 80.0,
    totalDistance: 47.7,
    notes: 'Prioritizes urgency but incurs excessive zigzagging detour (+40.3% distance vs NN, 47.7 units) and still misses 1 delivery.',
  },
  {
    algorithm: 'Insertion Heuristic (INS)',
    onTimeFraction: '5 / 5',
    onTimePercent: 100.0,
    totalDistance: 38.8,
    notes: 'Achieves 100% on-time delivery (5/5) with a balanced route distance of 38.8.',
  },
  {
    algorithm: 'Insertion + 2-Opt (INS + 2-opt)',
    onTimeFraction: '5 / 5',
    onTimePercent: 100.0,
    totalDistance: 38.8,
    notes: 'Maintains 100% feasibility (5/5 on time) and confirms the 38.8 distance is locally 2-opt optimal.',
  },
  {
    algorithm: 'Held-Karp Exact DP',
    onTimeFraction: '5 / 5',
    onTimePercent: 100.0,
    totalDistance: 38.8,
    notes: 'Global mathematical optimum: optimal distance 38.8, meeting all five deadlines.',
  },
];

export const REPORTED_SCALABILITY_RESULTS: ReportedScalabilityRow[] = [
  { customers: 20, nn: 67.7, edf: 12.3, ins: 79.7, ins2opt: 80.0 },
  { customers: 50, nn: 75.3, edf: 38.3, ins: 92.9, ins2opt: 92.9 },
  { customers: 100, nn: 81.1, edf: 84.7, ins: 97.5, ins2opt: 97.5 },
  { customers: 200, nn: 84.4, edf: 97.0, ins: 100.0, ins2opt: 100.0 },
];

export const REPORTED_KEY_FINDINGS: ReportedKeyFinding[] = [
  {
    title: 'Extreme Deadline Tightness Resilience',
    highlight: '87.0% vs 23.7%',
    comparison: 'INS + 2-opt vs EDF at Tightness 0.35',
    category: 'tightness',
    description:
      'Under tight deadline constraints (tightness = 0.35), pure deadline priority (EDF) collapses to 23.7% due to massive travel detours. In contrast, INS + 2-opt preserves spatial efficiency and attains 87.0% on-time delivery.',
  },
  {
    title: 'Fleet Size Scaling Saturation',
    highlight: '63.1% → 100%',
    comparison: 'Fleet Size 4 to Fleet Size 15',
    category: 'fleet',
    description:
      'On-time delivery performance steadily rises from 63.1% with a 4-vehicle fleet to full 100.0% coverage when fleet size expands to 15 vehicles in the reported experimental scenario.',
  },
  {
    title: 'Empirical Runtime Exponents',
    highlight: 'O(N^1.9) to O(N^2.3)',
    comparison: 'Polynomial Scaling Verification',
    category: 'runtime',
    description:
      'Empirical measurements of heuristic runtimes yielded scaling exponents of approximately 1.9 to 2.3, verifying that heuristic approaches scale tractably with customer volume unlike exponential exact search.',
  },
  {
    title: 'Held-Karp Intractability Horizon',
    highlight: '183.8 ms at N = 14',
    comparison: 'Exponential Transition Point',
    category: 'runtime',
    description:
      'Held-Karp executed in 183.8 ms at N = 14. Beyond N = 14, the O(N² · 2ᴺ) state space doubles with every single customer added, illustrating the hard boundary between exact dynamic programming and polynomial heuristics.',
  },
  {
    title: 'Route Distance Reductions at N = 200',
    highlight: '-22% vs NN, -40% vs EDF',
    comparison: 'Route Distance at Scale (N = 200)',
    category: 'distance',
    description:
      'At 200 customers, INS + 2-opt produced routes approximately 22% shorter than Nearest Neighbour and 40% shorter than EDF, simultaneously maximizing both delivery promptness and fleet fuel savings.',
  },
];
