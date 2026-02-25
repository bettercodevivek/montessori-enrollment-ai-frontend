import type { Metric } from '../types';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  metric: Metric;
}

export const MetricCard = ({ metric }: MetricCardProps) => {
  const isPositive = (metric.change ?? 0) >= 0;

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100/50 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 mb-1">{metric.label}</p>
          <p className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mt-2">
            {metric.value.toLocaleString()}
          </p>
        </div>
        {metric.change !== undefined && (
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${
            isPositive 
              ? 'bg-green-50 text-green-700' 
              : 'bg-red-50 text-red-700'
          }`}>
            {isPositive ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span className="text-sm font-semibold">{Math.abs(metric.change)}%</span>
          </div>
        )}
      </div>
    </div>
  );
};

