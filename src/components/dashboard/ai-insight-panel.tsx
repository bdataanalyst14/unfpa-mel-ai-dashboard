import { cn } from '@/lib/utils';
import { Brain, AlertTriangle, TrendingUp, Shield, MapPin, BarChart3, FileText } from 'lucide-react';
import type { AiInsight } from '@/lib/types';

const categoryIcons: Record<string, React.ElementType> = {
  'Risk': AlertTriangle,
  'Opportunity': TrendingUp,
  'Data Quality': Shield,
  'Geographic': MapPin,
  'Performance': BarChart3,
  'Compliance': FileText,
  'Narrative': FileText,
};

const severityColors: Record<string, string> = {
  high: 'border-l-red-500 bg-red-50/20',
  medium: 'border-l-amber-500 bg-amber-50/20',
  low: 'border-l-blue-400 bg-blue-50/20',
};

const iconColors: Record<string, string> = {
  high: 'text-red-500',
  medium: 'text-amber-500',
  low: 'text-blue-500',
};

export default function AIInsightPanel({ insights, className }: { insights: AiInsight[]; className?: string }) {
  return (
    <div className={cn('bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col', className)}>
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 rounded-lg bg-[#004B87]/10">
          <Brain className="h-4 w-4 text-[#004B87]" />
        </div>
        <h3 className="text-sm font-semibold text-gray-900">AI Executive Insights</h3>
      </div>
      <div className="space-y-3 overflow-y-auto max-h-[350px] pr-1 scrollbar-thin">
        {insights.map((insight) => {
          const Icon = categoryIcons[insight.category] || Brain;
          return (
            <div
              key={insight.id}
              className={cn('border-l-4 p-3 rounded-r-lg bg-gray-50/50 transition-all hover:bg-gray-50', severityColors[insight.severity])}
            >
              <div className="flex items-start gap-2.5">
                <Icon className={cn('h-4 w-4 mt-0.5 shrink-0', iconColors[insight.severity])} />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">{insight.title}</span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-gray-200/60 rounded text-gray-500 uppercase font-mono">{insight.category}</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{insight.description}</p>
                  <div className="bg-white/60 rounded p-1.5 border border-gray-100 mt-2">
                    <p className="text-[11px] text-[#004B87] font-semibold">Recommendation:</p>
                    <p className="text-[11px] text-gray-700 mt-0.5">{insight.recommendation}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
