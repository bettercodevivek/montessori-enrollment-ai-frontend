import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: number;
  change?: number;
}

export const MetricCard = ({ label, value, change }: MetricCardProps) => {
  const isPositive = (change ?? 0) >= 0;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between h-full transition-shadow hover:shadow-md">
      <div>
        <h3 className="text-slate-500 text-sm font-medium mb-2">
          {label}
        </h3>
        <span className="text-2xl font-bold text-slate-900">
          {value.toLocaleString()}
        </span>
      </div>

      {change !== undefined && (
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
