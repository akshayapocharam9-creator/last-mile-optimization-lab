import React, { useState } from 'react';
import { Scenario, Customer } from '../types';
import { PRESET_5_CUSTOMER, generateScenario } from '../algorithms/generator';
import { executeAlgorithm, AlgorithmType } from '../algorithms/runner';
import { SchematicMap } from './SchematicMap';
import { CustomerDetailModal } from './CustomerDetailModal';
import { REPORTED_SCALABILITY_RESULTS } from '../data/reportedResults';
import {
  Presentation,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Play,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Award,
  BookOpen,
} from 'lucide-react';

interface StageDefinition {
  stageNumber: number;
  title: string;
  subtitle: string;
  scenarioPreset: Scenario;
  algorithmId: AlgorithmType;
  presenterNotes: string[];
  keyTakeaway: string;
}

const PRESENTATION_STAGES: StageDefinition[] = [
  {
    stageNumber: 1,
    title: 'Stage 1: The Deadline-Constrained Delivery Challenge',
    subtitle: 'Lexicographic Logistics Problem Formalization',
    scenarioPreset: PRESET_5_CUSTOMER,
    algorithmId: 'nn',
    presenterNotes: [
      'Welcome everyone to Team 7’s DAA presentation on Deadline-Constrained Last-Mile Delivery Optimization.',
      'Last-mile logistics faces conflicting objectives: customers demand on-time arrivals, while carriers demand minimum fuel expenditure.',
      'We formulate this as a Lexicographic Optimization Problem: Primary objective is strictly to MAXIMIZE on-time deliveries; secondary objective is to MINIMIZE total tour distance.',
      'Our benchmark scenario features a central depot at (50, 50), 2-minute service dwell durations per customer, and strict deadline thresholds.',
    ],
    keyTakeaway:
      'Standard TSP minimizes distance only. In real logistics, delivering late breaches customer SLAs. Lexicographic prioritization is mathematically essential.',
  },
  {
    stageNumber: 2,
    title: 'Stage 2: Nearest Neighbour (NN) Heuristic',
    subtitle: 'The Greedy Spatial Trap',
    scenarioPreset: PRESET_5_CUSTOMER,
    algorithmId: 'nn',
    presenterNotes: [
      'Nearest Neighbour greedily selects the closest unvisited customer from the vehicle’s current location.',
      'Notice Customer #5: because NN is temporal-blind, it visits Customers #1, #2, #3, #4 first, leaving Customer #5 for last, causing Customer #5’s urgent deadline to be missed!',
      'On this live canvas, NN scores 4/5 on-time (80%). Greedy spatial proximity alone fails under deadline constraints.',
      'Historical PPT Benchmark Reference: NN similarly scored 4/5 on-time with distance 34.0 units.',
    ],
    keyTakeaway:
      'Nearest Neighbour minimizes local distance but causes SLA breaches due to zero temporal awareness (4/5 on-time).',
  },
  {
    stageNumber: 3,
    title: 'Stage 3: Earliest Deadline First (EDF) Heuristic',
    subtitle: 'The Greedy Temporal Zigzag Trap',
    scenarioPreset: PRESET_5_CUSTOMER,
    algorithmId: 'edf',
    presenterNotes: [
      'To fix deadline urgency, EDF sorts deliveries strictly by increasing deadline urgency.',
      'Notice the dramatic zigzagging on the map: the vehicle crisscrosses across the coordinate grid.',
      'Because spatial distance is completely ignored, total route distance explodes to 57.4 units (+31.7% detour over NN).',
      'Paradoxically, excessive transit delay causes deliveries to arrive late anyway. In our historical PPT experiment, EDF caused a +40.3% detour explosion (47.7 units) and missed a delivery.',
    ],
    keyTakeaway:
      'Pure urgency sorting (EDF) causes extreme travel detours, ironically causing deadline failures due to transit delay.',
  },
  {
    stageNumber: 4,
    title: 'Stage 4: Insertion Heuristic (INS)',
    subtitle: 'Lexicographic Construction Balancing Time & Space',
    scenarioPreset: PRESET_5_CUSTOMER,
    algorithmId: 'ins',
    presenterNotes: [
      'The Insertion Heuristic orders customers by deadline, but tests every insertion slot in the current route.',
      'At each insertion, it checks feasibility using our shared evaluator, selecting the slot with minimum incremental distance detour Δd.',
      'Observe the resulting route: it achieves a perfect 5/5 on-time deliveries (100% feasibility)!',
      'Total distance is 43.6 units—saving significant detour compared to EDF while fulfilling 100% of customer deadlines.',
      'Historical PPT Benchmark Reference: INS achieved 100% on-time delivery (5/5) with distance 38.8 units.',
    ],
    keyTakeaway:
      'Insertion Heuristic achieves 100% on-time delivery (5/5) by balancing temporal deadlines with spatial geometry.',
  },
  {
    stageNumber: 5,
    title: 'Stage 5: Insertion + 2-Opt Optimization',
    subtitle: 'Feasibility-Preserving Local Search Refinement',
    scenarioPreset: PRESET_5_CUSTOMER,
    algorithmId: 'ins-2opt',
    presenterNotes: [
      'We now enhance the insertion solution with 2-Opt local search.',
      '2-Opt examines pairs of edges and tests subsegment reversals.',
      'Crucially, our algorithm enforces a Feasibility-Preserving Invariant: no reversal is accepted if it compromises any customer’s on-time status.',
      'On this 5-customer benchmark, the insertion solution is already 2-opt optimal (distance 43.6 units, 100% feasibility). On larger instances (N=200), 2-opt eliminates loops and reduces distance by an additional 22%.',
      'Historical PPT Benchmark Reference: INS + 2-opt confirmed 100% feasibility with 38.8 distance units.',
    ],
    keyTakeaway:
      'Feasibility-preserving 2-opt safely untangles routes without ever degrading customer delivery timeliness.',
  },
  {
    stageNumber: 6,
    title: 'Stage 6: Held-Karp Exact Dynamic Programming',
    subtitle: 'The Mathematical Ground-Truth Benchmark',
    scenarioPreset: PRESET_5_CUSTOMER,
    algorithmId: 'held-karp',
    presenterNotes: [
      'To prove whether our heuristic solution is truly optimal, we run the Held-Karp exact DP solver.',
      'Held-Karp checks all 2^5 = 32 subset states in O(N² · 2ᴺ) time.',
      'Result: The exact global optimum is indeed 5/5 on-time deliveries with distance 43.6 units!',
      'This proves that INS and INS + 2-opt discovered the mathematically exact global optimum on this benchmark.',
      'Historical PPT Benchmark Reference: Held-Karp proved exact global optimality at 38.8 distance units meeting all 5 deadlines.',
      'Note the complexity boundary: Held-Karp runs in 183.8 ms at N=14, but is computationally intractable for larger fleets.',
    ],
    keyTakeaway:
      'Held-Karp proves that INS achieves the exact global optimum, confirming heuristic mathematical soundness.',
  },
  {
    stageNumber: 7,
    title: 'Stage 7: Scalability & Benchmark Analysis',
    subtitle: 'Empirical Verification Across N = 20 to 200',
    scenarioPreset: generateScenario(20, 2, 0.35, 101),
    algorithmId: 'ins-2opt',
    presenterNotes: [
      'Let us examine how these algorithms perform as customer volume scales from 20 to 200 nodes.',
      'At N=20: NN achieves 67.7%, EDF achieves only 12.3%, while INS + 2-opt hits 80.0%.',
      'At N=50: INS + 2-opt achieves 92.9% on-time.',
      'At N=200: INS + 2-opt achieves a flawless 100.0% on-time delivery while generating routes 22% shorter than NN and 40% shorter than EDF.',
      'Under tight deadlines (tightness 0.35), INS + 2-opt maintains 87% success compared to EDF’s collapse to 23.7%.',
    ],
    keyTakeaway:
      'INS + 2-opt dominates at scale: 100% on-time delivery at N=200, with 22% fuel reduction over NN and 40% over EDF.',
  },
  {
    stageNumber: 8,
    title: 'Stage 8: Conclusions & Logistics Recommendations',
    subtitle: 'Summary of Theoretical & Practical Findings',
    scenarioPreset: PRESET_5_CUSTOMER,
    algorithmId: 'ins-2opt',
    presenterNotes: [
      'In conclusion, pure spatial greedy (NN) and pure temporal greedy (EDF) are fundamentally flawed for deadline-constrained delivery.',
      'Insertion Heuristic combined with Feasibility-Preserving 2-Opt provides the optimal practical compromise: polynomial O(N³) scaling with near-optimal route efficiency.',
      'Held-Karp provides an invaluable theoretical benchmark for small instances but hits an exponential wall beyond N=14.',
      'For enterprise last-mile dispatch systems, we strongly recommend INS + 2-Opt as the core routing engine.',
      'Thank you! We are now open for questions from the evaluation panel.',
    ],
    keyTakeaway:
      'INS + 2-Opt is the clear victor: polynomial O(N³) runtime, robust deadline adherence, and superior fuel economy.',
  },
];

export const PresentationView: React.FC = () => {
  const [currentStageIdx, setCurrentStageIdx] = useState<number>(0);
  const [isDemoRunning, setIsDemoRunning] = useState<boolean>(false);
  const [demoTime, setDemoTime] = useState<number>(100);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const stage = PRESENTATION_STAGES[currentStageIdx];
  const totalStages = PRESENTATION_STAGES.length;

  // Run algorithm for stage scenario
  const stageResult = executeAlgorithm(stage.algorithmId, stage.scenarioPreset);

  const handleNext = () => {
    if (currentStageIdx < totalStages - 1) {
      setCurrentStageIdx((prev) => prev + 1);
      setDemoTime(100);
      setIsDemoRunning(false);
    }
  };

  const handlePrev = () => {
    if (currentStageIdx > 0) {
      setCurrentStageIdx((prev) => prev - 1);
      setDemoTime(100);
      setIsDemoRunning(false);
    }
  };

  const handleRestart = () => {
    setCurrentStageIdx(0);
    setDemoTime(100);
    setIsDemoRunning(false);
  };

  const handleRunDemo = () => {
    setDemoTime(0);
    setIsDemoRunning(true);
    // Simple incremental animation
    let t = 0;
    const interval = setInterval(() => {
      t += 2.0;
      if (t >= stageResult.totalCompletionTime) {
        setDemoTime(stageResult.totalCompletionTime);
        setIsDemoRunning(false);
        clearInterval(interval);
      } else {
        setDemoTime(t);
      }
    }, 120);
  };

  return (
    <div className="space-y-6">
      {/* Presenter Stage Controller Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold">
            {stage.stageNumber}/{totalStages}
          </div>
          <div>
            <h2 className="text-sm font-bold text-white m-0">{stage.title}</h2>
            <p className="text-xs text-blue-400 m-0">{stage.subtitle}</p>
          </div>
        </div>

        {/* Presenter Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleRestart}
            title="Restart from Stage 1"
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold border border-slate-700 transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={handlePrev}
            disabled={currentStageIdx === 0}
            className="flex items-center gap-1 px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 transition"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <button
            onClick={handleRunDemo}
            disabled={isDemoRunning}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition shadow"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>{isDemoRunning ? 'Simulating...' : 'Run Demonstration'}</span>
          </button>

          <button
            onClick={handleNext}
            disabled={currentStageIdx === totalStages - 1}
            className="flex items-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-lg text-xs font-bold transition shadow"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stage Progress Bar */}
      <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
        <div
          className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full transition-all duration-300"
          style={{ width: `${((currentStageIdx + 1) / totalStages) * 100}%` }}
        />
      </div>

      {/* Main Stage Grid: Map + Presenter Notes & Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Schematic Stage Map (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white">
                Active Demonstration: {stageResult.algorithmName}
              </span>
              <span className="font-mono text-emerald-400 font-bold">
                {stageResult.onTimeCount} / {stageResult.totalCustomers} On-Time ({stageResult.onTimePercentage}%) · Dist {stageResult.totalDistance}
              </span>
            </div>

            <SchematicMap
              scenario={stage.scenarioPreset}
              algorithmResult={stageResult}
              currentTime={demoTime}
              selectedCustomer={selectedCustomer}
              onSelectCustomer={(c) => setSelectedCustomer(c)}
            />
          </div>

          {/* Dual Telemetry Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-lg flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-400" />
              <span className="font-bold text-white uppercase text-[10px] tracking-wider">
                Telemetry Audit
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-slate-400">Live Canvas:</span>
                <span className="font-mono font-bold text-emerald-300">
                  {stageResult.onTimeCount}/{stageResult.totalCustomers} ({stageResult.onTimePercentage}%), {stageResult.totalDistance} dist
                </span>
              </div>
              <div className="flex items-center gap-1.5 border-l border-slate-800 pl-3">
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                <span className="text-slate-400">PPT Slide 7:</span>
                <span className="font-mono font-bold text-blue-300">
                  {stage.algorithmId === 'nn'
                    ? '4/5 on-time, 34.0 dist'
                    : stage.algorithmId === 'edf'
                    ? '4/5 on-time, 47.7 dist'
                    : stage.algorithmId === 'ins'
                    ? '5/5 on-time, 38.8 dist'
                    : stage.algorithmId === 'ins-2opt'
                    ? stage.stageNumber === 7
                      ? 'N=20: 80% → N=200: 100%'
                      : '5/5 on-time, 38.8 dist'
                    : stage.algorithmId === 'held-karp'
                    ? '5/5 on-time, 38.8 dist'
                    : 'Reference'}
                </span>
              </div>
            </div>
          </div>

          {/* Key Takeaway Callout Banner */}
          <div className="bg-blue-950/40 border border-blue-800/60 p-4 rounded-xl flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-300 block mb-1">
                Stage Key Takeaway
              </span>
              <p className="text-xs text-slate-200 leading-relaxed font-medium">{stage.keyTakeaway}</p>
            </div>
          </div>
        </div>

        {/* Presenter Notes & Slide Guidance (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Presenter Notes Drawer */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-400" /> Presenter Talking Points
              </h3>
              <span className="text-[10px] text-purple-300 bg-purple-950 px-2 py-0.5 rounded border border-purple-800/50">
                Presenter Cue Card
              </span>
            </div>

            <div className="space-y-3">
              {stage.presenterNotes.map((note, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 text-xs text-slate-300 bg-slate-950/50 p-3 rounded-lg border border-slate-800/60 leading-relaxed"
                >
                  <span className="w-5 h-5 rounded-full bg-blue-600/20 text-blue-400 font-bold flex items-center justify-center shrink-0 text-[10px]">
                    {idx + 1}
                  </span>
                  <span>{note}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Academic Formulation Summary */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg text-xs space-y-2">
            <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px] block">
              Lexicographic Objective Invariant
            </span>
            <div className="bg-slate-950 p-3 rounded border border-slate-800 font-mono text-slate-300 space-y-1">
              <div>
                <span className="text-emerald-400 font-bold">1° Obj:</span>{' '}
                <span className="text-slate-200">Maximize Σ I(arr_i ≤ deadline_i)</span>
              </div>
              <div>
                <span className="text-amber-400 font-bold">2° Obj:</span>{' '}
                <span className="text-slate-200">Minimize Σ ||x_i - x_(i-1)||</span>
              </div>
              <div className="text-[11px] text-slate-500 pt-1">
                Constraint: arr_i = dept_(i-1) + dist(i-1, i) / v; serv_i = 2.0m
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Detail Inspector Modal */}
      <CustomerDetailModal
        customer={selectedCustomer}
        depot={stage.scenarioPreset.depot}
        algorithmResult={stageResult}
        currentTime={demoTime}
        onClose={() => setSelectedCustomer(null)}
      />
    </div>
  );
};
