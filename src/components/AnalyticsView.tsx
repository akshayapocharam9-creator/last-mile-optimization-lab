import React, { useMemo } from 'react';
import { Scenario } from '../types';
import { executeAllAlgorithms, ALGORITHM_METADATA } from '../algorithms/runner';
import { generateScenario } from '../algorithms/generator';
import { BarChart, MultiLineChart, LineSeries, BarItem } from './ChartComponents';
import {
  BarChart3,
  Users,
  CheckCircle2,
  AlertTriangle,
  Route,
  Truck,
  Cpu,
  Layers,
  Sparkles,
} from 'lucide-react';

interface AnalyticsViewProps {
  scenario: Scenario;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ scenario }) => {
  // Current scenario results
  const currentResults = useMemo(() => executeAllAlgorithms(scenario), [scenario]);
  const ins2optResult = currentResults['ins-2opt'];

  // Multi-scenario dynamic sweep: Customer count vs On-time & Execution time
  const customerCountSweep = useMemo(() => {
    const counts = [10, 20, 50, 100];
    const nnPoints: { x: number; y: number }[] = [];
    const edfPoints: { x: number; y: number }[] = [];
    const insPoints: { x: number; y: number }[] = [];
    const ins2optPoints: { x: number; y: number }[] = [];
    const runtimePoints: { x: number; y: number }[] = [];

    counts.forEach((n) => {
      // use fleet size proportional to customer count (e.g. 1 per 25 customers)
      const k = Math.max(1, Math.floor(n / 25));
      const testScen = generateScenario(n, k, scenario.tightness, 777);
      const res = executeAllAlgorithms(testScen);

      nnPoints.push({ x: n, y: res['nn'].onTimePercentage });
      edfPoints.push({ x: n, y: res['edf'].onTimePercentage });
      insPoints.push({ x: n, y: res['ins'].onTimePercentage });
      ins2optPoints.push({ x: n, y: res['ins-2opt'].onTimePercentage });
      runtimePoints.push({ x: n, y: Math.max(0.1, res['ins-2opt'].executionTimeMs) });
    });

    return {
      onTimeSeries: [
        { id: 'ins2opt', name: 'INS + 2-opt', color: '#8b5cf6', data: ins2optPoints },
        { id: 'ins', name: 'Insertion (INS)', color: '#10b981', data: insPoints },
        { id: 'nn', name: 'Nearest Neighbour', color: '#3b82f6', data: nnPoints },
        { id: 'edf', name: 'Earliest Deadline', color: '#f59e0b', data: edfPoints },
      ],
      runtimeSeries: [
        { id: 'runtime', name: 'INS + 2-opt Runtime (ms)', color: '#8b5cf6', data: runtimePoints },
      ],
    };
  }, [scenario.tightness]);

  // Fleet size scaling: K = 1, 2, 3, 4, 5
  const fleetScalingData = useMemo(() => {
    const fleetSizes = [1, 2, 3, 4, 5];
    return fleetSizes.map((k) => {
      const testScen = generateScenario(scenario.customers.length, k, scenario.tightness, 888);
      const res = executeAllAlgorithms(testScen);
      return {
        label: `K = ${k}`,
        value: res['ins-2opt'].onTimePercentage,
        color: '#3b82f6',
        subtext: `Fleet Size ${k}: ${res['ins-2opt'].onTimeCount}/${scenario.customers.length} on time, Dist ${res['ins-2opt'].totalDistance}`,
      };
    });
  }, [scenario.customers.length, scenario.tightness]);

  // Deadline tightness sweep: 0.25, 0.35, 0.5, 0.75, 1.0
  const tightnessSweepSeries: LineSeries[] = useMemo(() => {
    const tightValues = [0.25, 0.35, 0.5, 0.75, 1.0];
    const ins2optPts: { x: number; y: number }[] = [];
    const edfPts: { x: number; y: number }[] = [];
    const nnPts: { x: number; y: number }[] = [];

    tightValues.forEach((t) => {
      const testScen = generateScenario(scenario.customers.length, scenario.fleetSize, t, 999);
      const res = executeAllAlgorithms(testScen);
      const xVal = Math.round(t * 100);
      ins2optPts.push({ x: xVal, y: res['ins-2opt'].onTimePercentage });
      edfPts.push({ x: xVal, y: res['edf'].onTimePercentage });
      nnPts.push({ x: xVal, y: res['nn'].onTimePercentage });
    });

    return [
      { id: 'ins2opt', name: 'INS + 2-opt', color: '#8b5cf6', data: ins2optPts },
      { id: 'edf', name: 'EDF', color: '#f59e0b', data: edfPts },
      { id: 'nn', name: 'NN', color: '#3b82f6', data: nnPts },
    ];
  }, [scenario.customers.length, scenario.fleetSize]);

  // Chart: Algorithm vs On-time %
  const algVsOnTimeData: BarItem[] = ALGORITHM_METADATA.map((meta) => {
    const r = currentResults[meta.id];
    return {
      label: meta.shortName,
      value: r.onTimePercentage,
      color: meta.color,
      subtext: `${r.onTimeCount}/${r.totalCustomers} on-time deliveries`,
    };
  });

  // Chart: Algorithm vs Total Distance
  const algVsDistanceData: BarItem[] = ALGORITHM_METADATA.map((meta) => {
    const r = currentResults[meta.id];
    return {
      label: meta.shortName,
      value: r.totalDistance,
      color: meta.color,
      subtext: `Total distance: ${r.totalDistance} units`,
    };
  });

  // Chart: INS vs INS + 2-opt comparison
  const insVsTwoOptData: BarItem[] = [
    {
      label: 'INS Dist',
      value: currentResults['ins'].totalDistance,
      color: '#10b981',
      subtext: `On-time: ${currentResults['ins'].onTimePercentage}%`,
    },
    {
      label: 'INS+2opt Dist',
      value: currentResults['ins-2opt'].totalDistance,
      color: '#8b5cf6',
      subtext: `On-time: ${currentResults['ins-2opt'].onTimePercentage}%`,
    },
    {
      label: 'INS OnTime %',
      value: currentResults['ins'].onTimePercentage,
      color: '#34d399',
      subtext: `${currentResults['ins'].onTimeCount}/${scenario.customers.length} on time`,
    },
    {
      label: '2opt OnTime %',
      value: currentResults['ins-2opt'].onTimePercentage,
      color: '#a78bfa',
      subtext: `${currentResults['ins-2opt'].onTimeCount}/${scenario.customers.length} on time`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg font-bold text-white m-0">Performance Analytics Suite</h2>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          High-dimensional sensitivity analysis across fleet capacity, deadline tightness, customer density, and local search refinements.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
          <div className="flex items-center justify-center text-slate-400 mb-1">
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <span className="text-[10px] text-slate-400 block uppercase">Customers</span>
          <span className="text-lg font-black text-white font-mono">{scenario.customers.length}</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
          <div className="flex items-center justify-center text-slate-400 mb-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-[10px] text-slate-400 block uppercase">On-Time</span>
          <span className="text-lg font-black text-emerald-400 font-mono">
            {ins2optResult.onTimeCount}
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
          <div className="flex items-center justify-center text-slate-400 mb-1">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <span className="text-[10px] text-slate-400 block uppercase">Late</span>
          <span className="text-lg font-black text-rose-400 font-mono">{ins2optResult.lateCount}</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
          <div className="flex items-center justify-center text-slate-400 mb-1">
            <Sparkles className="w-4 h-4 text-sky-400" />
          </div>
          <span className="text-[10px] text-slate-400 block uppercase">Success Rate</span>
          <span className="text-lg font-black text-sky-400 font-mono">
            {ins2optResult.onTimePercentage}%
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
          <div className="flex items-center justify-center text-slate-400 mb-1">
            <Route className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-[10px] text-slate-400 block uppercase">Distance</span>
          <span className="text-lg font-black text-amber-400 font-mono">
            {ins2optResult.totalDistance}
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
          <div className="flex items-center justify-center text-slate-400 mb-1">
            <Truck className="w-4 h-4 text-indigo-400" />
          </div>
          <span className="text-[10px] text-slate-400 block uppercase">Fleet Size</span>
          <span className="text-lg font-black text-indigo-400 font-mono">{scenario.fleetSize}</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
          <div className="flex items-center justify-center text-slate-400 mb-1">
            <Cpu className="w-4 h-4 text-purple-400" />
          </div>
          <span className="text-[10px] text-slate-400 block uppercase">Exec Time</span>
          <span className="text-lg font-black text-purple-400 font-mono">
            {ins2optResult.executionTimeMs}ms
          </span>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Algorithm vs On-Time % */}
        <BarChart
          title="1. Algorithm vs On-Time Delivery Success (%)"
          data={algVsOnTimeData}
          unit="%"
          maxValue={100}
        />

        {/* 2. Algorithm vs Total Distance */}
        <BarChart
          title="2. Algorithm vs Total Route Distance"
          data={algVsDistanceData}
          unit=" units"
        />

        {/* 3. Customer Count vs On-Time Performance */}
        <MultiLineChart
          title="3. Customer Count (N) vs On-Time Delivery (%)"
          series={customerCountSweep.onTimeSeries}
          xLabel="Customer Count (N)"
          yLabel="On-Time Delivery (%)"
          unit="%"
        />

        {/* 4. Customer Count vs Execution Time */}
        <MultiLineChart
          title="4. Customer Count (N) vs Algorithm Execution Time (ms)"
          series={customerCountSweep.runtimeSeries}
          xLabel="Customer Count (N)"
          yLabel="Runtime (ms)"
          unit=" ms"
        />

        {/* 5. Fleet Size vs On-Time Delivery */}
        <BarChart
          title="5. Fleet Size (K = 1..5) vs On-Time Delivery (%)"
          data={fleetScalingData}
          unit="%"
          maxValue={100}
        />

        {/* 6. Deadline Tightness vs Delivery Success */}
        <MultiLineChart
          title="6. Deadline Tightness (Slack %) vs Success Rate (%)"
          series={tightnessSweepSeries}
          xLabel="Tightness Slack Factor (%)"
          yLabel="On-Time Delivery (%)"
          unit="%"
        />

        {/* 7. INS vs INS + 2-opt */}
        <div className="md:col-span-2">
          <BarChart
            title="7. INS vs INS + 2-Opt: Distance Detour & Feasibility Comparison"
            data={insVsTwoOptData}
          />
        </div>
      </div>
    </div>
  );
};
