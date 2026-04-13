import { useEffect, useState } from 'react';
import { Loader2, DollarSign } from 'lucide-react';
import api from '../../api/axios';

interface Summary {
  period: string;
  revenueUsd: number;
  byType: Record<string, { totalUsd: number; count: number }>;
  schools: Array<{
    id: string;
    name: string;
    subscriptionPlanKey: string;
    subscriptionStatus: string;
    billingMode: string;
    minuteBalance: number | null;
    foundingPartner: boolean;
    onboardingFeePaid: boolean;
    paypalSubscriptionId: string;
    lastBillingCyclePaymentAt: string | null;
  }>;
}

interface TxRow {
  id: string;
  schoolName: string | null;
  type: string;
  amount: number;
  currency: string;
  description: string;
  createdAt: string;
}

export const AdminFinancials = () => {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [tx, setTx] = useState<TxRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const q = month ? `?month=${encodeURIComponent(month)}` : '';
        const [sRes, tRes] = await Promise.all([
          api.get(`/admin/billing/summary${q}`),
          api.get('/admin/billing/transactions?limit=100'),
        ]);
        setSummary(sRes.data);
        setTx(tRes.data.items || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [month]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 flex items-center gap-2">
            <DollarSign className="w-7 h-7 text-emerald-600" />
            Financials
          </h1>
          <p className="text-sm text-slate-500 mt-1">Subscription payments, onboarding, top-ups, and per-school usage balances.</p>
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">Filter by month</label>
          <input
            type="month"
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">Recorded revenue (period)</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            ${(summary?.revenueUsd ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        {['subscription_payment', 'topup', 'onboarding'].map((k) => (
          <div key={k} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">{k.replace(/_/g, ' ')}</div>
            <div className="text-xl font-semibold text-slate-900 mt-1">
              ${(summary?.byType?.[k]?.totalUsd ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-slate-400 mt-1">{summary?.byType?.[k]?.count ?? 0} tx</div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">Schools</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-slate-600">
                <th className="px-4 py-3 font-medium">School</th>
                <th className="px-4 py-3 font-medium">Plan</th>
                <th className="px-4 py-3 font-medium">Subscription</th>
                <th className="px-4 py-3 font-medium">Minutes</th>
                <th className="px-4 py-3 font-medium">Founding</th>
                <th className="px-4 py-3 font-medium">Onboarding paid</th>
              </tr>
            </thead>
            <tbody>
              {(summary?.schools || []).map((s) => (
                <tr key={s.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium text-slate-900">{s.name}</td>
                  <td className="px-4 py-3 text-slate-600">{s.subscriptionPlanKey || '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{s.subscriptionStatus}</td>
                  <td className="px-4 py-3 tabular-nums">{typeof s.minuteBalance === 'number' ? s.minuteBalance : '—'}</td>
                  <td className="px-4 py-3">{s.foundingPartner ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-3">{s.onboardingFeePaid ? 'Yes' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">Recent transactions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-slate-600">
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">School</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Description</th>
              </tr>
            </thead>
            <tbody>
              {tx.map((t) => (
                <tr key={t.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{new Date(t.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-3">{t.schoolName || '—'}</td>
                  <td className="px-4 py-3">{t.type}</td>
                  <td className="px-4 py-3 tabular-nums">
                    {t.amount.toFixed(2)} {t.currency}
                  </td>
                  <td className="px-4 py-3 text-slate-600 max-w-xs truncate">{t.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
