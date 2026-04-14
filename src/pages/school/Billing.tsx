import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Loader2, CreditCard, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../../api/axios';

interface BillingStatus {
  billingMode: string;
  subscriptionPlanKey: string;
  subscriptionStatus: string;
  minuteBalance: number | null;
  foundingPartner: boolean;
  onboardingFeePaid: boolean;
  planDetails: {
    monthlyUsd: number;
    onboardingUsd: number;
    includedMinutesPerMonth: number;
  } | null;
  topup: { usd: number; minutes: number };
  /** From server: which PayPal Billing Plan IDs are set in .env */
  paypalPlansConfigured?: Record<string, boolean>;
}

function getApiError(e: unknown, fallback: string): string {
  const ax = e as {
    response?: { data?: unknown; status?: number };
    message?: string;
  };
  const d = ax.response?.data;
  if (typeof d === 'string' && d.trim()) return d;
  if (d && typeof d === 'object') {
    const o = d as Record<string, unknown>;
    if (typeof o.error === 'string' && o.error.trim()) return o.error;
    if (typeof o.message === 'string' && o.message.trim()) return o.message;
  }
  if (ax.message && !ax.message.startsWith('Request failed')) return ax.message;
  return fallback;
}

const PLANS = [
  { key: 'starter', name: 'Starter', tagline: 'Stop missing calls', price: 195, minutes: 250 },
  { key: 'growth', name: 'Growth', tagline: 'GROWTH: Capture and schedule', price: 245, minutes: 500 },
  { key: 'full_enrollment', name: 'Full enrollment', tagline: 'Full enrollment system', price: 290, minutes: 750 },
  {
    key: 'demo',
    name: 'Demo',
    tagline: '$2/mo sandbox plan for testing (2 min voice / month)',
    price: 2,
    minutes: 2,
    isDemo: true,
  },
];

export const SchoolBilling = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [status, setStatus] = useState<BillingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const returnUrl = `${baseUrl}/school/billing?sub=return`;
  const cancelUrl = `${baseUrl}/school/billing?sub=cancel`;

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/billing/status');
      setStatus(res.data);
    } catch {
      setError('Could not load billing status.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const sub = searchParams.get('sub');
    const subscriptionId = searchParams.get('subscription_id');
    const orderId =
      searchParams.get('token') || searchParams.get('orderId') || searchParams.get('order_id');

    if (sub === 'return' && subscriptionId) {
      setBusy(true);
      api
        .post('/billing/sync-subscription', { subscriptionId })
        .then(() => {
          setMessage('Subscription updated.');
          load();
        })
        .catch(() => setError('Could not confirm subscription.'))
        .finally(() => {
          setBusy(false);
          setSearchParams({}, { replace: true });
        });
      return;
    }

    if (sub === 'return' && orderId) {
      setBusy(true);
      api
        .post('/billing/capture-order', { orderId })
        .then(() => {
          setMessage('Payment completed.');
          load();
        })
        .catch(() => setError('Could not confirm payment.'))
        .finally(() => {
          setBusy(false);
          setSearchParams({}, { replace: true });
        });
    }
  }, [searchParams, setSearchParams, load]);

  const subscribe = async (planKey: string) => {
    setBusy(true);
    setError('');
    try {
      const res = await api.post('/billing/subscribe', {
        planKey,
        returnUrl,
        cancelUrl,
      });
      if (res.data.approvalUrl) {
        window.location.href = res.data.approvalUrl;
        return;
      }
      setError('PayPal did not return an approval URL. Check server PayPal plan configuration.');
    } catch (e: unknown) {
      setError(getApiError(e, 'Subscribe failed. Check the server console and PayPal credentials.'));
    } finally {
      setBusy(false);
    }
  };

  const startOnboarding = async (planKey: string) => {
    setBusy(true);
    setError('');
    try {
      const res = await api.post('/billing/onboarding-order', {
        planKey,
        returnUrl,
        cancelUrl,
      });
      if (res.data.skipped) {
        setMessage(res.data.message || 'Onboarding skipped.');
        return;
      }
      if (res.data.approvalUrl) {
        window.location.href = res.data.approvalUrl;
        return;
      }
      setError('Could not start onboarding payment.');
    } catch (e: unknown) {
      setError(getApiError(e, 'Onboarding order failed.'));
    } finally {
      setBusy(false);
    }
  };

  const startTopup = async () => {
    setBusy(true);
    setError('');
    try {
      const res = await api.post('/billing/topup-order', { returnUrl, cancelUrl });
      if (res.data.approvalUrl) {
        window.location.href = res.data.approvalUrl;
        return;
      }
      setError('Could not start top-up.');
    } catch (e: unknown) {
      setError(getApiError(e, 'Top-up failed.'));
    } finally {
      setBusy(false);
    }
  };

  if (loading || busy) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  const balance = status?.minuteBalance;
  const low = typeof balance === 'number' && balance <= 0;
  const active = status?.subscriptionStatus === 'active';
  const cfg = status?.paypalPlansConfigured;
  const planEnvLabel: Record<string, string> = {
    starter: 'PAYPAL_PLAN_STARTER',
    growth: 'PAYPAL_PLAN_GROWTH',
    full_enrollment: 'PAYPAL_PLAN_FULL_ENROLLMENT',
    demo: 'PAYPAL_PLAN_DEMO',
  };
  const anyPlanMissing = cfg
    ? PLANS.some((p) => cfg[p.key] === false)
    : false;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Billing & usage</h1>
        <p className="text-sm text-slate-500 mt-1">
          Monthly plans renew automatically. Unused minutes roll over. Calls deduct from your balance in full minutes (rounded up).
        </p>
      </div>

      {message && (
        <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm">
          <CheckCircle className="w-4 h-4 shrink-0" />
          {message}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {anyPlanMissing && (
        <div className="flex items-start gap-2 text-amber-900 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">PayPal plan IDs are not set on the server</p>
            <p className="mt-1 text-amber-800/90">
              Add each Billing Plan ID from the PayPal dashboard to <code className="bg-amber-100/80 px-1 rounded text-xs">montessori-enrollment-ai-backend/.env</code>:
              {' '}<code className="text-xs">PAYPAL_PLAN_STARTER</code>, <code className="text-xs">PAYPAL_PLAN_GROWTH</code>,{' '}
              <code className="text-xs">PAYPAL_PLAN_FULL_ENROLLMENT</code>, <code className="text-xs">PAYPAL_PLAN_DEMO</code>{' '}
              (values look like <code className="text-xs">P-1AB23456CD789012N</code>). Restart the API after saving.
            </p>
          </div>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-600" />
              Minute balance
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Status: <strong className="text-slate-800">{status?.subscriptionStatus || '—'}</strong>
              {status?.subscriptionPlanKey ? (
                <>
                  {' '}
                  · Plan: <strong className="text-slate-800">{status.subscriptionPlanKey}</strong>
                </>
              ) : null}
            </p>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-bold tabular-nums ${low ? 'text-amber-600' : 'text-slate-900'}`}>
              {typeof balance === 'number' ? balance : '—'}
            </div>
            <div className="text-xs text-slate-500">minutes remaining</div>
          </div>
        </div>

        {active && low && (
          <div className="mt-4 p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-sm">
            You have used your included minutes for this period. Purchase a top-up to keep uninterrupted service, or wait until your next monthly payment adds your plan allowance (unused minutes roll over).
          </div>
        )}

        {active && status?.topup && (
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button type="button" onClick={() => startTopup()} disabled={busy} className="ui-button-primary">
              Top up +{status.topup.minutes} min (${status.topup.usd.toFixed(2)})
            </button>
            <span className="text-xs text-slate-500">PayPal · one-time purchase</span>
          </div>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Plans (autopay monthly)</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {PLANS.map((p) => (
            <div
              key={p.key}
              className={`bg-white border rounded-xl p-5 shadow-sm flex flex-col ${
                'isDemo' in p && p.isDemo ? 'border-amber-200 ring-1 ring-amber-100' : 'border-slate-200'
              }`}
            >
              <div className="flex items-center gap-2 flex-wrap">
                <div className="text-xs font-bold uppercase tracking-wide text-blue-600">{p.name}</div>
                {'isDemo' in p && p.isDemo ? (
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                    Sandbox
                  </span>
                ) : null}
              </div>
              <div className="text-sm text-slate-600 mt-1 min-h-[2.5rem]">{p.tagline}</div>
              <div className="mt-3 text-2xl font-bold text-slate-900">${p.price}/mo</div>
              <div className="text-xs text-slate-500">{p.minutes} min / month included</div>
              <div className="flex-1" />
              <div className="mt-4 space-y-2">
                <button
                  type="button"
                  disabled={busy || (cfg && cfg[p.key] === false)}
                  onClick={() => subscribe(p.key)}
                  className="w-full py-2.5 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 disabled:opacity-50"
                >
                  Subscribe with PayPal
                </button>
                {cfg && cfg[p.key] === false && (
                  <p className="text-[11px] text-amber-700 text-center">
                    Set <code className="bg-amber-50 px-0.5 rounded">{planEnvLabel[p.key]}</code> in server .env
                  </p>
                )}
                {!status?.foundingPartner && !status?.onboardingFeePaid && p.key !== 'demo' && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => startOnboarding(p.key)}
                    className="w-full py-2 rounded-lg border border-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-50"
                  >
                    Pay onboarding fee only ({p.key === 'starter' ? '$299' : p.key === 'growth' ? '$399' : '$599'})
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
