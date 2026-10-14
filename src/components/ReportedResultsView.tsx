import React from 'react';
import {
  REPORTED_5_CUSTOMER_RESULTS,
  REPORTED_SCALABILITY_RESULTS,
  REPORTED_KEY_FINDINGS,
} from '../data/reportedResults';
import { BarChart, BarItem } from './ChartComponents';
import {
  FileSpreadsheet,
  Award,
  CheckCircle2,
  TrendingUp,
  Clock,
  Truck,
  Percent,
  Layers,
  Info,
} from 'lucide-react';

export const ReportedResultsView: React.FC = () => {
  // Chart data for reported 5-customer distance
  const reportedDistanceData: BarItem[] = REPORTED_5_CUSTOMER_RESULTS.map((r) => ({
    label: r.algorithm.split(' ')[0],
    value: r.totalDistance,
    color:
      r.totalDistance === 38.8
        ? '#10b981'
        : r.totalDistance < 38.8
        ? '#3b82f6'
        : '#f59e0b',
    subtext: `${r.algorithm}: Distance ${r.totalDistance}, On-time ${r.onTimeFraction}`,
  }));

  // Chart data for reported 5-customer on-time rate
  const reportedOnTimeData: BarItem[] = REPORTED_5_CUSTOMER_RESULTS.map((r) => ({
    label: r.algorithm.split(' ')[0],
    value: r.onTimePercent,
    color: r.onTimePercent === 100 ? '#10b981' : '#f43f5e',
    subtext: `${r.algorithm}: ${r.onTimeFraction} deadlines satisfied (${r.onTimePercent}%)`,
  }));

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-bold text-white m-0">
              Reported Experimental Results (DAA Presentation Archive)
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Official empirical records and benchmark tabulations directly transcribed from Woxsen University Team 7 DAA presentation.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-purple-950/50 border border-purple-800/60 px-3 py-1.5 rounded-lg text-xs text-purple-300">
          <Award className="w-4 h-4 text-purple-400" />
          <span>Primary Ground-Truth Dataset</span>
        </div>
      </div>

      {/* Academic Attribution Disclaimer */}
      <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl text-xs text-slate-400 leading-relaxed flex items-start gap-3">
        <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-200">Experimental Integrity Note:</span> The data on this page reflects historical benchmarks reported during academic evaluations. They are preserved in this dedicated section separate from live browser-generated simulations.
        </div>
      </div>

      {/* 1. Five Customers, Single Vehicle Reference Benchmark */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold text-white m-0">
              1. Five Customers, One Vehicle Benchmark (N = 5, K = 1)
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">Foundational Pedagogical Case</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-sans">
              <tr>
                <th className="py-3 px-4">Algorithm</th>
                <th className="py-3 px-3 text-center">On-Time Score</th>
                <th className="py-3 px-3 text-center">Success Rate</th>
                <th className="py-3 px-3 text-right">Route Distance</th>
                <th className="py-3 px-3 text-center">Optimality Status</th>
                <th className="py-3 px-4">Experimental Observations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {REPORTED_5_CUSTOMER_RESULTS.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30 transition">
                  <td className="py-3 px-4 font-sans font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    {row.algorithm}
                  </td>
                  <td className="py-3 px-3 text-center font-bold text-slate-200">{row.onTimeFraction}</td>
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                        row.onTimePercent === 100
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                          : 'bg-rose-950 text-rose-300 border border-rose-800/60'
                      }`}
                    >
                      {row.onTimePercent.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right text-slate-200 font-bold">{row.totalDistance.toFixed(1)}</td>
                  <td className="py-3 px-3 text-center font-sans">
                    {row.totalDistance === 38.8 && row.onTimePercent === 100 ? (
                      <span className="text-emerald-400 font-bold flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Optimal
                      </span>
                    ) : row.totalDistance < 38.8 ? (
                      <span className="text-rose-400">Infeasible (1 Late)</span>
                    ) : (
                      <span className="text-amber-400">Sub-optimal Detour</span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-sans text-slate-400 text-[11px]">{row.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visual Charts for 5-Customer Case */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <BarChart
          title="Reported 5-Customer Route Distance"
          data={reportedDistanceData}
          unit=" units"
        />
        <BarChart
          title="Reported 5-Customer On-Time Rate (%)"
          data={reportedOnTimeData}
          unit="%"
          maxValue={100}
        />
      </div>

      {/* 2. Scalability Across Scale N = 20, 50, 100, 200 */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white m-0">
              2. Reported Scalability Matrix Across Customer Volumes
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">Customer Volumes (N = 20 to 200)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-sans">
              <tr>
                <th className="py-3 px-4">Customers (N)</th>
                <th className="py-3 px-4 text-center">Nearest Neighbour (NN)</th>
                <th className="py-3 px-4 text-center">Earliest Deadline (EDF)</th>
                <th className="py-3 px-4 text-center">Insertion (INS)</th>
                <th className="py-3 px-4 text-center">INS + 2-Opt (Best)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {REPORTED_SCALABILITY_RESULTS.map((row) => (
                <tr key={row.customers} className="hover:bg-slate-800/30 transition">
                  <td className="py-3 px-4 font-bold text-white font-sans flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500" />
                    {row.customers} Customers
                  </td>
                  <td className="py-3 px-4 text-center text-blue-300">{row.nn.toFixed(1)}%</td>
                  <td className="py-3 px-4 text-center text-amber-300">{row.edf.toFixed(1)}%</td>
                  <td className="py-3 px-4 text-center text-emerald-300">{row.ins.toFixed(1)}%</td>
                  <td className="py-3 px-4 text-center font-bold text-purple-300 bg-purple-950/20">
                    {row.ins2opt.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Key Experimental Findings Cards */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
          <Award className="w-4 h-4 text-blue-400" /> 3. Additional Key Experimental Findings
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {REPORTED_KEY_FINDINGS.map((finding, idx) => (
            <div
              key={idx}
              className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col justify-between hover:border-slate-700 transition"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {finding.category}
                  </span>
                  <span className="text-xs font-mono text-purple-400 font-bold">
                    {finding.comparison}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white mb-1">{finding.title}</h4>
                <div className="text-lg font-black text-emerald-400 font-mono mb-2">
                  {finding.highlight}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{finding.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
