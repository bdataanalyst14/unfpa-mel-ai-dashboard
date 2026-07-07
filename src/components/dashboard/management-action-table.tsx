import StatusBadge from './status-badge';

interface ActionItem {
  action: string;
  owner: string;
  priority: 'high' | 'medium' | 'low';
  deadline: string;
  status: 'Pending' | 'Approved';
}

const defaultActions: ActionItem[] = [
  { action: 'Accelerate male engagement sessions in GEWE programme', owner: 'GEWE Programme Team', priority: 'high', deadline: '2025-07-15', status: 'Pending' },
  { action: 'Issue evidence upload reminder to WOREC and FPAN', owner: 'M&E Unit', priority: 'high', deadline: '2025-06-30', status: 'Pending' },
  { action: 'Deploy additional IP capacity in Karnali Province', owner: 'Operations', priority: 'medium', deadline: '2025-08-01', status: 'Pending' },
  { action: 'Activate GBV referral pathways in Madhesh', owner: 'GBV Programme Lead', priority: 'high', deadline: '2025-07-31', status: 'Pending' },
  { action: 'Review CSE school integration target methodology', owner: 'AYSRHR Team', priority: 'medium', deadline: '2025-09-01', status: 'Pending' },
];

export default function ManagementActionTable({ actions = defaultActions }: { actions?: ActionItem[] }) {
  const priorityColors: Record<string, string> = {
    high: 'text-red-600 bg-red-50 border border-red-100',
    medium: 'text-amber-600 bg-amber-50 border border-amber-100',
    low: 'text-blue-600 bg-blue-50 border border-blue-100'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
      <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
        <h3 className="text-sm font-semibold text-gray-900">Suggested Management Actions</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 uppercase font-mono text-[10px] tracking-wider border-b border-gray-100">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Action</th>
              <th className="px-4 py-3 text-left font-medium">Owner</th>
              <th className="px-4 py-3 text-left font-medium">Priority</th>
              <th className="px-4 py-3 text-left font-medium">Deadline</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-700">
            {actions.map((item, i) => (
              <tr key={i} className="hover:bg-gray-50/30 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900 max-w-md">{item.action}</td>
                <td className="px-4 py-3 text-xs text-gray-600">{item.owner}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${priorityColors[item.priority]}`}>
                    {item.priority}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-600 font-mono">{item.deadline}</td>
                <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
