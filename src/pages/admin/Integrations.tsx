import { useEffect, useState } from 'react';
import { StatusBadge } from '../../components/StatusBadge';
import api from '../../api/axios';
import { Loader2, Plug } from 'lucide-react';

interface IntegrationGroup {
  type: string;
  name: string;
  schools: Array<{
    schoolId: string;
    schoolName: string;
    schoolStatus: string;
    connected: boolean;
    connectedAt: string | null;
  }>;
}

export const AdminIntegrations = () => {
  const [integrations, setIntegrations] = useState<IntegrationGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/integrations')
      .then(res => setIntegrations(res.data))
      .catch(err => console.error('Failed to load integrations:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
    </div>
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Integrations</h1>
        <p className="text-sm text-slate-500 mt-0.5">Integration status across all schools.</p>
      </div>

      <div className="space-y-6">
        {integrations.map((group) => (
          <div key={group.type}>
            <div className="bg-white border border-slate-200 rounded-xl p-5 mb-3 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${group.type === 'google' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                  }`}>
                  {group.type === 'google' ? 'G' : 'O'}
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">{group.name}</h2>
                  <p className="text-xs text-slate-500">
                    {group.schools.filter(s => s.connected).length} of {group.schools.length} schools connected
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs font-medium text-slate-500 border-b border-slate-100 bg-slate-50">
                    <th className="px-5 py-3">School</th>
                    <th className="px-5 py-3">School Status</th>
                    <th className="px-5 py-3">Connection</th>
                    <th className="px-5 py-3 text-right">Connected Since</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {group.schools.map((school) => (
                    <tr key={school.schoolId} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3 text-sm font-medium text-slate-900">{school.schoolName}</td>
                      <td className="px-5 py-3"><StatusBadge status={school.schoolStatus as any} /></td>
                      <td className="px-5 py-3"><StatusBadge status={school.connected ? 'connected' : 'not connected'} /></td>
                      <td className="px-5 py-3 text-right text-xs text-slate-500">
                        {school.connectedAt
                          ? new Date(school.connectedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
                          : '—'
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}

        {integrations.length === 0 && (
          <div className="text-center py-12 border border-dashed border-slate-200 rounded-xl">
            <Plug className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">No integration data available.</p>
          </div>
        )}
      </div>
    </div>
  );
};
