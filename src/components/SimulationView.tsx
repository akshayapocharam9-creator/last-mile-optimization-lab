import React, { useState, useEffect, useRef } from 'react';
import { Customer, Scenario, AlgorithmResult } from '../types';
import { SchematicMap } from './SchematicMap';
import { CustomerDetailModal } from './CustomerDetailModal';
import { generateScenario, PRESET_5_CUSTOMER } from '../algorithms/generator';
import { executeAlgorithm, ALGORITHM_METADATA, AlgorithmType } from '../algorithms/runner';
import {
  Play,
  Pause,
  RotateCcw,
  StepForward,
  Settings,
  Sparkles,
  Truck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Gauge,
  Sliders,
  Check,
} from 'lucide-react';

interface SimulationViewProps {
  scenario: Scenario;
  onUpdateScenario: (newScenario: Scenario) => void;
  selectedAlgorithm: AlgorithmType;
  onSelectAlgorithm: (alg: AlgorithmType) => void;
}

export const SimulationView: React.FC<SimulationViewProps> = ({
  scenario,
  onUpdateScenario,
  selectedAlgorithm,
  onSelectAlgorithm,
}) => {
  // Simulation player states
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [simTime, setSimTime] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(2.0); // 1x, 2x, 5x
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Configuration form states
  const [custCount, setCustCount] = useState<number>(scenario.customers.length);
  const [fleetSize, setFleetSize] = useState<number>(scenario.fleetSize);
  const [tightness, setTightness] = useState<number>(scenario.tightness);
  const [seed, setSeed] = useState<number>(scenario.seed);

  // Computed algorithm result
  const [result, setResult] = useState<AlgorithmResult | null>(null);

  // Animation frame loop
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());

  // Re-run algorithm whenever scenario or selected algorithm changes
  useEffect(() => {
    const res = executeAlgorithm(selectedAlgorithm, scenario);
    setResult(res);
    setSimTime(0);
    setIsPlaying(false);
  }, [scenario, selectedAlgorithm]);

  // Max completion time across all vehicles in route
  const maxRouteTime = result ? result.totalCompletionTime : 100;

  useEffect(() => {
    if (!isPlaying) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    lastTimeRef.current = performance.now();

    const loop = (now: number) => {
      const dt = (now - lastTimeRef.current) / 1000; // in seconds
      lastTimeRef.current = now;

      setSimTime((prev) => {
        // Increment sim minutes: 1 real second = playbackSpeed simulated minutes
        const nextTime = prev + dt * playbackSpeed * 2.5;
        if (nextTime >= maxRouteTime) {
          setIsPlaying(false);
          return maxRouteTime;
        }
        return nextTime;
      });

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, playbackSpeed, maxRouteTime]);

  const handleApplyConfig = (newCount: number, newFleet: number, newTight: number, newSeed: number) => {
    const updated = generateScenario(newCount, newFleet, newTight, newSeed);
    onUpdateScenario(updated);
  };

  const handleStepForward = () => {
    setIsPlaying(false);
    setSimTime((prev) => Math.min(maxRouteTime, prev + 2.0));
  };

  const handleReset = () => {
    setIsPlaying(false);
    setSimTime(0);
  };

  const handleLoadPreset5 = () => {
    onUpdateScenario(PRESET_5_CUSTOMER);
    setCustCount(5);
    setFleetSize(1);
    setTightness(0.35);
    setSeed(42);
  };

  // Compute live deliveries at current simTime
  let liveDeliveredCount = 0;
  let liveOnTimeCount = 0;
  let liveLateCount = 0;

  if (result) {
    result.routes.forEach((r) => {
      r.stops.forEach((s) => {
        if (simTime >= s.departureTime) {
          liveDeliveredCount++;
          if (s.isOnTime) liveOnTimeCount++;
          else liveLateCount++;
        }
      });
    });
  }

  const livePercent =
    liveDeliveredCount > 0 ? ((liveOnTimeCount / liveDeliveredCount) * 100).toFixed(0) : '100';

  return (
    <div className="space-y-6">
      {/* Simulation Control Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg flex flex-wrap items-center justify-between gap-4">
        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          {!isPlaying ? (
            <button
              onClick={() => {
                if (simTime >= maxRouteTime) setSimTime(0);
                setIsPlaying(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow-md shadow-blue-600/30 transition"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{simTime > 0 && simTime < maxRouteTime ? 'Resume' : 'Start Simulation'}</span>
            </button>
          ) : (
            <button
              onClick={() => setIsPlaying(false)}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-lg shadow-md shadow-amber-600/30 transition"
            >
              <Pause className="w-4 h-4 fill-white" />
              <span>Pause</span>
            </button>
          )}

          <button
            onClick={handleStepForward}
            title="Advance +2 minutes"
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium border border-slate-700 transition"
          >
            <StepForward className="w-4 h-4" />
          </button>

          <button
            onClick={handleReset}
            title="Reset Clock to T=0"
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium border border-slate-700 transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Time Scrubber Slider */}
          <div className="flex items-center gap-2 ml-4">
            <span className="text-xs text-slate-400 font-mono">T = {simTime.toFixed(1)}m</span>
            <input
              type="range"
              min={0}
              max={maxRouteTime || 100}
              step={0.5}
              value={simTime}
              onChange={(e) => {
                setIsPlaying(false);
                setSimTime(parseFloat(e.target.value));
              }}
              className="w-32 md:w-48 accent-blue-500 cursor-pointer"
            />
            <span className="text-xs text-slate-400 font-mono">{maxRouteTime.toFixed(1)}m</span>
          </div>
        </div>

        {/* Speed Selector */}
        <div className="flex items-center gap-2">
          <Gauge className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-400">Speed:</span>
          {[0.5, 1, 2, 5, 10].map((s) => (
            <button
              key={s}
              onClick={() => setPlaybackSpeed(s)}
              className={`px-2 py-1 rounded text-[11px] font-bold transition ${
                playbackSpeed === s
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* Main Simulation Layout: Map + Side Control / Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Schematic Canvas Map (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <SchematicMap
            scenario={scenario}
            algorithmResult={result}
            currentTime={simTime}
            selectedCustomer={selectedCustomer}
            onSelectCustomer={(c) => setSelectedCustomer(c)}
          />

          {/* Warning Banner if exact Held-Karp limit exceeded */}
          {result?.warning && (
            <div className="p-3 bg-amber-950/40 border border-amber-800/60 rounded-xl text-xs text-amber-300 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{result.warning}</span>
            </div>
          )}

          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs">
            <span className="text-slate-400 font-medium">Quick Benchmarks:</span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleLoadPreset5}
                className="px-3 py-1.5 bg-blue-950 border border-blue-700/60 text-blue-300 rounded-lg hover:bg-blue-900/60 transition font-semibold"
              >
                ★ Load PPT 5-Customer Preset (N=5, K=1)
              </button>
              <button
                onClick={() => handleApplyConfig(20, 2, 0.35, 101)}
                className="px-3 py-1.5 bg-slate-800 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-700 transition"
              >
                Scalability Demo (N=20, K=2)
              </button>
              <button
                onClick={() => handleApplyConfig(50, 4, 0.35, 202)}
                className="px-3 py-1.5 bg-slate-800 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-700 transition"
              >
                Fleet Scale (N=50, K=4)
              </button>
            </div>
          </div>
        </div>

        {/* Configuration & Telemetry Sidebar (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Active Algorithm Picker */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Active Algorithm
              </h3>
              <span className="text-[10px] font-mono text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/50">
                {result?.theoreticalComplexity}
              </span>
            </div>

            <div className="space-y-1.5">
              {ALGORITHM_METADATA.map((alg) => {
                const isSelected = selectedAlgorithm === alg.id;
                return (
                  <button
                    key={alg.id}
                    onClick={() => onSelectAlgorithm(alg.id)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-left transition ${
                      isSelected
                        ? 'bg-blue-600/15 border-blue-500 text-white font-semibold'
                        : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-full inline-block"
                          style={{ backgroundColor: alg.color }}
                        />
                        {alg.name}
                      </div>
                      <div className="text-[10px] text-slate-400">{alg.badge}</div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-blue-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Scenario Generator Controls */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-400" /> Scenario Parameters
            </h3>

            {/* Customer Count: 5, 10, 20, 50, 100 */}
            <div>
              <label className="text-xs text-slate-400 flex justify-between mb-1">
                <span>Customer Count (N)</span>
                <span className="font-mono text-white font-bold">{custCount}</span>
              </label>
              <div className="grid grid-cols-5 gap-1">
                {[5, 10, 20, 50, 100].map((n) => (
                  <button
                    key={n}
                    onClick={() => {
                      setCustCount(n);
                      handleApplyConfig(n, fleetSize, tightness, seed);
                    }}
                    className={`py-1 text-xs rounded font-bold transition ${
                      custCount === n
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Fleet Size: 1 to 5 */}
            <div>
              <label className="text-xs text-slate-400 flex justify-between mb-1">
                <span>Vehicles (Fleet Size K)</span>
                <span className="font-mono text-white font-bold">{fleetSize}</span>
              </label>
              <div className="grid grid-cols-5 gap-1">
                {[1, 2, 3, 4, 5].map((k) => (
                  <button
                    key={k}
                    onClick={() => {
                      setFleetSize(k);
                      handleApplyConfig(custCount, k, tightness, seed);
                    }}
                    className={`py-1 text-xs rounded font-bold transition ${
                      fleetSize === k
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {k}
                  </button>
                ))}
              </div>
            </div>

            {/* Tightness Slider */}
            <div>
              <label className="text-xs text-slate-400 flex justify-between mb-1">
                <span>Deadline Tightness</span>
                <span className="font-mono text-amber-300 font-bold">
                  {tightness === 0.35 ? '0.35 (Reported)' : tightness.toFixed(2)}
                </span>
              </label>
              <input
                type="range"
                min={0.25}
                max={1.0}
                step={0.05}
                value={tightness}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setTightness(val);
                  handleApplyConfig(custCount, fleetSize, val, seed);
                }}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            {/* Seed & Regenerate Button */}
            <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
              <input
                type="number"
                value={seed}
                onChange={(e) => setSeed(parseInt(e.target.value) || 1)}
                className="w-20 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white font-mono"
                title="Random Seed"
              />
              <button
                onClick={() => {
                  const newSeed = Math.floor(Math.random() * 9000) + 1000;
                  setSeed(newSeed);
                  handleApplyConfig(custCount, fleetSize, tightness, newSeed);
                }}
                className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded transition flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-400" /> New Random Seed
              </button>
            </div>
          </div>

          {/* Telemetry Live KPI Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Simulation Telemetry
            </h3>

            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block">On-Time Deliveries</span>
                <span className="text-base font-extrabold text-emerald-400 font-mono">
                  {liveOnTimeCount} / {scenario.customers.length}
                </span>
              </div>
              <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block">Late Deliveries</span>
                <span className="text-base font-extrabold text-rose-400 font-mono">
                  {liveLateCount}
                </span>
              </div>
              <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block">Delivery Success</span>
                <span className="text-base font-extrabold text-sky-400 font-mono">
                  {livePercent}%
                </span>
              </div>
              <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block">Route Distance</span>
                <span className="text-base font-extrabold text-amber-400 font-mono">
                  {result?.totalDistance}
                </span>
              </div>
            </div>

            <div className="p-2.5 bg-slate-950/50 rounded-lg text-xs text-slate-400 flex items-center justify-between">
              <span>Algorithm Compute Time:</span>
              <span className="font-mono text-purple-300 font-bold">
                {result?.executionTimeMs} ms
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Detail Inspector Modal */}
      <CustomerDetailModal
        customer={selectedCustomer}
        depot={scenario.depot}
        algorithmResult={result}
        currentTime={simTime}
        onClose={() => setSelectedCustomer(null)}
      />
    </div>
  );
};
