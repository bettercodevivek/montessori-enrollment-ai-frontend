import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: number;
  change?: number;
  maxValue?: number;
}

export const MetricCard = ({ label, value, change, maxValue }: MetricCardProps) => {
  const isPositive = (change ?? 0) >= 0;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between h-full transition-shadow hover:shadow-md">
      <div>
        <h3 className="text-slate-500 text-[11px] font-bold uppercase tracking-widest mb-3">
          {label}
        </h3>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-black text-slate-900 tracking-tighter">
            {value.toLocaleString()}
          </span>
          {maxValue && (
            <span className="text-xs font-bold text-slate-400">/ {maxValue}</span>
          )}
        </div>
      </div>

      {maxValue && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-tighter italic">
              {Math.round((value / maxValue) * 100)}% Consumed
            </span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Usage Limit</span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/50 p-[1px]">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                (value / maxValue) > 0.9 ? 'bg-rose-500' : (value / maxValue) > 0.7 ? 'bg-amber-500' : 'bg-blue-600'
              }`}
              style={{ width: `${Math.min(100, (value / maxValue) * 100)}%` }}
            />
          </div>
        </div>
      )}

      {change !== undefined && !maxValue && (
        <div className="mt-4 flex items-center gap-2">
          <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold leading-none ${isPositive
            ? 'bg-emerald-50 text-emerald-700'
            : 'bg-rose-50 text-rose-700'
            }`}>
            {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
            {Math.abs(change)}%
          </div>
          <span className="text-[10px] font-medium text-slate-400">vs last month</span>
        </div>
      )}
    </div>
  );
};
