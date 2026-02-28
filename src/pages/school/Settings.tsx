import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Save, Loader2, Phone, MessageSquare, Clock, Globe, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../../api/axios';

interface SettingsData {
  aiNumber: string;
  routingNumber: string;
  escalationNumber: string;
  language: string;
  script: string;
  businessHoursStart: string;
  businessHoursEnd: string;
  twilioSid: string;
  twilioAuthToken: string;
  twilioPhoneNumber: string;
  smsAutoFollowup: boolean;
  emailAutoFollowup: boolean;
  smsTemplate: string;
  emailTemplate: string;
}

type Tab = 'agent' | 'twilio' | 'automation';

export const SchoolSettings = () => {
  const { t } = useTranslation();
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('agent');

  useEffect(() => {
    api.get('/school/settings')
      .then(res => setSettings(res.data))
      .catch(err => console.error('Failed to load settings:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);
    try {
      await api.put('/school/settings', settings);
      setStatus({ type: 'success', message: t('settings_saved') });
    } catch (err) {
      setStatus({ type: 'error', message: t('settings_save_failed') });
    } finally {
      setSaving(false);
      setTimeout(() => setStatus(null), 4000);
    }
  };

  const update = (field: keyof SettingsData, value: any) =>
    setSettings(prev => prev ? { ...prev, [field]: value } : prev);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
    </div>
  );

  if (!settings) return (
    <div className="text-center py-12 text-slate-500">{t('failed_to_load_settings')}</div>
  );

  const tabs: { id: Tab; label: string }[] = [
    { id: 'agent', label: t('tab_agent') },
    { id: 'twilio', label: t('tab_twilio') },
    { id: 'automation', label: t('tab_automation') },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{t('settings_title')}</h1>
          <p className="text-sm text-slate-500 mt-0.5">{t('settings_desc')}</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="ui-button-primary flex items-center gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? t('saving') : t('save_settings')}
        </button>
      </div>

      {status && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium mb-6 border ${status.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
          {status.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {status.message}
        </div>
      )}

      {/* Tab nav */}
      <div className="flex border-b border-slate-200 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSave} className="space-y-6">

        {/* ── AI Agent & Routing tab ── */}
        {activeTab === 'agent' && (
          <>
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h2 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400" />
                Phone Routing
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('ai_phone_number')}</label>
                  <input
                    type="text"
                    value={settings.aiNumber}
                    onChange={e => update('aiNumber', e.target.value)}
                    className="ui-input w-full"
                    placeholder="+1 (555) 123-4567"
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
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h2 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                Business Hours & Language
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('opens_at')}</label>
                  <input
                    type="time"
                    value={settings.businessHoursStart}
                    onChange={e => update('businessHoursStart', e.target.value)}
                    className="ui-input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('closes_at')}</label>
                  <input
                    type="time"
                    value={settings.businessHoursEnd}
                    onChange={e => update('businessHoursEnd', e.target.value)}
                    className="ui-input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    <Globe className="w-3 h-3 inline mr-1" />
                    {t('language')}
                  </label>
                  <select
                    value={settings.language}
                    onChange={e => update('language', e.target.value)}
                    className="ui-input w-full bg-white"
                  >
                    <option value="en">{t('english')}</option>
                    <option value="es">{t('spanish')}</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h2 className="text-base font-semibold text-slate-900 mb-1">{t('ai_agent_script')}</h2>
              <p className="text-sm text-slate-500 mb-4">
                Write the exact script your AI agent follows during enrollment inquiry calls. Use {'{parent_name}'}, {'{school_name}'} as variables.
              </p>
              <textarea
                rows={10}
                value={settings.script}
                onChange={e => update('script', e.target.value)}
                className="ui-input w-full text-sm font-mono leading-relaxed"
                placeholder={t('script_placeholder')}
              />
            </div>
          </>
        )}

        {/* ── Twilio / SMS tab ── */}
        {activeTab === 'twilio' && (
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
                  <input
                    type="text"
                    value={settings.twilioSid}
                    onChange={e => update('twilioSid', e.target.value)}
                    className="ui-input w-full font-mono text-sm"
                    placeholder="ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('auth_token')}</label>
                  <input
                    type="password"
                    value={settings.twilioAuthToken}
                    onChange={e => update('twilioAuthToken', e.target.value)}
                    className="ui-input w-full font-mono text-sm"
                    placeholder="••••••••••••••••••••••••••••••••"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('twilio_phone_number')} <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={settings.twilioPhoneNumber}
                    onChange={e => update('twilioPhoneNumber', e.target.value)}
                    className="ui-input w-full"
                    placeholder="+15551234567"
                  />
                  <p className="text-xs text-slate-400 mt-1">{t('twilio_phone_help')}</p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── Automated Follow-ups tab ── */}
        {activeTab === 'automation' && (
          <>
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
                  <input
                    type="checkbox"
                    checked={settings.smsAutoFollowup}
                    onChange={e => update('smsAutoFollowup', e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <div>
                    <span className="text-sm font-medium text-slate-700">Send SMS follow-up after call</span>
                    <p className="text-xs text-slate-400">Requires Twilio credentials to be configured on the Twilio tab.</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.emailAutoFollowup}
                    onChange={e => update('emailAutoFollowup', e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <div>
                    <span className="text-sm font-medium text-slate-700">Send Email follow-up after call</span>
                    <p className="text-xs text-slate-400">Requires SMTP credentials configured in the server .env file.</p>
                  </div>
                </label>
              </div>

              <div className="border-t border-slate-100 pt-6">
                <p className="text-xs text-slate-400 mb-4 font-medium uppercase tracking-wide">Message Templates — use {'{parent_name}'}, {'{school_name}'}, {'{form_link}'}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">{t('sms_template')}</label>
                    <textarea
                      rows={7}
                      value={settings.smsTemplate}
                      onChange={e => update('smsTemplate', e.target.value)}
                      className="ui-input w-full text-sm"
                      placeholder="Hi {parent_name}, thanks for your interest in {school_name}! Please complete our enrollment inquiry form: {form_link}"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">{t('email_template')}</label>
                    <textarea
                      rows={7}
                      value={settings.emailTemplate}
                      onChange={e => update('emailTemplate', e.target.value)}
                      className="ui-input w-full text-sm"
                      placeholder="Dear {parent_name},&#10;&#10;Thank you for contacting {school_name}. Please complete the form: {form_link}&#10;&#10;Warm regards,&#10;{school_name} Team"
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </form>
    </div>
  );
};
