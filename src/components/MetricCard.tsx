import { ArrowUpRight, ArrowDownRight, PhoneCall, Calendar, Activity, Clock, AlertTriangle, type LucideIcon } from 'lucide-react';

const Icons: Record<string, LucideIcon> = {
  PhoneCall,
  Calendar,
  Activity,
  Clock,
  AlertTriangle,
};

interface MetricCardProps {
  label: string;
  value: string | number;
  change?: number;
  maxValue?: number;
  icon?: string;
  ticker?: boolean;
}

export const MetricCard = ({ label, value, change, maxValue, icon, ticker }: MetricCardProps) => {
  const isPositive = (change ?? 0) >= 0;
  const Icon = icon ? Icons[icon] : null;

  return (
    <div className={`bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col justify-between h-full transition-all hover:border-slate-300 hover:shadow-md group`}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{label}</span>
          {Icon && (
            <div className="p-2 rounded-xl bg-slate-50 text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition-colors">
              <Icon className="w-3.5 h-3.5" />
            </div>
          )}
        </div>
        
        <div className="flex flex-col gap-1">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </span>
            {maxValue && (
              <span className="text-sm font-semibold text-slate-300">/ {maxValue}</span>
            )}
          </div>
          
          {ticker && !maxValue && (
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500/50" />
              <span className="text-[9px] font-bold text-blue-500/80 uppercase tracking-tighter">Cumulative Total</span>
            </div>
          )}
        </div>
      </div>

      {maxValue && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Usage</span>
            <span className="text-[10px] font-bold text-blue-600 tabular-nums">
              {Math.round(((typeof value === 'number' ? value : 0) / maxValue) * 100)}%
            </span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                ((typeof value === 'number' ? value : 0) / maxValue) > 0.9 ? 'bg-rose-500' : ((typeof value === 'number' ? value : 0) / maxValue) > 0.7 ? 'bg-amber-500' : 'bg-blue-600'
              }`}
              style={{ width: `${Math.min(100, ((typeof value === 'number' ? value : 0) / maxValue) * 100)}%` }}
            />
          </div>
        </div>
      )}

      {change !== undefined && !maxValue && !ticker && (
        <div className="mt-6 flex items-center gap-2">
          <div className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold tabular-nums ${isPositive
            ? 'bg-emerald-50 text-emerald-600'
            : 'bg-rose-50 text-rose-600'
            }`}>
            {isPositive ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
            {Math.abs(change)}%
          </div>
          <span className="text-[9px] font-semibold text-slate-300 uppercase">Period Change</span>
        </div>
      )}
    </div>
  );
};
