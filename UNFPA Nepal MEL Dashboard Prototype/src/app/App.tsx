import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { ChevronDown, Bell, Settings, User, AlertTriangle, CheckCircle2, AlertCircle, Clock, MapPin, Users, FileText, TrendingUp, BarChart3, Activity, Target, Building2, Map, Shield, Database, Brain } from 'lucide-react';

const programmeData = [
  { name: 'SRHR Youth', progress: 78, color: '#2196F3' },
  { name: 'GBV Prevention', progress: 85, color: '#2196F3' },
  { name: 'Humanitarian Response', progress: 62, color: '#2196F3' },
  { name: 'Population Data', progress: 91, color: '#2196F3' },
  { name: 'Capacity Building', progress: 74, color: '#2196F3' },
];

const indicatorStatusData = [
  { name: 'Achieved', value: 24, color: '#4CAF50' },
  { name: 'On Track', value: 38, color: '#4CAF50' },
  { name: 'Watch', value: 12, color: '#FFA726' },
  { name: 'Off Track', value: 8, color: '#EF5350' },
  { name: 'No Data', value: 6, color: '#9E9E9E' },
];

const participantData = [
  { category: '10-14', female: 3420, male: 2890 },
  { category: '15-19', female: 5670, male: 4320 },
  { category: '20-24', female: 4230, male: 3560 },
  { category: '25-29', female: 2890, male: 2340 },
  { category: '30+', female: 1780, male: 1450 },
];

const ipAttentionData = [
  { ip: 'WOREC Nepal', issues: 8, type: 'Data Quality', severity: 'high' },
  { ip: 'FPAN', issues: 6, type: 'Missing Reports', severity: 'high' },
  { ip: 'SAATHI', issues: 5, type: 'Indicator Delays', severity: 'medium' },
  { ip: 'CAHURAST', issues: 4, type: 'Evidence Gap', severity: 'medium' },
  { ip: 'YUWALAYA', issues: 3, type: 'Geographic Coverage', severity: 'low' },
];

const dataQualityAlerts = [
  { issue: 'Duplicate participant records detected', ip: 'FPAN', severity: 'High', records: 47, action: 'Review & Merge' },
  { issue: 'Missing baseline data for Q2 indicators', ip: 'SAATHI', severity: 'High', records: 12, action: 'Data Request Sent' },
  { issue: 'Age disaggregation incomplete', ip: 'WOREC Nepal', severity: 'Medium', records: 156, action: 'Follow-up Required' },
  { issue: 'Event dates outside reporting period', ip: 'CAHURAST', severity: 'Medium', records: 23, action: 'Verification Pending' },
  { issue: 'Missing geographic coordinates', ip: 'YUWALAYA', severity: 'Low', records: 89, action: 'Technical Support' },
];

export default function App() {
  const [selectedNav, setSelectedNav] = useState('Executive Overview');

  const navItems = [
    { icon: BarChart3, label: 'Executive Overview' },
    { icon: Activity, label: 'Activity Progress' },
    { icon: Users, label: 'Participant Reach' },
    { icon: Target, label: 'Indicator Progress' },
    { icon: Building2, label: 'IP Performance' },
    { icon: Map, label: 'Geographic Coverage' },
    { icon: Shield, label: 'GBV/OCMC Services' },
    { icon: Database, label: 'Data Quality' },
    { icon: Brain, label: 'Management Decision Centre' },
  ];

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-white">
      <aside className="w-64 bg-[#F5F5F5] border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#E95420] rounded flex items-center justify-center text-white font-bold">
              UN
            </div>
            <div className="text-sm leading-tight">
              <div className="font-semibold text-gray-900">UNFPA Nepal</div>
              <div className="text-gray-600">MEL Intelligence</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = selectedNav === item.label;
            return (
              <button
                key={item.label}
                onClick={() => setSelectedNav(item.label)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-sm transition-colors ${
                  isActive
                    ? 'bg-white text-[#E95420] shadow-sm'
                    : 'text-gray-700 hover:bg-white/50'
                }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <User size={16} className="text-gray-600" />
            </div>
            <div className="flex-1 text-sm">
              <div className="font-medium text-gray-900">Admin User</div>
              <div className="text-xs text-gray-600">Senior Manager</div>
            </div>
            <Settings size={16} className="text-gray-500" />
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-semibold text-gray-900">Executive Overview</h1>
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg relative">
                <Bell size={20} className="text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#E95420] rounded-full"></span>
              </button>
              <button className="px-4 py-2 bg-[#E95420] text-white rounded-lg text-sm font-medium hover:bg-[#D04A1A]">
                Export Report
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
              <option>Year: 2026</option>
              <option>Year: 2025</option>
            </select>
            <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
              <option>Quarter: Q2</option>
              <option>Quarter: Q1</option>
            </select>
            <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
              <option>Project: All Projects</option>
            </select>
            <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
              <option>IP/Partner: All Partners</option>
            </select>
            <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
              <option>Province: All Provinces</option>
            </select>
            <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
              <option>District: All Districts</option>
            </select>
            <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
              <option>Fund Code: All Funds</option>
            </select>
            <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
              <option>Event Type: All Events</option>
            </select>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="p-8">
            <div className="grid grid-cols-9 gap-4 mb-6">
              <div className="col-span-1 bg-white border border-gray-200 rounded-lg p-4">
                <div className="text-xs text-gray-600 mb-1">Total Events</div>
                <div className="text-2xl font-semibold text-gray-900">1,847</div>
                <div className="text-xs text-green-600 mt-1">↑ 12% vs Q1</div>
              </div>
              <div className="col-span-1 bg-white border border-gray-200 rounded-lg p-4">
                <div className="text-xs text-gray-600 mb-1">Reportable Participants</div>
                <div className="text-2xl font-semibold text-gray-900">28,340</div>
                <div className="text-xs text-green-600 mt-1">↑ 18% vs Q1</div>
              </div>
              <div className="col-span-1 bg-white border border-gray-200 rounded-lg p-4">
                <div className="text-xs text-gray-600 mb-1">Female Participants</div>
                <div className="text-2xl font-semibold text-gray-900">17,990</div>
                <div className="text-xs text-gray-600 mt-1">63.5%</div>
              </div>
              <div className="col-span-1 bg-white border border-gray-200 rounded-lg p-4">
                <div className="text-xs text-gray-600 mb-1">Male Participants</div>
                <div className="text-2xl font-semibold text-gray-900">10,350</div>
                <div className="text-xs text-gray-600 mt-1">36.5%</div>
              </div>
              <div className="col-span-1 bg-white border border-gray-200 rounded-lg p-4">
                <div className="text-xs text-gray-600 mb-1">Districts Covered</div>
                <div className="text-2xl font-semibold text-gray-900">58</div>
                <div className="text-xs text-gray-600 mt-1">of 77</div>
              </div>
              <div className="col-span-1 bg-white border border-gray-200 rounded-lg p-4">
                <div className="text-xs text-gray-600 mb-1">IPs Reporting</div>
                <div className="text-2xl font-semibold text-gray-900">42</div>
                <div className="text-xs text-green-600 mt-1">95% on time</div>
              </div>
              <div className="col-span-1 bg-white border border-gray-200 rounded-lg p-4">
                <div className="text-xs text-gray-600 mb-1">Indicators On Track</div>
                <div className="text-2xl font-semibold text-gray-900">62</div>
                <div className="text-xs text-gray-600 mt-1">of 88</div>
              </div>
              <div className="col-span-1 bg-white border border-gray-200 rounded-lg p-4">
                <div className="text-xs text-gray-600 mb-1">Missing Evidence</div>
                <div className="text-2xl font-semibold text-[#FFA726]">127</div>
                <div className="text-xs text-[#FFA726] mt-1">Needs follow-up</div>
              </div>
              <div className="col-span-1 bg-white border border-gray-200 rounded-lg p-4">
                <div className="text-xs text-gray-600 mb-1">Data Quality Score</div>
                <div className="text-2xl font-semibold text-green-600">87%</div>
                <div className="text-xs text-green-600 mt-1">↑ 3% vs Q1</div>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-8 space-y-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">Programme Progress by Project</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={programmeData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" domain={[0, 100]} />
                      <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar key="progress-bar" dataKey="progress" fill="#2196F3" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4">Indicator Status</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={indicatorStatusData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={70}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {indicatorStatusData.map((entry, index) => (
                            <Cell key={`indicator-cell-${entry.name}-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4">Participant Reach by Sex and Age</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={participantData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="category" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        <Bar key="female-bar" dataKey="female" fill="#E95420" name="Female" />
                        <Bar key="male-bar" dataKey="male" fill="#2196F3" name="Male" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">Geographic Coverage Map</h3>
                  <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                    <div className="text-center">
                      <MapPin size={48} className="text-gray-400 mx-auto mb-2" />
                      <div className="text-sm text-gray-600">Nepal District Coverage Map</div>
                      <div className="text-xs text-gray-500 mt-1">58 of 77 districts covered (75.3%)</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">Top 5 IPs Needing Attention</h3>
                  <div className="space-y-3">
                    {ipAttentionData.map((ip, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${
                            ip.severity === 'high' ? 'bg-[#EF5350]' :
                            ip.severity === 'medium' ? 'bg-[#FFA726]' : 'bg-[#9E9E9E]'
                          }`}></div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{ip.ip}</div>
                            <div className="text-xs text-gray-600">{ip.type}</div>
                          </div>
                        </div>
                        <div className="text-sm font-semibold text-gray-900">{ip.issues} issues</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">Data Quality Alert Table</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-2 font-semibold text-gray-700">Issue</th>
                          <th className="text-left py-3 px-2 font-semibold text-gray-700">IP</th>
                          <th className="text-left py-3 px-2 font-semibold text-gray-700">Severity</th>
                          <th className="text-right py-3 px-2 font-semibold text-gray-700">Records</th>
                          <th className="text-left py-3 px-2 font-semibold text-gray-700">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dataQualityAlerts.map((alert, idx) => (
                          <tr key={idx} className="border-b border-gray-100">
                            <td className="py-3 px-2 text-gray-900">{alert.issue}</td>
                            <td className="py-3 px-2 text-gray-700">{alert.ip}</td>
                            <td className="py-3 px-2">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                alert.severity === 'High' ? 'bg-red-100 text-red-700' :
                                alert.severity === 'Medium' ? 'bg-orange-100 text-orange-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {alert.severity}
                              </span>
                            </td>
                            <td className="py-3 px-2 text-right text-gray-900">{alert.records}</td>
                            <td className="py-3 px-2 text-gray-700">{alert.action}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="col-span-4">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 sticky top-0">
                  <div className="flex items-center gap-2 mb-4">
                    <Brain size={20} className="text-[#E95420]" />
                    <h3 className="text-sm font-semibold text-gray-900">AI Executive Summary</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-white/80 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-xs font-semibold text-gray-900 mb-1">Key Progress This Quarter</div>
                          <div className="text-xs text-gray-700">GBV Prevention and Population Data projects significantly exceeded targets. Participant reach increased 18% with strong female engagement at 63.5%.</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/80 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle size={16} className="text-[#FFA726] mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-xs font-semibold text-gray-900 mb-1">Indicators Needing Management Attention</div>
                          <div className="text-xs text-gray-700">8 indicators off track, primarily in Humanitarian Response. 12 indicators under watch status require monitoring to prevent slippage.</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/80 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle size={16} className="text-[#EF5350] mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-xs font-semibold text-gray-900 mb-1">IPs Requiring Follow-up</div>
                          <div className="text-xs text-gray-700">WOREC Nepal and FPAN show data quality concerns. SAATHI has indicator reporting delays. Immediate technical support recommended.</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/80 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Database size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-xs font-semibold text-gray-900 mb-1">Data Quality Issues Before Reporting</div>
                          <div className="text-xs text-gray-700">127 evidence items missing. 47 duplicate participant records need resolution. Age disaggregation incomplete for 156 records.</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/80 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <TrendingUp size={16} className="text-[#E95420] mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-xs font-semibold text-gray-900 mb-1">Recommended Management Actions</div>
                          <ul className="text-xs text-gray-700 space-y-1 mt-1">
                            <li>• Conduct data quality workshop with flagged IPs</li>
                            <li>• Accelerate Humanitarian Response activities</li>
                            <li>• Expand coverage to 19 remaining districts</li>
                            <li>• Review and merge duplicate records before Q3</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <footer className="bg-gray-50 border-t border-gray-200 px-8 py-3">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Clock size={14} />
                <span>Last updated: 30 May 2026, 14:23 NPT</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle size={14} />
                <span>Data subject to validation and verification before official reporting</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Shield size={14} />
              <span>Privacy: No personal identifiers or survivor-level records are displayed</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}