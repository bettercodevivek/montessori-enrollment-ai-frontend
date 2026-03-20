import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';
import { Plus, X, Loader2, Trash2, Phone, ShieldCheck, Globe } from 'lucide-react';

interface PhoneNumber {
  _id: string;
  phone_number: string;
  phone_number_id: string;
  provider: 'sip_trunk' | 'twilio';
  label: string;
  schoolId: { _id: string; name: string } | null;
  createdAt: string;
}

export const AdminPhoneNumbers = () => {
  useTranslation();
  const [numbers, setNumbers] = useState<PhoneNumber[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    provider: 'sip_trunk' as 'sip_trunk' | 'twilio',
    phone_number: '',
    label: '',
    // SIP
    sip_address: 'sip.rtc.elevenlabs.io:5060',
    sip_username: '',
    sip_password: '',
    // Twilio
    sid: '',
    token: '',
  });

  const fetchNumbers = async () => {
    try {
      const res = await api.get('/admin/phone-numbers');
      setNumbers(res.data);
    } catch (err) {
      console.error('Failed to fetch numbers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNumbers(); }, []);

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    setImporting(true);
    setError('');
    try {
      await api.post('/admin/phone-numbers', form);
      setSuccess('Phone number imported successfully!');
      setShowModal(false);
      setForm({ ...form, phone_number: '', label: '', sip_username: '', sip_password: '', sid: '', token: '' });
      await fetchNumbers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to import number.');
    } finally {
      setImporting(false);
    }
  };

  const handleDelete = async (id: string, number: string) => {
    if (!confirm(`Are you sure you want to delete ${number}? This will also unassign it from any school.`)) return;
    try {
      await api.delete(`/admin/phone-numbers/${id}`);
      setSuccess('Number deleted successfully');
      await fetchNumbers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete number.');
    }
  };

  return (
    <div className="animate-soft">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Phone Management</h1>
          <p className="text-sm text-slate-500 mt-1">Import and manage all AI phone numbers globally.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="ui-button-primary gap-2">
          <Plus className="w-4 h-4" />
          Import Number
        </button>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-center gap-3 animate-slide-in">
          <ShieldCheck className="w-5 h-5" />
          <span className="text-sm font-medium">{success}</span>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 gap-3 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-slate-500 text-sm">Loading phone numbers...</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Number & Label</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Provider</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Assignment</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {numbers.map((num) => (
                <tr key={num._id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                        <Phone className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{num.phone_number}</p>
                        <p className="text-xs text-slate-500">{num.label}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      num.provider === 'twilio' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                    }`}>
                      {num.provider === 'twilio' ? 'Twilio' : 'SIP Trunk'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {num.schoolId ? (
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        <span className="text-sm text-slate-600 font-medium">{num.schoolId.name}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                        <span className="text-sm text-slate-400 italic font-medium">Available</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleDelete(num._id, num.phone_number)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {numbers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Globe className="w-10 h-10 text-slate-200" />
                      <p className="text-slate-500 text-sm">No phone numbers imported yet.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Import New Number</h2>
              <button onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-50 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 text-red-700 text-sm rounded-xl font-medium">{error}</div>
            )}

            <form onSubmit={handleImport} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Label</label>
                <input
                  type="text"
                  value={form.label}
                  onChange={e => setForm({ ...form, label: e.target.value })}
                  className="ui-input h-11"
                  placeholder="e.g., Marketing AI Line"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Phone Number</label>
                <input
                  type="text"
                  value={form.phone_number}
                  onChange={e => setForm({ ...form, phone_number: e.target.value })}
                  className="ui-input h-11 font-mono text-sm"
                  placeholder="+14155551234"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Provider</label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                  {(['sip_trunk', 'twilio'] as const).map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setForm({ ...form, provider: p })}
                      className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                        form.provider === p ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      {p === 'sip_trunk' ? 'SIP Trunk' : 'Twilio'}
                    </button>
                  ))}
                </div>
              </div>

              {form.provider === 'sip_trunk' ? (
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Inbound SIP Address</label>
                    <input
                      type="text"
                      value={form.sip_address}
                      onChange={e => setForm({ ...form, sip_address: e.target.value })}
                      className="ui-input text-sm h-11"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                      <input
                        type="text"
                        value={form.sip_username}
                        onChange={e => setForm({ ...form, sip_username: e.target.value })}
                        className="ui-input text-sm h-11"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                      <input
                        type="password"
                        value={form.sip_password}
                        onChange={e => setForm({ ...form, sip_password: e.target.value })}
                        className="ui-input text-sm h-11"
                        required
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Account SID</label>
                    <input
                      type="text"
                      value={form.sid}
                      onChange={e => setForm({ ...form, sid: e.target.value })}
                      className="ui-input text-sm h-11 lowercase"
                      placeholder="AC..."
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Auth Token</label>
                    <input
                      type="password"
                      value={form.token}
                      onChange={e => setForm({ ...form, token: e.target.value })}
                      className="ui-input text-sm h-11"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-6 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)} className="ui-button-secondary flex-1 h-11">Cancel</button>
                <button type="submit" disabled={importing} className="ui-button-primary flex-1 h-11 flex items-center justify-center gap-2">
                  {importing && <Loader2 className="w-4 h-4 animate-spin" />}
                  {importing ? 'Importing…' : 'Import Number'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
