import React, { useState } from 'react';
import { Scenario, AlgorithmResult, Customer } from '../types';
import { executeAllAlgorithms, ALGORITHM_METADATA, AlgorithmType } from '../algorithms/runner';
import { SchematicMap } from './SchematicMap';
import { BarChart, BarItem } from './ChartComponents';
import { CustomerDetailModal } from './CustomerDetailModal';
import {
  GitCompare,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Clock,
  Navigation,
  ArrowUpRight,
  ArrowDownRight,
  Info,
} from 'lucide-react';

interface ComparisonViewProps {
  scenario: Scenario;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({ scenario }) => {
  // Execute all 5 algorithms on identical scenario
  const comparisonResults = executeAllAlgorithms(scenario);

  // Active algorithm displayed on the schematic map
  const [activeAlgorithmId, setActiveAlgorithmId] = useState<AlgorithmType>('ins-2opt');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const activeResult = comparisonResults[activeAlgorithmId];
  const nnBaselineDist = comparisonResults['nn'].totalDistance;

  // Chart data: On-Time Percentage
  const onTimeChartData: BarItem[] = ALGORITHM_METADATA.map((meta) => {
    const res = comparisonResults[meta.id];
    return {
      label: meta.shortName,
      value: res.onTimePercentage,
      color: meta.color,
      subtext: `${res.onTimeCount} / ${res.totalCustomers} on-time deliveries (${res.lateCount} late)`,
    };
  });

  // Chart data: Total Route Distance
  const distanceChartData: BarItem[] = ALGORITHM_METADATA.map((meta) => {
    const res = comparisonResults[meta.id];
    return {
      label: meta.shortName,
      value: res.totalDistance,
      color: meta.color,
      subtext: `Total tour distance: ${res.totalDistance} units across ${res.routes.length} vehicle(s)`,
    };
  });

  // Chart data: Execution Time (ms)
  const runtimeChartData: BarItem[] = ALGORITHM_METADATA.map((meta) => {
    const res = comparisonResults[meta.id];
    return {
      label: meta.shortName,
      value: Math.max(0.01, res.executionTimeMs),
      color: meta.color,
      subtext: `Measured runtime: ${res.executionTimeMs} ms (${res.theoreticalComplexity})`,
    };
  });

  // Chart data: Distance Improvement vs NN (%)
  const distanceImprovementData: BarItem[] = ALGORITHM_METADATA.map((meta) => {
    const res = comparisonResults[meta.id];
    const diff = Number((((nnBaselineDist - res.totalDistance) / nnBaselineDist) * 100).toFixed(1));
    return {
      label: meta.shortName,
      value: diff,
      color: diff >= 0 ? '#10b981' : '#f43f5e',
      subtext:
        diff >= 0
          ? `${diff}% shorter than Nearest Neighbour`
          : `${Math.abs(diff)}% longer than Nearest Neighbour`,
    };
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-bold text-white m-0">Algorithm Comparison Laboratory</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Simultaneous multi-heuristic evaluation on the identical scenario (N={scenario.customers.length}, K={scenario.fleetSize}, Tightness={scenario.tightness}, Seed={scenario.seed}).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Inspecting Route:</span>
          <div className="flex flex-wrap gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            {ALGORITHM_METADATA.map((meta) => (
              <button
                key={meta.id}
                onClick={() => setActiveAlgorithmId(meta.id)}
                className={`px-2.5 py-1 rounded text-xs font-bold transition flex items-center gap-1.5 ${
                  activeAlgorithmId === meta.id
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
      </div>

      {/* Schematic Map for Active Inspected Route */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-white">Visualizing: {activeResult.algorithmName}</span>
            <span className="text-slate-400">
              · {activeResult.onTimeCount}/{activeResult.totalCustomers} on time ({activeResult.onTimePercentage}%) · Distance {activeResult.totalDistance}
            </span>
          </div>
          <span className="text-[11px] font-mono text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/40">
            Runtime: {activeResult.executionTimeMs} ms
          </span>
        </div>

        <SchematicMap
          scenario={scenario}
          algorithmResult={activeResult}
          currentTime={activeResult.totalCompletionTime} // show full completed tour
          selectedCustomer={selectedCustomer}
          onSelectCustomer={(c) => setSelectedCustomer(c)}
        />
      </div>

      {/* Interactive Comprehensive Comparison Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white m-0">Lexicographic Performance Matrix</h3>
          <span className="text-xs text-slate-400">Primary: On-Time % | Secondary: Distance</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Algorithm</th>
                <th className="py-3 px-3">Complexity</th>
                <th className="py-3 px-3 text-center">On-Time / Total</th>
                <th className="py-3 px-3 text-center">On-Time %</th>
                <th className="py-3 px-3 text-right">Route Distance</th>
                <th className="py-3 px-3 text-right">Vs NN Baseline</th>
                <th className="py-3 px-3 text-right">Tour Duration</th>
                <th className="py-3 px-3 text-right">Exec Time (ms)</th>
                <th className="py-3 px-3 text-center">Feasibility</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {ALGORITHM_METADATA.map((meta) => {
                const res = comparisonResults[meta.id];
                const isActive = activeAlgorithmId === meta.id;
                const vsNn = Number((((nnBaselineDist - res.totalDistance) / nnBaselineDist) * 100).toFixed(1));

                return (
                  <tr
                    key={meta.id}
                    onClick={() => setActiveAlgorithmId(meta.id)}
                    className={`cursor-pointer transition hover:bg-slate-800/50 ${
                      isActive ? 'bg-blue-900/20 font-semibold' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-sans flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: meta.color }} />
                      <span className="text-white font-bold">{meta.name}</span>
                    </td>
                    <td className="py-3 px-3 text-slate-400">{meta.complexity}</td>
                    <td className="py-3 px-3 text-center">
                      <span className="text-emerald-400 font-bold">{res.onTimeCount}</span> / {res.totalCustomers}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                          res.onTimePercentage === 100
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/50'
                            : res.onTimePercentage >= 80
                            ? 'bg-blue-950 text-blue-300 border border-blue-800/50'
                            : 'bg-rose-950 text-rose-300 border border-rose-800/50'
                        }`}
                      >
                        {res.onTimePercentage}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right text-slate-200">{res.totalDistance}</td>
                    <td className="py-3 px-3 text-right">
                      {meta.id === 'nn' ? (
                        <span className="text-slate-500">Baseline</span>
                      ) : vsNn >= 0 ? (
                        <span className="text-emerald-400 font-bold">-{vsNn}%</span>
                      ) : (
                        <span className="text-rose-400">+{Math.abs(vsNn)}%</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-300">{res.totalCompletionTime} m</td>
                    <td className="py-3 px-3 text-right text-purple-300">{res.executionTimeMs} ms</td>
                    <td className="py-3 px-3 text-center font-sans">
                      {res.isFeasibleAllOnTime ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Optimal 100%
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-amber-400">
                          <AlertCircle className="w-3.5 h-3.5" /> {res.lateCount} Late
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <BarChart
          title="On-Time Delivery Rate (%) — Primary Objective"
          data={onTimeChartData}
          unit="%"
          maxValue={100}
        />
        <BarChart
          title="Total Route Distance — Secondary Objective"
          data={distanceChartData}
          unit=" units"
        />
        <BarChart
          title="Actual In-Browser Algorithm Execution Time (ms)"
          data={runtimeChartData}
          unit=" ms"
        />
        <BarChart
          title="Distance Improvement vs NN Baseline (%)"
          data={distanceImprovementData}
          unit="%"
        />
      </div>

      {/* Customer Detail Inspector Modal */}
      <CustomerDetailModal
        customer={selectedCustomer}
        depot={scenario.depot}
        algorithmResult={activeResult}
        currentTime={activeResult.totalCompletionTime}
        onClose={() => setSelectedCustomer(null)}
      />
    </div>
  );
};
