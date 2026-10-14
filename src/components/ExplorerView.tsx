import React, { useState } from 'react';
import { Scenario, AlgorithmResult } from '../types';
import { executeAlgorithm, ALGORITHM_METADATA, AlgorithmType } from '../algorithms/runner';
import {
  BookOpen,
  Code,
  Clock,
  Layers,
  CheckCircle,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Terminal,
} from 'lucide-react';

interface ExplorerViewProps {
  scenario: Scenario;
}

interface AlgorithmDetailDoc {
  id: AlgorithmType;
  title: string;
  tagline: string;
  intuition: string;
  steps: string[];
  pseudocode: string;
  selectionLogic: string;
  deadlineHandling: string;
  timeComplexity: string;
  spaceComplexity: string;
  strengths: string[];
  limitations: string[];
}

const ALGORITHM_DOCS: Record<AlgorithmType, AlgorithmDetailDoc> = {
  nn: {
    id: 'nn',
    title: 'Nearest Neighbour (NN)',
    tagline: 'Greedy Spatial Proximity Heuristic',
    intuition:
      'Always travel to the closest unvisited customer from the current position. Highly intuitive and fast, but completely blind to delivery deadlines.',
    steps: [
      'Initialize tour at the central depot at T = 0.',
      'From current node, scan all unvisited customers in the fleet partition.',
      'Compute Euclidean distance to each candidate customer.',
      'Append the closest customer to the route and update current location.',
      'Repeat until all customers are visited, then return to the depot.',
      'Post-evaluate deadline arrival times and record lateness.',
    ],
    pseudocode: `function NearestNeighbour(Depot, Customers):
    Route = [Depot]
    Current = Depot
    Unvisited = Set(Customers)
    
    while Unvisited is not empty:
        NextCust = argmin_{c in Unvisited} EuclideanDistance(Current, c)
        Route.append(NextCust)
        Unvisited.remove(NextCust)
        Current = NextCust
        
    Route.append(Depot)
    return EvaluateDeadlines(Route)`,
    selectionLogic:
      'Greedy minimization of Euclidean distance d(p_curr, p_cand). No deadline lookahead.',
    deadlineHandling:
      'Passive / Post-hoc. Deadlines are evaluated after the path is finalized. Often produces high lateness on clusters located far from depot with early deadlines.',
    timeComplexity: 'O(N²)',
    spaceComplexity: 'O(N)',
    strengths: [
      'Simple to understand and implement.',
      'Low computational overhead (quadratic in N).',
      'Minimizes local leg distances.',
    ],
    limitations: [
      'Zero temporal awareness causes deadline failures.',
      'Suffers from "greedy trap" where last nodes require massive detour returns.',
    ],
  },
  edf: {
    id: 'edf',
    title: 'Earliest Deadline First (EDF)',
    tagline: 'Greedy Temporal Urgency Heuristic',
    intuition:
      'Sort all deliveries strictly by their required deadline and dispatch to the most urgent customer next. Ensures urgency prioritization, but produces terrible zigzagging detours.',
    steps: [
      'Collect all customer deadlines {d_1, d_2, ..., d_n}.',
      'Sort customers in ascending order of deadline (smallest d_i first).',
      'Partition customers among fleet vehicles.',
      'Dispatch vehicle sequentially through sorted deadline sequence.',
      'Vehicle visits customers in strict order, regardless of spatial proximity.',
      'Calculate travel time, arrival time, and depot return.',
    ],
    pseudocode: `function EarliestDeadlineFirst(Depot, Customers):
    SortedCustomers = Sort(Customers, key = lambda c: c.deadline)
    Route = [Depot]
    
    for customer in SortedCustomers:
        Route.append(customer)
        
    Route.append(Depot)
    return EvaluateDeadlines(Route)`,
    selectionLogic:
      'Strict ascending order of customer deadlines. Spatial proximity is completely ignored.',
    deadlineHandling:
      'Priority-based temporal ordering. Paradoxically, because spatial distances are ignored, excessive transit detour times cause vehicles to arrive late anyway.',
    timeComplexity: 'O(N log N)',
    spaceComplexity: 'O(N)',
    strengths: [
      'Fastest asymptotic runtime (sorting bounded).',
      'Optimal in single-machine scheduling without travel costs.',
    ],
    limitations: [
      'Causes severe zigzagging and excessive route distances (+40% vs NN).',
      'Long travel times paradoxically cause tight deadlines to be missed.',
    ],
  },
  ins: {
    id: 'ins',
    title: 'Insertion Heuristic (INS)',
    tagline: 'Lexicographic Feasibility-Preserving Construction',
    intuition:
      'Processes customers in deadline order and inserts each into the existing route at the position that minimizes detour cost while maintaining deadline feasibility.',
    steps: [
      'Sort all customers by deadline ascending.',
      'Initialize route for each vehicle starting and ending at Depot.',
      'For each customer c in deadline order:',
      '  Test inserting c at every possible position k in the route.',
      '  Evaluate the candidate route using the shared evaluator (calculating arrival times for all stops).',
      '  Identify all positions where all stops meet their deadline (feasible insertions).',
      '  If feasible positions exist, pick the position minimizing incremental distance Δd.',
      '  If none are completely feasible, pick position maximizing on-time count.',
      'Repeat until all customers are inserted.',
    ],
    pseudocode: `function InsertionHeuristic(Depot, Customers):
    Sorted = Sort(Customers, key = c.deadline)
    Route = [Depot, Depot]
    
    for cust in Sorted:
        BestPos = -1
        BestCost = Infinity
        BestOnTime = -1
        
        for pos in 1 .. (Route.length - 1):
            Candidate = Insert(Route, cust, pos)
            Eval = SharedEvaluator(Candidate)
            DeltaDist = Eval.Distance - CurrentDistance
            
            if Eval.LateCount == 0:
                if DeltaDist < BestCost:
                    BestCost = DeltaDist; BestPos = pos
            elif BestCost == Infinity and Eval.OnTime > BestOnTime:
                BestOnTime = Eval.OnTime; BestPos = pos
                
        Route = Insert(Route, cust, BestPos)
    return Route`,
    selectionLogic:
      'Considers customers by deadline, then selects insertion slot via lexicographic optimization (max on-time, min Δdistance).',
    deadlineHandling:
      'Active predictive lookahead. Recomputes arrival times for the entire route at every candidate insertion.',
    timeComplexity: 'O(N³)',
    spaceComplexity: 'O(N)',
    strengths: [
      'Balances temporal deadlines with spatial geometry.',
      'Achieves 92% to 100% on-time delivery across large instances.',
      'Avoids the zigzagging trap of EDF.',
    ],
    limitations: [
      'Cubic complexity requires more CPU cycles than pure greedy methods.',
      'Greedy insertion may get stuck in local sequence structures.',
    ],
  },
  'ins-2opt': {
    id: 'ins-2opt',
    title: 'Insertion + 2-Opt (INS + 2-opt)',
    tagline: 'Feasibility-Preserving Local Search Optimization',
    intuition:
      'Takes the feasible route produced by Insertion Heuristic and searches for pairwise subsegment reversals that reduce route distance without violating any deadline.',
    steps: [
      'Construct initial route using Insertion Heuristic.',
      'Iterate over all pairs of edges (i, j) in the route.',
      'Reverse the customer subsegment between i and j.',
      'Evaluate the proposed reversal with the shared evaluator.',
      'Accept the reversal IF it improves on-time deliveries OR preserves on-time count while strictly reducing total distance.',
      'Reject the reversal if it causes any on-time customer to become late.',
      'Repeat until no further improving reversals can be made (local optimum).',
    ],
    pseudocode: `function InsertionPlus2Opt(Scenario):
    Route = InsertionHeuristic(Scenario)
    Improved = True
    
    while Improved:
        Improved = False
        for i in 0 .. (Route.length - 2):
            for j in (i + 1) .. (Route.length - 1):
                Candidate = 2OptReverse(Route, i, j)
                CandidateEval = SharedEvaluator(Candidate)
                CurrentEval = SharedEvaluator(Route)
                
                // Feasibility preservation rule
                if CandidateEval.OnTime > CurrentEval.OnTime:
                    Route = Candidate; Improved = True; break
                elif CandidateEval.OnTime == CurrentEval.OnTime 
                     and CandidateEval.Distance < CurrentEval.Distance - eps:
                    Route = Candidate; Improved = True; break
                    
    return Route`,
    selectionLogic:
      'Systematic 2-opt edge swap neighborhood exploration with strict lexicographic acceptance filters.',
    deadlineHandling:
      'Feasibility-Preserving Invariant. A move that saves distance is discarded immediately if it degrades delivery timeliness.',
    timeComplexity: 'O(N³)',
    spaceComplexity: 'O(N)',
    strengths: [
      'Top-performing heuristic in both promptness and fuel efficiency.',
      'Produces routes ~22% shorter than NN and ~40% shorter than EDF at N=200.',
      'Eliminates self-intersecting route loops.',
    ],
    limitations: [
      'Slightly higher CPU runtime due to repeated route evaluations.',
      'Local search stops at local optima, not guaranteed global minimum.',
    ],
  },
  'held-karp': {
    id: 'held-karp',
    title: 'Held-Karp Dynamic Programming',
    tagline: 'Exact Mathematical Optimum for Small Instances',
    intuition:
      'Solves the deadline-constrained routing problem to provable mathematical optimality using bitmask dynamic programming over state (visited_subset, current_node).',
    steps: [
      'Define state DP(S, u): optimal path visiting subset S of customers and terminating at node u.',
      'Base cases: for each customer i, DP({i}, i) is direct path Depot -> i.',
      'Recurrence: DP(S, u) = min_{v in S \\ {u}} [ DP(S \\ {u}, v) + dist(v, u) ], tracking arrival times.',
      'Evaluate deadline satisfaction along candidate trajectories.',
      'Lexicographic tie-breaking: prioritize higher on-time deliveries, then minimum distance.',
      'Complete tour: min_{u} [ DP(All, u) + dist(u, Depot) ].',
      'Trace back optimal trajectory via parent pointers.',
    ],
    pseudocode: `function HeldKarp(Depot, Customers):
    N = Customers.length
    DP = Table of size [2^N][N]
    
    for i in 0 .. N-1:
        DP[1 << i][i] = DirectPath(Depot, Customers[i])
        
    for subset_size in 2 .. N:
        for S of size subset_size:
            for u in S:
                for v in S \\ {u}:
                    Candidate = DP[S \\ {u}][v] + Step(v, u)
                    if LexicographicallyBetter(Candidate, DP[S][u]):
                        DP[S][u] = Candidate
                        
    OptimalTour = min_{u} [ DP[(1<<N)-1][u] + ReturnToDepot(u) ]
    return ReconstructPath(OptimalTour)`,
    selectionLogic:
      'Exact dynamic programming covering all 2^N subsets. Guarantees global lexicographic optimality.',
    deadlineHandling:
      'Exact optimal evaluation over all permutation sub-paths.',
    timeComplexity: 'O(N² · 2ᴺ)',
    spaceComplexity: 'O(N · 2ᴺ)',
    strengths: [
      'Mathematically guaranteed global optimal solution.',
      'Serves as the gold standard ground truth for evaluating heuristics.',
    ],
    limitations: [
      'Exponential time and memory complexity.',
      'Intractable beyond N = 14 (strictly protected in this application).',
      'Single-vehicle formulation only.',
    ],
  },
};

export const ExplorerView: React.FC<ExplorerViewProps> = ({ scenario }) => {
  const [selectedAlg, setSelectedAlg] = useState<AlgorithmType>('ins-2opt');

  // Compute live result and decisions for currently selected algorithm
  const result = executeAlgorithm(selectedAlg, scenario);
  const doc = ALGORITHM_DOCS[selectedAlg];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-bold text-white m-0">Algorithm Explorer & Pedagogical Engine</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Deep algorithmic mechanics, formal pseudocode, and dynamic step-by-step execution traces.
          </p>
        </div>

        {/* Algorithm Selector Buttons */}
        <div className="flex flex-wrap gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          {ALGORITHM_METADATA.map((meta) => (
            <button
              key={meta.id}
              onClick={() => setSelectedAlg(meta.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-1.5 ${
                selectedAlg === meta.id
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: meta.color }} />
              {meta.shortName}
            </button>
          ))}
        </div>
      </div>

      {/* Main Algorithm Educational Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg space-y-6">
        {/* Title and Tagline */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-xl font-black text-white m-0 flex items-center gap-2">
              {doc.title}
            </h3>
            <p className="text-xs text-blue-400 font-semibold mt-0.5">{doc.tagline}</p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="px-2.5 py-1 bg-slate-800 text-purple-300 rounded border border-slate-700">
              Time: {doc.timeComplexity}
            </span>
            <span className="px-2.5 py-1 bg-slate-800 text-sky-300 rounded border border-slate-700">
              Space: {doc.spaceComplexity}
            </span>
          </div>
        </div>

        {/* Core Intuition */}
        <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-xl text-sm text-slate-300 leading-relaxed">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Core Algorithmic Intuition
          </span>
          {doc.intuition}
        </div>

        {/* Execution Steps & Pseudocode Side-by-Side */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Steps List (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-400" /> Step-by-Step Procedure
            </h4>
            <div className="space-y-2">
              {doc.steps.map((st, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2.5 text-xs text-slate-300 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60"
                >
                  <span className="w-5 h-5 rounded-full bg-blue-600/20 text-blue-400 font-bold flex items-center justify-center shrink-0 text-[10px]">
                    {i + 1}
                  </span>
                  <span>{st}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Formatted Monospace Pseudocode (7 cols) */}
          <div className="lg:col-span-7 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Code className="w-4 h-4 text-emerald-400" /> Formal Pseudocode
            </h4>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed shadow-inner">
              <pre className="m-0">{doc.pseudocode}</pre>
            </div>
          </div>
        </div>

        {/* Decision Logic & Deadline Handling */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-800">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-1">
              Customer Selection Decision Rule
            </span>
            <p className="text-xs text-slate-300 leading-normal">{doc.selectionLogic}</p>
          </div>
          <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-800">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-1">
              Deadline Constraints Handling
            </span>
            <p className="text-xs text-slate-300 leading-normal">{doc.deadlineHandling}</p>
          </div>
        </div>

        {/* Strengths & Limitations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-emerald-950/20 rounded-xl border border-emerald-900/40 space-y-2">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4" /> Algorithmic Strengths
            </span>
            <ul className="text-xs text-slate-300 space-y-1 pl-4 list-disc">
              {doc.strengths.map((str, i) => (
                <li key={i}>{str}</li>
              ))}
            </ul>
          </div>

          <div className="p-4 bg-rose-950/20 rounded-xl border border-rose-900/40 space-y-2">
            <span className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" /> Practical Limitations
            </span>
            <ul className="text-xs text-slate-300 space-y-1 pl-4 list-disc">
              {doc.limitations.map((lim, i) => (
                <li key={i}>{lim}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Live Dynamic Decision Log for Current Scenario */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-purple-400" />
            <h4 className="text-sm font-bold text-white m-0">
              Live Decision Execution Trace (Scenario N={scenario.customers.length})
            </h4>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Recorded {result.decisionSteps?.length || 0} Decision Steps
          </span>
        </div>

        <div className="max-h-64 overflow-y-auto space-y-1.5 font-mono text-xs pr-2">
          {result.decisionSteps && result.decisionSteps.length > 0 ? (
            result.decisionSteps.map((step, idx) => (
              <div
                key={idx}
                className="p-2 bg-slate-950 rounded border border-slate-800/80 flex items-center justify-between hover:bg-slate-800/30 transition"
              >
                <div className="flex items-center gap-2">
                  <span className="text-blue-400 font-bold">#{step.step}</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300">
                    {step.action}
                  </span>
                  <span className="text-slate-300">{step.description}</span>
                </div>
                {step.metricValue !== undefined && (
                  <span className="text-purple-300 text-[11px] font-bold">
                    metric: {step.metricValue}
                  </span>
                )}
              </div>
            ))
          ) : (
            <div className="text-slate-500 py-3 text-center">
              No individual decision steps recorded for this execution.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
