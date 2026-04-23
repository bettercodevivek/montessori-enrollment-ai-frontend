import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Loader2, CreditCard, AlertCircle, CheckCircle, Check } from 'lucide-react';
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
  {
    key: 'starter',
    name: 'Starter',
    tagline: 'Stop missing calls',
    price: 195,
    minutes: 250,
    bestFor:
      'Best for schools losing inquiries to voicemail and wanting an immediate safety net with no extra staff burden.',
    features: [
      'Answers every new parent call during class, lunch rush, and after hours',
      'Shares school info: hours, programs, age groups',
      'Captures parent name and phone number',
      'Collects preferred tour date and time',
      'Call summary emailed to director after every call',
      'English language support',
      '250 minutes included per month enough for ~50 calls at average length',
    ],
    tourBooking: 'Parent requests a preferred time your staff confirms and books manually.',
  },
  {
    key: 'growth',
    name: 'Growth',
    tagline: 'GROWTH: Capture and schedule',
    price: 245,
    minutes: 500,
    bestFor:
      'Best for schools ready to convert more inquiries into confirmed tours without adding staff hours or manual back-and-forth.',
    features: [
      'Real-time calendar integration (Google or Outlook)',
      'Nora books tours live during the call with instant confirmation to parent',
      'Full parent profile: name, phone, email, child name and age',
      'Bilingual support English and Spanish',
      'Higher-conversion conversation flow tuned for childcare',
      '500 minutes included per month enough for ~100 calls at average length',
    ],
    tourBooking:
      'Nora books directly on your calendar during the call. Parent receives instant confirmation before they hang up.',
  },
  {
    key: 'full_enrollment',
    name: 'Full enrollment',
    tagline: 'Full enrollment system',
    price: 290,
    minutes: 750,
    bestFor:
      'Best for schools that want a managed, consistent enrollment process with visibility into performance and zero dropped leads.',
    features: [
      'After-hours and weekend call coverage, every day',
      'Priority alerts for high-intent families director notified immediately',
      'Advanced call summaries with key parent insights and questions asked',
      'Printable tour day one-pager for staff personalized per family',
      'Director dashboard calls received, tours booked, follow-ups needed',
      'Automated email reminders sent to parent before each tour',
      'Ongoing AI tuning as your programs, staff, or availability changes',
      'Multi-location support available',
      '750 minutes included per month enough for ~150 calls at average length',
    ],
    tourBooking:
      'Nora books directly, sends confirmation, and triggers automated reminders before the tour date. Zero no-shows go unaddressed.',
  },
  {
    key: 'demo',
    name: 'Demo',
    tagline: '$2/mo sandbox plan for testing (2 min voice / month)',
    price: 2,
    minutes: 2,
    isDemo: true,
    bestFor: 'Best for testing payment flow and API behavior in a low-cost sandbox.',
    features: [
      'Sandbox usage for QA and staging checks',
      '2 included minutes per month',
      'Safe way to validate subscription and usage flow',
    ],
    tourBooking: 'For testing only. Not intended for live parent enrollment operations.',
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
  const maxFeatureCount = Math.max(...PLANS.map((p) => p.features.length));

  return (
    <div className="max-w-7xl mx-auto px-6 space-y-8">
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
        <div className="grid gap-6 lg:grid-cols-4 md:grid-cols-2 sm:grid-cols-1 items-stretch">
          {PLANS.map((p) => {
            const isSubscribed = status?.subscriptionPlanKey === p.key && status?.subscriptionStatus === 'active';
            const isMostPopular = p.key === 'growth';
            const isDemo = 'isDemo' in p && p.isDemo;
            return (
              <div key={p.key} className={`h-full bg-white border rounded-2xl shadow-sm flex flex-col relative overflow-hidden ${isMostPopular ? 'border-2 border-blue-500' : isDemo ? 'border-amber-200 ring-1 ring-amber-100' : 'border-slate-200'}`}>
                {isMostPopular && (
                  <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                    Most popular
                  </div>
                )}
                {isDemo && (
                  <span className="absolute top-0 left-0 text-[10px] font-semibold uppercase tracking-wide text-amber-800 bg-amber-100 px-2 py-1 rounded-br-lg">
                    Sandbox
                  </span>
                )}
                <div className="p-6 border-b border-slate-100 min-h-[250px]">
                  <div className="text-sm font-bold uppercase tracking-wide text-blue-600">{p.name}</div>
                  <div className="text-base text-slate-600 mt-2 min-h-[3rem]">{p.tagline}</div>
                  <div className="mt-4 text-4xl font-bold text-slate-900">${p.price}<span className="text-xl font-normal text-slate-500">/mo</span></div>
                  <div className="text-sm text-slate-500 mt-2">{p.minutes} min / month included</div>
                  <div className="mt-4 bg-slate-50 rounded-lg p-3 text-sm text-slate-600 leading-relaxed min-h-[98px]">
                    {p.bestFor}
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                    What Nora handles
                  </div>
                  <ul className="space-y-2.5 mb-5 min-h-[312px]">
                    {p.features.map((feature) => (
                      <li key={`${p.key}-${feature}`} className="flex items-start gap-2.5 text-sm text-slate-700 leading-relaxed">
                        <span className="mt-0.5 w-4 h-4 bg-emerald-50 rounded-full flex items-center justify-center shrink-0">
                          <Check className="w-2.5 h-2.5 text-emerald-600" />
                        </span>
                        <span>{feature}</span>
                      </li>
                    ))}
                    {Array.from({ length: Math.max(0, maxFeatureCount - p.features.length) }).map((_, idx) => (
                      <li
                        key={`${p.key}-pad-${idx}`}
                        className="flex items-start gap-2.5 text-sm text-slate-700 leading-relaxed opacity-0 select-none"
                        aria-hidden="true"
                      >
                        <span className="mt-0.5 w-4 h-4 bg-emerald-50 rounded-full flex items-center justify-center shrink-0">
                          <Check className="w-2.5 h-2.5 text-emerald-600" />
                        </span>
                        <span>Placeholder</span>
                      </li>
                    ))}
                  </ul>

                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4 min-h-[110px]">
                    <div className="text-[11px] font-bold text-blue-700 uppercase tracking-wider mb-1.5">Tour booking</div>
                    <p className="text-sm text-blue-900 leading-relaxed">{p.tourBooking}</p>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-xs text-amber-800 mb-5 min-h-[64px]">
                    Additional minutes billed at $1.50 per 5-minute block. Included minutes roll over month to month.
                  </div>
                  <div className="flex-1" />

                  <div className="space-y-2">
                  {isSubscribed ? (
                    <div className="w-full py-3 rounded-lg bg-green-100 text-green-700 text-base font-semibold text-center flex items-center justify-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Subscribed
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={busy || (cfg && cfg[p.key] === false)}
                      onClick={() => subscribe(p.key)}
                      className={`w-full py-3 rounded-lg text-base font-semibold hover:opacity-90 disabled:opacity-50 ${isMostPopular ? 'bg-blue-500 text-white' : 'bg-slate-900 text-white'}`}
                    >
                      Subscribe with PayPal
                    </button>
                  )}
                  {cfg && cfg[p.key] === false && (
                    <p className="text-[11px] text-amber-700 text-center">
                      Set <code className="bg-amber-50 px-0.5 rounded">{planEnvLabel[p.key]}</code> in server .env
                    </p>
                  )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
