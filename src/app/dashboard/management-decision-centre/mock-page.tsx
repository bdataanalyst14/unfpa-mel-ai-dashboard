'use client';
import PageHeader from '@/components/layout/page-header';
import AIInsightPanel from '@/components/dashboard/ai-insight-panel';
import ManagementActionTable from '@/components/dashboard/management-action-table';
import DataSourceStatusPanel from '@/components/dashboard/data-source-status-panel';

import { aiInsights } from '@/data/mock/ai-insights';
import { cpdIndicators } from '@/data/mock/cpd-indicators';
import { FileText, TrendingDown, Target, Building } from 'lucide-react';

export default function ManagementDecisionCentrePage() {
  const highSeverityInsights = aiInsights.filter(i => i.severity === 'high');
  const otherInsights = aiInsights.filter(i => i.severity !== 'high');

  // Off-track indicators lists
  const offTrackIndicators = cpdIndicators.filter(i => i.status === 'Off Track');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Management Decision Centre"
        subtitle="AI-assisted prototype view using demo samples; pending final M&E validation and not donor-ready evidence."
      />

      <DataSourceStatusPanel route="management-decision-centre" />

      {/* Main Grid: Insights & Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: High Severity Risks & Suggested Actions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingDown className="h-5 w-5 text-red-500" />
              <h3 className="text-sm font-semibold text-gray-900">Critical Action Items (High Severity)</h3>
            </div>

            <div className="space-y-4">
              {highSeverityInsights.map((insight) => (
                <div key={insight.id} className="p-4 rounded-lg bg-red-50/30 border border-red-100/50">
                  <div className="flex items-start justify-between flex-wrap gap-2">
                    <span className="text-sm font-semibold text-gray-900">{insight.title}</span>
                    <span className="text-[10px] px-2 py-0.5 bg-red-100 text-red-700 font-bold uppercase rounded">Critical</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">{insight.description}</p>        
                  <div className="mt-3 bg-white p-2.5 rounded border border-red-200/40">     
                    <p className="text-xs text-[#004B87] font-semibold">Recommended Intervention:</p>
                    <p className="text-xs text-gray-700 mt-1">{insight.recommendation}</p>   
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Points Checklist */}
          <ManagementActionTable />
        </div>

        {/* Right Side: AI Panel & Donor Narrative Draft */}
        <div className="space-y-6">
          <AIInsightPanel insights={otherInsights} />

          {/* Donor Narrative draft generator box */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-5 w-5 text-[#FF6600]" />
              <h3 className="text-sm font-semibold text-gray-900">Illustrative Donor Narrative Draft (prototype)</h3>
            </div>
            <p className="text-xs text-gray-500 leading-normal mb-4">
              Illustrative text synthesized from demo Q2 samples. Pending final M&E validation; not for donor or official programme sign-off.
            </p>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200/50 max-h-[220px] overflow-y-auto font-serif text-[11px] text-gray-700 leading-relaxed scrollbar-thin">       
              <p className="font-bold mb-1 text-gray-900">UNFPA Nepal Country Office â€“ Q2 2025 Progress Summary</p>
              <p className="mb-2">
                Under CPD Output 1 (SRHR), cumulative activity progress stands at 82%, driven primarily by accelerated deployment of midwives (93.3% of annual target achieved). EmONC capacity building workshops reached 165 functional health facilities, demonstrating high operational performance across 47 active districts.
              </p>
              <p className="mb-2">
                Demo sample for Output 3 (GEWE) illustrates multi-sectoral support and OCMC referral pathway risks. Values are placeholders pending privacy clearance, suppression QA, and programme validation; corrective actions are shown only for Q3 planning rehearsal.
              </p>
            </div>
            <button className="w-full mt-4 py-2 bg-[#004B87] hover:bg-[#003B6B] text-white font-semibold rounded-lg text-xs transition-colors flex items-center justify-center gap-1">    
              <span>Copy Narrative Draft</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Off-track list & IP status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Off Track Indicators list */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-5 w-5 text-red-500" />
            <h3 className="text-sm font-semibold text-gray-900">Off-Track CPD Targets needing review</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-mono tracking-wider border-b border-gray-100">
                <tr>
                  <th className="px-4 py-2">Code</th>
                  <th className="px-4 py-2">Target Indicator</th>
                  <th className="px-4 py-2 text-right">Target</th>
                  <th className="px-4 py-2 text-right">Actual</th>
                  <th className="px-4 py-2 text-right">Achievement %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {offTrackIndicators.map((ind) => (
                  <tr key={ind.id} className="hover:bg-gray-50/50 transition-colors">        
                    <td className="px-4 py-2.5 font-mono text-xs text-gray-950 font-semibold">{ind.code}</td>
                    <td className="px-4 py-2.5 text-xs">{ind.description}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-gray-500">{ind.target}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-gray-950 font-semibold">{ind.actual}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-red-600 font-bold">{ind.achievementPct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* IP attention metrics */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-3">
            <Building className="h-5 w-5 text-red-500" />
            <h3 className="text-sm font-semibold text-gray-900">IPs requiring M&amp;E guidance</h3>
          </div>
          <p className="text-xs text-gray-500 leading-normal mb-4">
            Implementing partners with high compliance risk or late reports exceeding 3. Let&apos;s monitor these.
          </p>
          <div className="space-y-3">
            <div className="p-3 bg-red-50/20 border border-red-100 rounded-lg flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-900">WOREC</span>
              <span className="text-xs text-red-600 font-semibold">4 Late submissions</span> 
            </div>
            <div className="p-3 bg-amber-50/20 border border-amber-100 rounded-lg flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-900">FPAN</span>
              <span className="text-xs text-amber-600 font-semibold">23 Missing evidence</span>
            </div>
            <div className="p-3 bg-amber-50/20 border border-amber-100 rounded-lg flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-900">Restless Development</span>
              <span className="text-xs text-amber-600 font-semibold">2 Late submissions</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



