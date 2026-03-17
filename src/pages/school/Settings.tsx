import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Save, Loader2, Phone, MessageSquare, CheckCircle, AlertCircle, Plus, Trash2, Calendar, Activity } from 'lucide-react';
import api from '../../api/axios';

interface QAPair {
  question: string;
  answer: string;
}

interface SettingsData {
  id: string;
  name: string;
  address: string;
  aiNumber: string;
  routingNumber: string;
  escalationNumber: string;
  language: string;
  script: string;
  systemPrompt: string;
  businessHoursStart: string;
  businessHoursEnd: string;
  twilioSid: string;
  twilioAuthToken: string;
  twilioPhoneNumber: string;
  smsAutoFollowup: boolean;
  emailAutoFollowup: boolean;
  smsTemplate: string;
  emailTemplate: string;
  qaPairs: QAPair[];
  preferredCalendar: 'google' | 'outlook' | 'both' | 'none';
  googleConnected: boolean;
  outlookConnected: boolean;
  adminEmail: string;
  timezone: string;
  tourConfirmationEmailTemplate: string;
  tourReminderSmsTemplate: string;
}

const DEFAULT_QA_PAIRS: QAPair[] = [
  { question: "What makes your school different?", answer: "We follow the Montessori philosophy, which focuses on independence, hands-on learning, and child-led development in a structured classroom environment." },
  { question: "What ages do you accept?", answer: "We accept children from [age]." },
  { question: "Do you offer full-time and part-time options?", answer: "Yes, we offer full-time and part-time options depending on availability." },
  { question: "Is there availability?", answer: "Availability varies by age group. I can check availability and help schedule a tour." },
  { question: "How do I enroll?", answer: "The first step is to schedule a tour. After your visit, we guide you through the enrollment paperwork." },
  { question: "Is there an enrollment fee?", answer: "Yes, there is a registration fee of [$amount]. Full details are shared during enrollment." },
  { question: "How much is tuition?", answer: "Tuition depends on age and schedule. We review exact pricing during your tour." },
  { question: "What are your hours?", answer: "We are open from [Opening Time] to [Closing Time], Monday through Friday." },
  { question: "Are you year-round?", answer: "We operate on a [year-round / academic year] calendar." },
  { question: "What is Montessori?", answer: "Montessori is a child-centered educational approach that encourages independence, self-paced learning, and hands-on materials." },
  { question: "Are teachers certified?", answer: "Our teachers are trained in Montessori methods and early childhood education." },
  { question: "What is the teacher-to-child ratio?", answer: "We follow all state-required ratios to ensure quality and safety." },
  { question: "How do you ensure safety?", answer: "We maintain secure entry procedures and follow all licensing and safety standards." },
  { question: "Do you provide meals?", answer: "[Yes / No]. If no, parents provide lunch and snacks." },
  { question: "How do you handle allergies?", answer: "We take allergies seriously and work closely with families to ensure safety. Allergy information is documented during onboarding." },
  { question: "Do children nap?", answer: "Yes, younger children have scheduled rest time." },
  { question: "How do parents receive updates?", answer: "We provide updates through [app/email/daily report]." },
  { question: "How long is a tour?", answer: "Tours typically last about 30–45 minutes." },
  { question: "Can I bring my child to the tour?", answer: "Yes, you're welcome to bring your child." },
  { question: "How do I schedule a tour?", answer: "I can help you schedule a tour now. What day works best?" },
  { question: "Do you offer school pickup?", answer: "Yes, we offer pickup service from nearby schools within a [X-mile] radius." },
  { question: "Which schools do you pick up from?", answer: "Pickup is available from select schools within our service area. I can confirm if your child's school qualifies." },
  { question: "Is pickup included in tuition?", answer: "Pickup service may have an additional fee. Details are shared during the enrollment discussion." },
  { question: "What time is pickup?", answer: "Pickup times depend on the partner school's dismissal schedule." },
  { question: "Is transportation safe?", answer: "Yes, we follow all transportation safety guidelines and supervision policies." },
  { question: "What if I live slightly outside the radius?", answer: "I can note your address and have our director confirm availability." },
  { question: "Do you offer drop-off service too?", answer: "Currently we offer [pickup only / pickup and drop-off]." },
  { question: "How do I register for pickup?", answer: "Pickup arrangements are finalized during enrollment. We confirm school details and scheduling at that time." },
];

// Strip any Mongoose _id fields from qaPairs
function cleanQAPairs(pairs: any[]): QAPair[] {
  return (pairs || []).map(p => ({ question: p.question || '', answer: p.answer || '' }));
}

type Tab = 'agent' | 'twilio' | 'automation' | 'calendar';

export const SchoolSettings = () => {
  const { t } = useTranslation();
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('agent');

  // ── Load settings on mount ──────────────────────────────────────────────
  useEffect(() => {
    api.get('/school/settings')
      .then(async res => {
        const data = res.data;
        let qaPairs = cleanQAPairs(data.qaPairs);

        // First-time setup: seed default Q&A to DB for this school
        if (qaPairs.length === 0) {
          qaPairs = DEFAULT_QA_PAIRS;
          try {
            await api.put('/school/settings', { qaPairs: DEFAULT_QA_PAIRS });
            console.log('[Settings] Default Q&A pairs seeded to DB for this school.');
          } catch (err) {
            console.error('[Settings] Failed to seed default Q&A pairs:', err);
          }
        }

        setSettings({ ...data, qaPairs });
      })
      .catch(err => {
        console.error('[Settings] Failed to load settings:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  // ── Save all settings to DB ──────────────────────────────────────────────
  const saveSettings = useCallback(async () => {
    if (!settings) return;
    setSaving(true);
    setStatus(null);

    const payload = {
      name: settings.name,
      address: settings.address,
      aiNumber: settings.aiNumber,
      routingNumber: settings.routingNumber,
      escalationNumber: settings.escalationNumber,
      language: settings.language,
      script: settings.script,
      systemPrompt: settings.systemPrompt,
      businessHoursStart: settings.businessHoursStart,
      businessHoursEnd: settings.businessHoursEnd,
      twilioSid: settings.twilioSid,
      twilioAuthToken: settings.twilioAuthToken,
      twilioPhoneNumber: settings.twilioPhoneNumber,
      smsAutoFollowup: settings.smsAutoFollowup,
      emailAutoFollowup: settings.emailAutoFollowup,
      smsTemplate: settings.smsTemplate,
      emailTemplate: settings.emailTemplate,
      qaPairs: cleanQAPairs(settings.qaPairs),
      preferredCalendar: settings.preferredCalendar,
      timezone: settings.timezone,
      adminEmail: settings.adminEmail,
      tourConfirmationEmailTemplate: settings.tourConfirmationEmailTemplate,
      tourReminderSmsTemplate: settings.tourReminderSmsTemplate,
    };

    try {
      const res = await api.put('/school/settings', payload);
      console.log('[Settings] Saved successfully:', res.data);
      setStatus({ type: 'success', message: `Settings saved — ${res.data.qaPairsCount ?? 0} Q&A pairs stored.` });
    } catch (err: any) {
      console.error('[Settings] Save failed:', err);
      const msg = err?.response?.data?.error || 'Failed to save settings. Please try again.';
      setStatus({ type: 'error', message: msg });
    } finally {
      setSaving(false);
      setTimeout(() => setStatus(null), 5000);
    }
  }, [settings]);

  // ── Update a single top-level field ─────────────────────────────────────
  const update = useCallback(<K extends keyof SettingsData>(field: K, value: SettingsData[K]) => {
    setSettings(prev => prev ? { ...prev, [field]: value } : prev);
  }, []);

  // ── Update a Q&A pair ────────────────────────────────────────────────────
  const updateQA = useCallback((index: number, field: 'question' | 'answer', value: string) => {
    setSettings(prev => {
      if (!prev) return prev;
      const pairs = prev.qaPairs.map((p, i) => i === index ? { ...p, [field]: value } : p);
      return { ...prev, qaPairs: pairs };
    });
  }, []);

  const addQA = useCallback(() => {
    setSettings(prev => prev ? { ...prev, qaPairs: [...prev.qaPairs, { question: '', answer: '' }] } : prev);
  }, []);

  const removeQA = useCallback((index: number) => {
    setSettings(prev => {
      if (!prev) return prev;
      return { ...prev, qaPairs: prev.qaPairs.filter((_, i) => i !== index) };
    });
  }, []);

  // ── Render ───────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
    </div>
  );

  if (!settings) return (
    <div className="text-center py-12 text-slate-500">{t('failed_to_load_settings')}</div>
  );

  const tabs: { id: Tab; label: string }[] = [
    { id: 'agent', label: 'AI Settings' },
    // { id: 'twilio', label: t('tab_twilio') },
    { id: 'automation', label: t('tab_automation') },
    { id: 'calendar', label: 'Calendar Sync' },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{t('settings_title')}</h1>
          <p className="text-sm text-slate-500 mt-0.5">{t('settings_desc')}</p>
        </div>
        <button
          type="button"
          onClick={saveSettings}
          disabled={saving}
          className="ui-button-primary flex items-center gap-2"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? t('saving') : t('save_settings')}
        </button>
      </div>

      {/* Toast Notification */}
      {status && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border animate-soft transform transition-all duration-300 ${status.type === 'success' ? 'bg-white border-emerald-100 text-emerald-800' : 'bg-white border-red-100 text-red-800'}`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${status.type === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
            {status.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          </div>
          <div>
            <p className="text-sm font-bold leading-tight">{status.type === 'success' ? 'Saved Successfully' : 'Error Saving'}</p>
            <p className="text-xs opacity-70 mt-0.5">{status.message}</p>
          </div>
        </div>
      )}

      {/* Tab nav */}
      <div className="flex border-b border-slate-200 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-6">

        {/* ── AI Settings tab ── */}
        {activeTab === 'agent' && (
          <>
            {/* Phone Routing */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h2 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400" />
                School Identity & Routing
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">School Name</label>
                  <input
                    type="text"
                    value={settings.name}
                    onChange={e => update('name', e.target.value)}
                    className="ui-input w-full"
                    placeholder="Sunshine Montessori"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">School Address</label>
                  <input
                    type="text"
                    value={settings.address}
                    onChange={e => update('address', e.target.value)}
                    className="ui-input w-full"
                    placeholder="123 Education Way, City, ST"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-1">Timezone</label>
                <select
                  value={settings.timezone || 'America/Chicago'}
                  onChange={e => update('timezone', e.target.value)}
                  className="ui-input w-full text-sm font-medium bg-white"
                >
                  <option value="America/Chicago">Central Time (CST/CDT)</option>
                  <option value="America/New_York">Eastern Time (EST/EDT)</option>
                  <option value="America/Denver">Mountain Time (MST/MDT)</option>
                  <option value="America/Los_Angeles">Pacific Time (PST/PDT)</option>
                  <option value="America/Anchorage">Alaska Time</option>
                  <option value="Pacific/Honolulu">Hawaii Time</option>
                </select>
                <p className="text-xs text-slate-400 mt-1 italic">Select your school's local timezone. CST is the default.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('ai_phone_number')}</label>
                  <input
                    type="text"
                    value={settings.aiNumber}
                    readOnly
                    className="ui-input w-full bg-slate-50 cursor-not-allowed border-dashed"
                    placeholder="Auto-assigned number"
                  />
                  <p className="text-xs text-slate-400 mt-1">The dedicated AI-managed number callers dial.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Front Desk / Routing Number</label>
                  <input
                    type="text"
                    value={settings.routingNumber}
                    onChange={e => update('routingNumber', e.target.value)}
                    className="ui-input w-full"
                    placeholder="+1 (555) 123-4568"
                  />
                  <p className="text-xs text-slate-400 mt-1">Non-inquiry calls forward here.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('escalation_number')}</label>
                  <input
                    type="text"
                    value={settings.escalationNumber}
                    onChange={e => update('escalationNumber', e.target.value)}
                    className="ui-input w-full"
                    placeholder="+1 (555) 123-4569"
                  />
                  <p className="text-xs text-slate-400 mt-1">Fallback if AI cannot handle the call.</p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">school opening hours</label>
                  <input
                    type="time"
                    value={settings.businessHoursStart || '09:00'}
                    onChange={e => update('businessHoursStart', e.target.value)}
                    className="ui-input w-full"
                  />
                  <p className="text-xs text-slate-400 mt-1">When the school opens for tours.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">school closing hours</label>
                  <input
                    type="time"
                    value={settings.businessHoursEnd || '17:00'}
                    onChange={e => update('businessHoursEnd', e.target.value)}
                    className="ui-input w-full"
                  />
                  <p className="text-xs text-slate-400 mt-1">When the school closes for tours.</p>
                </div>
              </div>
            </div>

            {/* Agent Configuration - MOVED UP */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" />
                Agent Voice & Behavior
              </h2>

              {/* First Message */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  First Message (Greeting)
                </label>
                <p className="text-xs text-slate-500 mb-2 font-medium">
                  The first sentence the AI says. Use {'{parent_name}'}, {'{school_name}'} as variables.
                </p>
                <textarea
                  rows={3}
                  value={settings.script}
                  onChange={e => update('script', e.target.value)}
                  className="ui-input w-full text-sm leading-relaxed bg-slate-50/30 font-medium"
                  placeholder="Welcome to {school_name}! How can I help you today?"
                />
              </div>

              {/* System Prompt */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  System Instruction (Prompt)
                </label>
                <p className="text-xs text-slate-500 mb-2 font-medium">
                  Core behavior instructions. Guides the AI on how to handle inquiries and schedule tours.
                </p>
                <textarea
                  rows={6}
                  value={settings.systemPrompt || ''}
                  onChange={e => update('systemPrompt', e.target.value)}
                  className="ui-input w-full text-sm font-mono leading-relaxed bg-slate-50/30"
                  placeholder="You are a professional assistant..."
                />
              </div>
            </div>

            {/* Q&A Knowledge Base - MOVED DOWN */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  AI Questionnaire / Knowledge Base
                </h2>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md uppercase tracking-widest">
                  {settings.qaPairs.length} Records
                </span>
              </div>
              <p className="text-sm text-slate-500 mb-5 font-medium">
                Edit these answers to match your school's specific details. These are stored per-school.
              </p>

              <div className="space-y-3 mb-4">
                {settings.qaPairs.map((pair, index) => (
                  <div key={index} className="flex gap-4 items-start bg-slate-50/50 p-5 rounded-xl border border-slate-100 group transition-all hover:bg-white hover:shadow-md">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center text-xs font-black mt-1 border border-blue-100 shadow-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="space-y-1">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Question</span>
                        <input
                          type="text"
                          value={pair.question}
                          onChange={e => updateQA(index, 'question', e.target.value)}
                          className="ui-input w-full bg-white text-sm font-bold border-slate-200"
                          placeholder="Enter question..."
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">AI Response</span>
                        <textarea
                          value={pair.answer}
                          onChange={e => updateQA(index, 'answer', e.target.value)}
                          className="ui-input w-full bg-white text-sm text-slate-600 font-medium border-slate-200"
                          rows={2}
                          placeholder="Enter the answer..."
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeQA(index)}
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100 mt-1 shrink-0 border border-transparent hover:border-red-100"
                      title="Remove this Q&A pair"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addQA}
                className="flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-5 py-2.5 rounded-xl transition-all border border-blue-100 uppercase tracking-widest shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Add New Question
              </button>
            </div>
          </>
        )}

        {/* ── Calendar Sync tab ── */}
        {activeTab === 'calendar' && (
          <div className="space-y-6 animate-soft">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h2 className="text-base font-semibold text-slate-900 mb-1 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                Calendar Selection
              </h2>
              <p className="text-sm text-slate-500 mb-6">
                Choose which calendar(s) the AI should use to check for tour availability and book new appointments.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { id: 'google', label: 'Google Calendar', icon: <div className="w-8 h-8 rounded bg-red-100 text-red-600 flex items-center justify-center font-bold">G</div>, desc: 'Sync only with Google Workspace.' },
                  { id: 'outlook', label: 'Outlook Calendar', icon: <div className="w-8 h-8 rounded bg-blue-100 text-blue-600 flex items-center justify-center font-bold">O</div>, desc: 'Sync only with Microsoft Outlook/365.' },
                  { id: 'both', label: 'Sync Both', icon: <div className="w-8 h-8 rounded bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">G+O</div>, desc: 'Check both for busy times and book to both.' },
                  { id: 'none', label: 'No Sync', icon: <div className="w-8 h-8 rounded bg-slate-100 text-slate-600 flex items-center justify-center font-bold">X</div>, desc: 'Disable external calendar sync logic.' },
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => update('preferredCalendar', opt.id as any)}
                    className={`flex flex-col items-center text-center p-5 rounded-xl border-2 transition-all ${settings.preferredCalendar === opt.id
                      ? 'border-blue-600 bg-blue-50/50 shadow-sm'
                      : 'border-slate-100 hover:border-slate-300 bg-white'
                      }`}
                  >
                    <div className="mb-3">{opt.icon}</div>
                    <span className="text-sm font-bold text-slate-900 mb-1">{opt.label}</span>
                    <p className="text-xs text-slate-500 leading-tight">{opt.desc}</p>
                    <div className={`mt-4 w-5 h-5 rounded-full border-2 flex items-center justify-center ${settings.preferredCalendar === opt.id ? 'border-blue-600 bg-blue-600' : 'border-slate-200 bg-white'
                      }`}>
                      {settings.preferredCalendar === opt.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </button>
                ))}
              </div>

              {((settings.preferredCalendar === 'google' && !settings.googleConnected) ||
                (settings.preferredCalendar === 'outlook' && !settings.outlookConnected) ||
                (settings.preferredCalendar === 'both' && (!settings.googleConnected || !settings.outlookConnected))) && (
                  <div className="mt-8 p-4 bg-amber-50 rounded-xl border border-amber-200 flex gap-3 animate-soft">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="text-sm text-amber-800">
                      <p className="font-semibold mb-1">Make sure you are connected!</p>
                      <p>Go to the <strong>Integrations</strong> page to connect your {
                        settings.preferredCalendar === 'both' ? 'Google and Outlook' : (settings.preferredCalendar === 'google' ? 'Google' : 'Outlook')
                      } account before choosing {settings.preferredCalendar === 'both' ? 'them' : 'it'} here.</p>
                    </div>
                  </div>
                )}
            </div>
          </div>
        )}

        {/* ── Twilio tab ── */}
        {/* {activeTab === 'twilio' && (
          <>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
              <strong>How to set up Twilio:</strong>
              <ol className="mt-2 ml-4 space-y-1 text-xs list-decimal">
                <li>Create a free account at <a href="https://www.twilio.com" target="_blank" rel="noreferrer" className="underline">twilio.com</a></li>
                <li>From the Twilio Console dashboard, copy your <strong>Account SID</strong> and <strong>Auth Token</strong></li>
                <li>Buy or provision a Twilio phone number (this is the number SMS will be sent <em>from</em>)</li>
                <li>Paste all three values below and save</li>
              </ol>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h2 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4 text-slate-400" />
                Twilio API Credentials
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('account_sid')}</label>
                  <input type="text" value={settings.twilioSid} onChange={e => update('twilioSid', e.target.value)} className="ui-input w-full font-mono text-sm" placeholder="ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('auth_token')}</label>
                  <input type="password" value={settings.twilioAuthToken} onChange={e => update('twilioAuthToken', e.target.value)} className="ui-input w-full font-mono text-sm" placeholder="••••••••••••••••••••••••••••••••" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('twilio_phone_number')} <span className="text-red-500">*</span></label>
                  <input type="text" value={settings.twilioPhoneNumber} onChange={e => update('twilioPhoneNumber', e.target.value)} className="ui-input w-full" placeholder="+15551234567" />
                  <p className="text-xs text-slate-400 mt-1">{t('twilio_phone_help')}</p>
                </div>
              </div>
            </div>
          </>
        )}
*/}
        {/* ── Automation tab ── */}
        {activeTab === 'automation' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h2 className="text-base font-semibold text-slate-900 mb-1 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-slate-400" />
              Automated Follow-ups
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              When an enrollment inquiry call ends, the AI can automatically send an SMS and/or email to the parent with the inquiry form link.
            </p>

            <div className="space-y-4 mb-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={settings.smsAutoFollowup} onChange={e => update('smsAutoFollowup', e.target.checked)} className="w-4 h-4 rounded text-blue-600" />
                <div>
                  <span className="text-sm font-medium text-slate-700">Send SMS follow-up after call</span>
                  <p className="text-xs text-slate-400">Requires Twilio credentials to be configured on the Twilio tab.</p>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={settings.emailAutoFollowup} onChange={e => update('emailAutoFollowup', e.target.checked)} className="w-4 h-4 rounded text-blue-600" />
                <div>
                  <span className="text-sm font-medium text-slate-700">Send Email follow-up after call</span>
                  <p className="text-xs text-slate-400">Requires SMTP credentials configured in the server .env file.</p>
                </div>
              </label>
            </div>

            <div className="mb-6 pt-4 border-t border-slate-100">
              <label className="block text-sm font-medium text-slate-700 mb-1 text-blue-600">Admin Notification Email</label>
              <input
                type="email"
                value={settings.adminEmail || ''}
                onChange={e => update('adminEmail', e.target.value)}
                className="ui-input w-full"
                placeholder="notifications@school.com"
              />
              <p className="text-xs text-slate-400 mt-1">The primary email address where summary notifications and tour alerts will be sent.</p>
            </div>

            <div className="border-t border-slate-100 pt-6">
              <p className="text-xs text-slate-500 mb-4 font-bold uppercase tracking-wide flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                Inquiry Follow-up Templates
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">SMS Follow-up</label>
                  <textarea rows={6} value={settings.smsTemplate} onChange={e => update('smsTemplate', e.target.value)} className="ui-input w-full text-sm" placeholder="Hi {parent_name}, thanks for your interest in {school_name}! Please complete our enrollment inquiry form: {form_link}" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Email Follow-up</label>
                  <textarea rows={6} value={settings.emailTemplate} onChange={e => update('emailTemplate', e.target.value)} className="ui-input w-full text-sm leading-relaxed" placeholder="Dear {parent_name}, Thank you for your interest in {school_name}..." />
                </div>
              </div>

              <p className="text-xs text-slate-500 mb-4 font-bold uppercase tracking-wide flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Tour Confirmation Templates
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">SMS Confirmation & Reminder</label>
                  <textarea rows={6} value={settings.tourReminderSmsTemplate || ''} onChange={e => update('tourReminderSmsTemplate', e.target.value)} className="ui-input w-full text-sm" placeholder="Hi {parent_name}, your tour at {school_name} is confirmed for {tour_date}." />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Email Confirmation</label>
                  <textarea rows={6} value={settings.tourConfirmationEmailTemplate || ''} onChange={e => update('tourConfirmationEmailTemplate', e.target.value)} className="ui-input w-full text-sm leading-relaxed" placeholder="Dear {parent_name}, your tour at {school_name} is confirmed for {tour_date}..." />
                </div>
              </div>
            </div>
          </div>
        )}


        {/* Bottom save button */}
        <div className="flex justify-end pb-8">
          <button
            type="button"
            onClick={saveSettings}
            disabled={saving}
            className="ui-button-primary flex items-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? t('saving') : t('save_settings')}
          </button>
        </div>

      </div>
    </div>
  );
};
