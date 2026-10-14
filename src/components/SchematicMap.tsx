import React, { useRef, useEffect, useState } from 'react';
import { Customer, Depot, RouteResult, AlgorithmResult, Scenario } from '../types';
import { Info, Truck, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

export interface VehicleAnimationState {
  vehicleId: number;
  currentX: number;
  currentY: number;
  targetCustomerIndex: number;
  status: 'at-depot' | 'in-transit' | 'servicing' | 'returned';
  currentCustomerBeingServed?: number;
}

interface SchematicMapProps {
  scenario: Scenario;
  algorithmResult: AlgorithmResult | null;
  currentTime: number;
  selectedCustomer: Customer | null;
  onSelectCustomer: (cust: Customer | null) => void;
  showAllRoutes?: boolean;
  highlightVehicleId?: number | null;
}

export const SchematicMap: React.FC<SchematicMapProps> = ({
  scenario,
  algorithmResult,
  currentTime,
  selectedCustomer,
  onSelectCustomer,
  showAllRoutes = true,
  highlightVehicleId = null,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 700, height: 520 });

  // Update dimensions on resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: Math.max(400, rect.width),
          height: Math.max(380, Math.min(640, rect.width * 0.72)),
        });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const { width, height } = dimensions;
  const padding = 45;

  // Coordinate mapping from 0..100 domain to SVG pixel space
  const mapX = (x: number) => padding + (x / 100) * (width - 2 * padding);
  const mapY = (y: number) => height - padding - (y / 100) * (height - 2 * padding); // Invert Y for cartesian

  // Compute status for each customer based on simulation currentTime
  const customerStatusMap = new Map<
    number,
    {
      status: 'pending' | 'servicing' | 'on-time' | 'late';
      vehicleId?: number;
      arrivalTime?: number;
      departureTime?: number;
      deadline: number;
    }
  >();

  // Initialize with deadlines
  scenario.customers.forEach((c) => {
    customerStatusMap.set(c.id, {
      status: 'pending',
      deadline: c.deadline,
    });
  });

  // Calculate live vehicle positions and customer delivery states from algorithm result
  const vehicleStates: VehicleAnimationState[] = [];

  if (algorithmResult) {
    algorithmResult.routes.forEach((route) => {
      let vX = scenario.depot.x;
      let vY = scenario.depot.y;
      let vStatus: VehicleAnimationState['status'] = 'at-depot';
      let currentCustomerBeingServed: number | undefined;

      if (currentTime <= 0) {
        vX = scenario.depot.x;
        vY = scenario.depot.y;
        vStatus = 'at-depot';
      } else if (currentTime >= route.completionTime) {
        vX = scenario.depot.x;
        vY = scenario.depot.y;
        vStatus = 'returned';
        // Mark all customer stops
        route.stops.forEach((stop) => {
          customerStatusMap.set(stop.customerId, {
            status: stop.isOnTime ? 'on-time' : 'late',
            vehicleId: route.vehicleId,
            arrivalTime: stop.arrivalTime,
            departureTime: stop.departureTime,
            deadline: stop.deadline,
          });
        });
      } else {
        // Vehicle is en route
        let prevX = scenario.depot.x;
        let prevY = scenario.depot.y;
        let prevDeptTime = 0;

        for (let sIdx = 0; sIdx < route.stops.length; sIdx++) {
          const stop = route.stops[sIdx];
          const cust = scenario.customers.find((c) => c.id === stop.customerId);
          if (!cust) continue;

          if (currentTime < stop.arrivalTime) {
            // Vehicle is in-transit from prev to this stop
            const legDuration = stop.arrivalTime - prevDeptTime;
            const progress = legDuration > 0 ? (currentTime - prevDeptTime) / legDuration : 1;
            const clampedProgress = Math.max(0, Math.min(1, progress));
            vX = prevX + (cust.x - prevX) * clampedProgress;
            vY = prevY + (cust.y - prevY) * clampedProgress;
            vStatus = 'in-transit';
            break;
          } else if (currentTime <= stop.departureTime) {
            // Vehicle is servicing at this stop
            vX = cust.x;
            vY = cust.y;
            vStatus = 'servicing';
            currentCustomerBeingServed = cust.id;
            customerStatusMap.set(cust.id, {
              status: stop.isOnTime ? 'on-time' : 'late',
              vehicleId: route.vehicleId,
              arrivalTime: stop.arrivalTime,
              departureTime: stop.departureTime,
              deadline: stop.deadline,
            });
            break;
          } else {
            // Completed this stop in the past
            customerStatusMap.set(cust.id, {
              status: stop.isOnTime ? 'on-time' : 'late',
              vehicleId: route.vehicleId,
              arrivalTime: stop.arrivalTime,
              departureTime: stop.departureTime,
              deadline: stop.deadline,
            });
            prevX = cust.x;
            prevY = cust.y;
            prevDeptTime = stop.departureTime;
          }

          // Check if transit back to depot after last stop
          if (sIdx === route.stops.length - 1 && currentTime > stop.departureTime) {
            const returnDuration = route.completionTime - stop.departureTime;
            const progress =
              returnDuration > 0 ? (currentTime - stop.departureTime) / returnDuration : 1;
            const clampedProgress = Math.max(0, Math.min(1, progress));
            vX = prevX + (scenario.depot.x - prevX) * clampedProgress;
            vY = prevY + (scenario.depot.y - prevY) * clampedProgress;
            vStatus = 'in-transit';
          }
        }
      }

      vehicleStates.push({
        vehicleId: route.vehicleId,
        currentX: vX,
        currentY: vY,
        targetCustomerIndex: 0,
        status: vStatus,
        currentCustomerBeingServed,
      });
    });
  }

  return (
    <div className="relative w-full schematic-map-wrapper bg-slate-950/80 rounded-xl border border-slate-800 p-3 select-none">
      {/* Map Header Banner */}
      <div className="flex justify-between items-center mb-2 px-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
          <span className="font-semibold text-slate-200 uppercase tracking-wider">
            Schematic Coordinate Map
          </span>
          <span className="text-slate-400">
            (Euclidean Metric · 1 unit = 1 min transit · 2 min service)
          </span>
        </div>
        <div className="flex items-center gap-4 text-slate-300">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-slate-600 inline-block" />
            <span>Unvisited</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
            <span>On-Time</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
            <span>Late</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-amber-400 rotate-45 inline-block" />
            <span className="font-medium text-amber-300">Depot (50, 50)</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas Map */}
      <div ref={containerRef} className="w-full relative overflow-hidden rounded-lg bg-[#080d1a]">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto cursor-crosshair"
          onClick={() => onSelectCustomer(null)}
        >
          {/* Subtle Grid System */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.8" opacity="0.4" />
            </pattern>
            {/* Markers for routes */}
            {algorithmResult?.routes.map((r) => (
              <marker
                key={`arrow-${r.vehicleId}`}
                id={`arrow-${r.vehicleId}`}
                viewBox="0 0 10 10"
                refX="6"
                refY="5"
                markerWidth="4"
                markerHeight="4"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 8 5 L 0 9 z" fill={r.vehicleColor} opacity="0.8" />
              </marker>
            ))}
          </defs>

          <rect width={width} height={height} fill="url(#grid)" />

          {/* Coordinate Axes Borders */}
          <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#334155" strokeWidth="1" />
          <line
            x1={padding}
            y1={height - padding}
            x2={width - padding}
            y2={height - padding}
            stroke="#334155"
            strokeWidth="1"
          />

          {/* Axis Markings */}
          {[0, 25, 50, 75, 100].map((tick) => (
            <g key={`x-tick-${tick}`}>
              <line
                x1={mapX(tick)}
                y1={height - padding}
                x2={mapX(tick)}
                y2={height - padding + 5}
                stroke="#475569"
              />
              <text x={mapX(tick)} y={height - padding + 16} fill="#64748b" fontSize="9" textAnchor="middle">
                {tick}
              </text>
            </g>
          ))}
          {[0, 25, 50, 75, 100].map((tick) => (
            <g key={`y-tick-${tick}`}>
              <line x1={padding - 5} y1={mapY(tick)} x2={padding} y2={mapY(tick)} stroke="#475569" />
              <text x={padding - 8} y={mapY(tick) + 3} fill="#64748b" fontSize="9" textAnchor="end">
                {tick}
              </text>
            </g>
          ))}

          {/* Route Paths */}
          {showAllRoutes &&
            algorithmResult?.routes.map((route) => {
              if (highlightVehicleId && highlightVehicleId !== route.vehicleId) return null;
              if (route.fullPath.length <= 1) return null;

              const pathString = route.fullPath
                .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${mapX(pt.x)} ${mapY(pt.y)}`)
                .join(' ');

              return (
                <g key={`route-${route.vehicleId}`}>
                  {/* Subtle outer glow */}
                  <path
                    d={pathString}
                    fill="none"
                    stroke={route.vehicleColor}
                    strokeWidth="4"
                    opacity="0.25"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Main Route Line */}
                  <path
                    d={pathString}
                    fill="none"
                    stroke={route.vehicleColor}
                    strokeWidth="2"
                    strokeDasharray="4 3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.85"
                  />
                </g>
              );
            })}

          {/* Customer Nodes */}
          {scenario.customers.map((cust) => {
            const statusInfo = customerStatusMap.get(cust.id);
            const isSelected = selectedCustomer?.id === cust.id;
            const cx = mapX(cust.x);
            const cy = mapY(cust.y);

            let nodeColor = '#64748b'; // pending
            if (statusInfo?.status === 'on-time') nodeColor = '#10b981';
            else if (statusInfo?.status === 'late') nodeColor = '#ef4444';

            const isServicingNow = vehicleStates.some((v) => v.currentCustomerBeingServed === cust.id);

            return (
              <g
                key={`cust-${cust.id}`}
                className="cursor-pointer transition-transform duration-150"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectCustomer(cust);
                }}
              >
                {/* Servicing ripple effect */}
                {isServicingNow && (
                  <circle cx={cx} cy={cy} r="18" fill="none" stroke="#f59e0b" strokeWidth="2" opacity="0.7">
                    <animate attributeName="r" values="10;24" dur="1.2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.9;0" dur="1.2s" repeatCount="indefinite" />
                  </circle>
                )}

                {/* Selection ring */}
                {isSelected && (
                  <circle cx={cx} cy={cy} r="16" fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeDasharray="3 3" />
                )}

                {/* Customer Circle */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={scenario.customers.length > 50 ? 7 : 9}
                  fill={nodeColor}
                  stroke="#0f172a"
                  strokeWidth="2"
                />

                {/* Customer ID Label */}
                <text
                  x={cx}
                  y={cy + 3}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize={scenario.customers.length > 50 ? '8' : '9'}
                  fontWeight="600"
                  pointerEvents="none"
                >
                  {cust.id}
                </text>

                {/* Small Deadline Badge (shown for smaller customer sets) */}
                {scenario.customers.length <= 25 && (
                  <text
                    x={cx}
                    y={cy - 12}
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="8"
                    className="font-mono"
                    pointerEvents="none"
                  >
                    ⏱{cust.deadline.toFixed(0)}m
                  </text>
                )}
              </g>
            );
          })}

          {/* Central Depot (50, 50) */}
          <g transform={`translate(${mapX(scenario.depot.x)}, ${mapY(scenario.depot.y)})`}>
            {/* Diamond marker */}
            <rect
              x="-9"
              y="-9"
              width="18"
              height="18"
              transform="rotate(45)"
              fill="#f59e0b"
              stroke="#ffffff"
              strokeWidth="2.5"
            />
            <text x="0" y="3.5" textAnchor="middle" fill="#000000" fontSize="9" fontWeight="800">
              D
            </text>
            <text x="0" y="-14" textAnchor="middle" fill="#fcd34d" fontSize="9" fontWeight="600">
              DEPOT
            </text>
          </g>

          {/* Vehicles Real-time Positions */}
          {vehicleStates.map((v) => {
            const color =
              algorithmResult?.routes.find((r) => r.vehicleId === v.vehicleId)?.vehicleColor || '#3b82f6';
            const vx = mapX(v.currentX);
            const vy = mapY(v.currentY);

            return (
              <g key={`veh-${v.vehicleId}`} transform={`translate(${vx}, ${vy})`} className="pointer-events-none">
                {/* Vehicle radar glow */}
                <circle cx="0" cy="0" r="14" fill={color} opacity="0.25" />
                <circle cx="0" cy="0" r="8" fill={color} stroke="#ffffff" strokeWidth="2" />
                <text x="0" y="3" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold">
                  V{v.vehicleId}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Floating Simulation Metrics Overlay */}
        <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur border border-slate-700/80 px-3 py-2 rounded-lg text-xs flex items-center gap-4 text-slate-200">
          <div className="flex items-center gap-1.5 font-mono">
            <Clock className="w-4 h-4 text-blue-400" />
            <span className="text-slate-400">Clock:</span>
            <span className="font-bold text-white text-sm">{currentTime.toFixed(1)} min</span>
          </div>
          {algorithmResult && (
            <>
              <div className="border-l border-slate-700 pl-3">
                <span className="text-slate-400">On-Time: </span>
                <span className="font-semibold text-emerald-400">
                  {algorithmResult.onTimeCount} / {algorithmResult.totalCustomers} ({algorithmResult.onTimePercentage}%)
                </span>
              </div>
              <div className="border-l border-slate-700 pl-3">
                <span className="text-slate-400">Total Dist: </span>
                <span className="font-semibold text-sky-300">{algorithmResult.totalDistance}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
