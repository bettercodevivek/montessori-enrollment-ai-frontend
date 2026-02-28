import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { formatDate } from '../../utils';
import { Loader2, Users, ExternalLink } from 'lucide-react';

interface ReferralData {
  id: string;
  referrerSchool: string;
  newSchool: string;
  referredSchoolId: string | null;
  date: string;
  status: string;
}

export const AdminReferrals = () => {
  const [referrals, setReferrals] = useState<ReferralData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/referrals')
      .then(res => setReferrals(res.data))
      .catch(err => console.error('Failed to load referrals:', err))
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
        <h1 className="text-2xl font-semibold text-slate-900">Referrals</h1>
        <p className="text-sm text-slate-500 mt-0.5">Track all referrals across the platform.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs font-medium text-slate-500 border-b border-slate-100 bg-slate-50">
              <th className="px-5 py-3">Referrer School</th>
              <th className="px-5 py-3">New School</th>
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {referrals.map((referral) => (
              <tr key={referral.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-5 py-3 text-sm font-medium text-slate-900">{referral.referrerSchool}</td>
                <td className="px-5 py-3 text-sm font-medium text-slate-900">{referral.newSchool}</td>
                <td className="px-5 py-3 text-sm text-slate-500">{formatDate(referral.date)}</td>
                <td className="px-5 py-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${referral.status === 'converted' ? 'bg-green-50 text-green-700' :
                      referral.status === 'active' ? 'bg-blue-50 text-blue-700' :
                        'bg-yellow-50 text-yellow-700'
                    }`}>
                    {referral.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  {referral.referredSchoolId ? (
                    <Link to={`/admin/schools?highlight=${referral.referredSchoolId}`} className="inline-flex items-center gap-1 text-xs text-primary-600 hover:underline">
                      <ExternalLink className="w-3.5 h-3.5" /> View school
                    </Link>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
              </tr>
            ))}
            {referrals.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center">
                  <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm text-slate-500">No referrals yet.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
