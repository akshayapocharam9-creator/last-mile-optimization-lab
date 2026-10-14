import React from 'react';
import {
  GraduationCap,
  Users,
  BookOpen,
  ShieldCheck,
  Scale,
  Award,
  Layers,
  MapPin,
  Clock,
  Compass,
} from 'lucide-react';

export const AboutView: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Institutional Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400 bg-blue-950 px-2.5 py-1 rounded-full border border-blue-800/60 inline-block mb-2">
            Academic Project Capstone
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white m-0 tracking-tight">
            Deadline-Constrained Last-Mile Delivery Optimization
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">
            Design and Analysis of Algorithms (DAA) · School of Technology, Woxsen University
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-700/80 px-4 py-3 rounded-xl">
          <GraduationCap className="w-8 h-8 text-purple-400" />
          <div>
            <div className="text-xs font-bold text-white uppercase tracking-wider">Evaluation</div>
            <div className="text-sm font-extrabold text-purple-300">Team 7 Presentation</div>
          </div>
        </div>
      </div>

      {/* Project Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <BookOpen className="w-4 h-4 text-blue-400" /> Academic Context
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            This laboratory was created as part of the Design and Analysis of Algorithms (DAA) curriculum at Woxsen University. It focuses on the computational study of combinatorial vehicle routing heuristics subjected to hard temporal deadlines.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Scale className="w-4 h-4 text-emerald-400" /> Objective Formalization
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Unlike classic Traveling Salesperson Problems (TSP) that minimize purely distance, real logistics penalizes broken delivery promises. We formalize this as a <strong>Lexicographic Objective</strong>: maximize on-time customers first, then minimize distance.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <ShieldCheck className="w-4 h-4 text-purple-400" /> Scientific Discipline
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            All algorithms operate under rigorous mathematical parity: identical Euclidean metrics, 2-minute service dwell durations, uniform vehicle kinematics, and exact shared evaluation functions across all benchmarks.
          </p>
        </div>
      </div>

      {/* Detailed Mathematical Formulation */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-400" /> Mathematical Problem Formulation
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs font-mono text-slate-300">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="font-sans font-bold text-slate-200 block text-sm">
              Lexicographic Objective Function
            </span>
            <div className="text-emerald-300 font-bold">
              Lex-Max: &lt; f₁(X), -f₂(X) &gt;
            </div>
            <div className="space-y-1 text-slate-400 pt-1">
              <div>
                <strong>Primary f₁(X):</strong> Total on-time deliveries:{' '}
                <span className="text-slate-200">Σᵢ 𝕀(arr_i ≤ deadline_i)</span>
              </div>
              <div>
                <strong>Secondary f₂(X):</strong> Total tour distance:{' '}
                <span className="text-slate-200">Σₖ Σⱼ ||x_j - x_(j-1)||</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="font-sans font-bold text-slate-200 block text-sm">
              Kinematics & Dwell Time Constraints
            </span>
            <div className="space-y-1 text-slate-400">
              <div>
                <strong>Departure:</strong> Vehicle departs depot at{' '}
                <span className="text-slate-200">t₀ = 0.0 min</span>
              </div>
              <div>
                <strong>Arrival Time:</strong>{' '}
                <span className="text-slate-200">arr_i = dept_(i-1) + dist(i-1, i) / v</span>
              </div>
              <div>
                <strong>Service Dwell Time:</strong> Constant{' '}
                <span className="text-slate-200">2.0 minutes</span> per customer stop
              </div>
              <div>
                <strong>Departure Time:</strong>{' '}
                <span className="text-slate-200">dept_i = arr_i + 2.0 min</span>
              </div>
              <div>
                <strong>Depot Return:</strong> Vehicle returns to depot (50, 50) after final stop
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Algorithmic Complexity Taxonomy Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="px-5 py-4 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white m-0">
            Algorithmic Hierarchy & Asymptotic Classifications
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Algorithm</th>
                <th className="py-3 px-3">Paradigm</th>
                <th className="py-3 px-3">Time Complexity</th>
                <th className="py-3 px-3">Space Complexity</th>
                <th className="py-3 px-4">Operational Trade-off</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              <tr>
                <td className="py-3 px-4 font-bold text-white">Nearest Neighbour (NN)</td>
                <td className="py-3 px-3 text-blue-300">Greedy Spatial</td>
                <td className="py-3 px-3 font-mono text-purple-300">O(N²)</td>
                <td className="py-3 px-3 font-mono text-sky-300">O(N)</td>
                <td className="py-3 px-4 text-slate-400">
                  Fast shortest-leg selection, but completely blind to delivery deadlines.
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-white">Earliest Deadline First (EDF)</td>
                <td className="py-3 px-3 text-amber-300">Greedy Temporal</td>
                <td className="py-3 px-3 font-mono text-purple-300">O(N log N)</td>
                <td className="py-3 px-3 font-mono text-sky-300">O(N)</td>
                <td className="py-3 px-4 text-slate-400">
                  Prioritizes urgency, but extreme spatial zigzagging inflates route distance (+40%).
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-white">Insertion Heuristic (INS)</td>
                <td className="py-3 px-3 text-emerald-300">Constructive Heuristic</td>
                <td className="py-3 px-3 font-mono text-purple-300">O(N³)</td>
                <td className="py-3 px-3 font-mono text-sky-300">O(N)</td>
                <td className="py-3 px-4 text-slate-400">
                  Inserts deadline-ordered customers at min incremental distance feasible positions.
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-white">Insertion + 2-Opt</td>
                <td className="py-3 px-3 text-purple-300">Local Search Optimization</td>
                <td className="py-3 px-3 font-mono text-purple-300">O(N³)</td>
                <td className="py-3 px-3 font-mono text-sky-300">O(N)</td>
                <td className="py-3 px-4 text-slate-400">
                  Iterative pairwise segment reversals preserving deadline feasibility (best balance).
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-white">Held-Karp Exact DP</td>
                <td className="py-3 px-3 text-rose-300">Dynamic Programming</td>
                <td className="py-3 px-3 font-mono text-rose-400">O(N² · 2ᴺ)</td>
                <td className="py-3 px-3 font-mono text-rose-400">O(N · 2ᴺ)</td>
                <td className="py-3 px-4 text-slate-400">
                  Provable global mathematical optimum; exponential runtime capped at N ≤ 14.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Academic Integrity Disclaimer */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg text-xs text-slate-400 space-y-2">
        <h4 className="text-xs font-bold uppercase text-slate-300 tracking-wider m-0">
          Academic Integrity & Engineering Transparency
        </h4>
        <p className="leading-relaxed">
          This system is an algorithmic testbed implementing pure computer science algorithms. The coordinate map is explicitly a <strong>Schematic Coordinate Map</strong> using Euclidean distance calculations. No real-world road network claims, machine learning predictions, or live fleet GPS telemetry are implied.
        </p>
      </div>
    </div>
  );
};
