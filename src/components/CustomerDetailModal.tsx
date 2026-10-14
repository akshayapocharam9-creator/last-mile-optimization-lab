import React from 'react';
import { Customer, AlgorithmResult, Depot } from '../types';
import { euclideanDistance } from '../algorithms/evaluator';
import { X, CheckCircle, AlertCircle, Clock, MapPin, Truck } from 'lucide-react';

interface CustomerDetailModalProps {
  customer: Customer | null;
  depot: Depot;
  algorithmResult: AlgorithmResult | null;
  currentTime: number;
  onClose: () => void;
}

export const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({
  customer,
  depot,
  algorithmResult,
  currentTime,
  onClose,
}) => {
  if (!customer) return null;

  // Find stop information from algorithmResult
  let assignedVehicleId: number | null = null;
  let vehicleColor: string = '#64748b';
  let arrivalTime: number | null = null;
  let completionTime: number | null = null;
  let isOnTime: boolean | null = null;
  let lateness: number = 0;

  if (algorithmResult) {
    for (const route of algorithmResult.routes) {
      const stop = route.stops.find((s) => s.customerId === customer.id);
      if (stop) {
        assignedVehicleId = route.vehicleId;
        vehicleColor = route.vehicleColor;
        arrivalTime = stop.arrivalTime;
        completionTime = stop.completionTime;
        isOnTime = stop.isOnTime;
        lateness = stop.lateness;
        break;
      }
    }
  }

  const distToDepot = euclideanDistance(depot, customer).toFixed(1);

  // Live status based on simulation clock
  let liveStatus = 'Pending (Vehicle En Route)';
  let statusBadgeColor = 'bg-slate-700 text-slate-300';

  if (arrivalTime !== null && completionTime !== null) {
    if (currentTime < arrivalTime) {
      liveStatus = 'In Transit / Pending';
      statusBadgeColor = 'bg-slate-700 text-slate-300';
    } else if (currentTime <= completionTime) {
      liveStatus = 'Currently Servicing (2 min stop)';
      statusBadgeColor = 'bg-amber-500/20 text-amber-300 border border-amber-500/40';
    } else {
      liveStatus = isOnTime ? 'Delivered On-Time' : 'Delivered Late';
      statusBadgeColor = isOnTime
        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
        : 'bg-rose-500/20 text-rose-300 border border-rose-500/40';
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold">
            #{customer.id}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Customer #{customer.id} Inspector</h3>
            <p className="text-xs text-slate-400">Node telemetry and delivery schedule metrics</p>
          </div>
        </div>

        <div className="mb-4">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${statusBadgeColor}`}>
            {isOnTime === true && <CheckCircle className="w-3.5 h-3.5" />}
            {isOnTime === false && <AlertCircle className="w-3.5 h-3.5" />}
            {liveStatus}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm bg-slate-950/60 p-4 rounded-lg border border-slate-800 mb-4">
          <div>
            <span className="text-xs text-slate-400 block">Coordinates (X, Y)</span>
            <span className="font-mono text-slate-200 font-medium">({customer.x}, {customer.y})</span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block">Depot Direct Dist</span>
            <span className="font-mono text-slate-200 font-medium">{distToDepot} units</span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block">Delivery Deadline</span>
            <span className="font-mono text-amber-300 font-semibold">{customer.deadline.toFixed(1)} min</span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block">Service Duration</span>
            <span className="font-mono text-slate-200 font-medium">2.0 minutes</span>
          </div>
          {arrivalTime !== null && (
            <>
              <div>
                <span className="text-xs text-slate-400 block">Arrival Time</span>
                <span className={`font-mono font-bold ${isOnTime ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {arrivalTime.toFixed(1)} min
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Service Departure</span>
                <span className="font-mono text-slate-200 font-medium">{completionTime?.toFixed(1)} min</span>
              </div>
            </>
          )}
          {assignedVehicleId !== null && (
            <div className="col-span-2 pt-2 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">Assigned Dispatch</span>
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-bold text-white"
                style={{ backgroundColor: vehicleColor }}
              >
                <Truck className="w-3.5 h-3.5" /> Vehicle #{assignedVehicleId}
              </span>
            </div>
          )}
          {lateness > 0 && (
            <div className="col-span-2 bg-rose-950/40 border border-rose-800/60 p-2 rounded text-xs text-rose-300">
              ⚠️ Deadline breached by <strong>+{lateness.toFixed(1)} minutes</strong>.
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm font-medium transition"
        >
          Close Inspector
        </button>
      </div>
    </div>
  );
};
