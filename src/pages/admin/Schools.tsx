import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StatusBadge } from '../../components/StatusBadge';
import api from '../../api/axios';
import { Plus, X, Loader2, Trash2, CheckCircle, Pencil, Phone, PhoneOff } from 'lucide-react';

interface SchoolData {
  id: string;
  name: string;
  address: string;
  aiNumber: string;
  routingNumber: string;
  elevenlabsAgentId: string;
  status: 'active' | 'inactive';
  calls: number;
  tours: number;
  twilioSid: string;
  twilioAuthToken: string;
  twilioPhoneNumber: string;
}

const emptyCreateForm = { name: '', email: '', password: '', address: '', referrerSchoolId: '', elevenlabsAgentId: '', aiNumber: '' };

export const AdminSchools = () => {
  const { t } = useTranslation();
  const [schools, setSchools] = useState<SchoolData[]>([]);
  const [loading, setLoading] = useState(true);

  // Create modal
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(emptyCreateForm);

  // Edit modal
  const [editSchool, setEditSchool] = useState<SchoolData | null>(null);
  const [editForm, setEditForm] = useState({ name: '', address: '', elevenlabsAgentId: '', status: 'active' as 'active' | 'inactive', aiNumber: '', twilioSid: '', twilioAuthToken: '', twilioPhoneNumber: '' });
  const [saving, setSaving] = useState(false);

  // Phone Import Modal (formerly SIP)
  const [sipModalSchool, setSipModalSchool] = useState<SchoolData | null>(null);
  const [phoneForm, setPhoneForm] = useState({
    provider: 'sip_trunk' as 'sip_trunk' | 'twilio',
    phone_number: '',
    label: '',
    // SIP specific
    sip_address: 'sip.rtc.elevenlabs.io:5060',
    sip_username: '',
    sip_password: '',
    // Twilio specific
    twilio_sid: '',
    twilio_token: '',
  });


  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchSchools = async () => {
    try {
      const res = await api.get('/admin/schools');
      setSchools(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSchools(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError('');
    try {
      await api.post('/admin/schools', { ...form, routingNumber: '' });
      setSuccess(t('school_created'));
      setShowModal(false);
      setForm(emptyCreateForm);
      await fetchSchools();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || t('create_school_failed'));
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(t('delete_confirm', { name }))) return;
    setError('');
    try {
      await api.delete(`/admin/schools/${id}`);
      setSuccess(t('school_deleted'));
      await fetchSchools();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || t('create_school_failed');
      setError(msg);
    }
  };

  const openEdit = (school: SchoolData) => {
    setEditSchool(school);
    setEditForm({ 
      name: school.name || '', 
      address: (school as any).address || '', 
      elevenlabsAgentId: school.elevenlabsAgentId || '', 
      status: school.status, 
      aiNumber: school.aiNumber || '',
      twilioSid: school.twilioSid || '',
      twilioAuthToken: school.twilioAuthToken || '',
      twilioPhoneNumber: school.twilioPhoneNumber || '',
    });
    setError('');
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editSchool) return;
    setSaving(true);
    setError('');
    try {
      await api.put(`/admin/schools/${editSchool.id}`, {
        name: editForm.name,
        address: editForm.address,
        elevenlabsAgentId: editForm.elevenlabsAgentId,
        status: editForm.status,
        aiNumber: editForm.aiNumber,
        twilioSid: editForm.twilioSid,
        twilioAuthToken: editForm.twilioAuthToken,
        twilioPhoneNumber: editForm.twilioPhoneNumber,
      });
      setSuccess('School updated successfully!');
      setEditSchool(null);
      await fetchSchools();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update school.');
    } finally {
      setSaving(false);
    }
  };

  const handleAssignPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sipModalSchool) return;
    setSaving(true);
    setError('');
    try {
      let payload: any = {
        phone_number: phoneForm.phone_number,
        label: phoneForm.label || `${sipModalSchool.name} AI Line`,
      };

      if (phoneForm.provider === 'twilio') {
        payload.sid = phoneForm.twilio_sid;
        payload.token = phoneForm.twilio_token;
      } else {
        payload.provider = 'sip_trunk';
        payload.inbound_trunk_config = {
          address: phoneForm.sip_address,
          credentials: {
            username: phoneForm.sip_username,
            password: phoneForm.sip_password,
          }
        };
        payload.outbound_trunk_config = {
          address: phoneForm.sip_address,
          credentials: {
            username: phoneForm.sip_username,
            password: phoneForm.sip_password,
          }
        };
      }

      await api.post(`/admin/schools/${sipModalSchool.id}/phone-number`, payload);
      setSuccess('Phone number assigned successfully!');
      setSipModalSchool(null);
      await fetchSchools();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to assign phone number.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePhone = async (school: SchoolData) => {
    if (!confirm(`Are you sure you want to delete the phone number ${school.aiNumber} for ${school.name}? This will also remove it from ElevenLabs.`)) return;
    setSaving(true);
    setError('');
    try {
      await api.delete(`/admin/schools/${school.id}/phone-number`);
      setSuccess('Phone number deleted successfully!');
      await fetchSchools();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete phone number.');
    } finally {
      setSaving(false);
    }
  };

  const openPhoneModal = (school: SchoolData) => {
    setSipModalSchool(school);
    setPhoneForm({
      provider: 'sip_trunk',
      phone_number: school.aiNumber || '',
      label: `${school.name} AI Line`,
      sip_address: 'sip.rtc.elevenlabs.io:5060',
      sip_username: school.aiNumber || '',
      sip_password: '',
      twilio_sid: '',
      twilio_token: '',
    });
    setError('');
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{t('schools_title')}</h1>
          <p className="text-sm text-slate-500 mt-0.5">{t('schools_desc')}</p>
        </div>
        <button onClick={() => { setError(''); setShowModal(true); }} className="ui-button-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          {t('add_school')}
        </button>
      </div>

      {success && (
        <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 text-green-700 text-sm font-medium rounded-lg mb-4">
          <CheckCircle className="w-4 h-4" />
          {success}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm font-medium rounded-lg mb-4">
          {error}
          <button type="button" onClick={() => setError('')} className="ml-2 text-red-500 hover:text-red-700" aria-label="Dismiss">×</button>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs font-medium text-slate-500 border-b border-slate-100 bg-slate-50">
              <th className="px-5 py-3">{t('school_name')}</th>
              <th className="px-5 py-3">{t('ai_number')}</th>
              <th className="px-5 py-3">ElevenLabs Agent ID</th>
              <th className="px-5 py-3">{t('status')}</th>
              <th className="px-5 py-3">{t('total_calls')}</th>
              <th className="px-5 py-3">{t('tours_booked')}</th>
              <th className="px-5 py-3 text-right">{t('actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {schools.map((school) => (
              <tr key={school.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-5 py-3">
                  <p className="text-sm font-medium text-slate-900">{school.name}</p>
                  <p className="text-xs text-slate-400 font-mono">#{school.id.slice(-6)}</p>
                </td>
                <td className="px-5 py-3 text-xs text-slate-600 font-mono">
                  <div className="flex items-center gap-2">
                    {school.aiNumber || '-'}
                    {school.aiNumber && (
                      <button
                        onClick={() => handleDeletePhone(school)}
                        title="Delete phone number"
                        className="p-1 text-slate-300 hover:text-red-500 transition-colors"
                      >
                        <PhoneOff className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </td>
                <td className="px-5 py-3">
                  {school.elevenlabsAgentId ? (
                    <span className="text-xs text-slate-600 font-mono bg-slate-100 px-2 py-0.5 rounded">
                      {school.elevenlabsAgentId.length > 28
                        ? school.elevenlabsAgentId.slice(0, 28) + '…'
                        : school.elevenlabsAgentId}
                    </span>
                  ) : (
                    <span className="text-xs text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Not set
                    </span>
                  )}
                </td>
                <td className="px-5 py-3">
                  <StatusBadge status={school.status} />
                </td>
                <td className="px-5 py-3 text-sm text-slate-700">{school.calls}</td>
                <td className="px-5 py-3 text-sm text-slate-700">{school.tours}</td>
                <td className="px-5 py-3 text-right flex items-center justify-end gap-1">
                  <button
                    onClick={() => openPhoneModal(school)}
                    title="Assign Phone Number"
                    className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openEdit(school)}
                    title="Edit school"
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(school.id, school.name)}
                    title="Delete school"
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {schools.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-sm text-slate-400">
                  No schools created yet. Add your first school above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Create Modal ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-slate-900">{t('add_new_school')}</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">School Address</label>
                  <input type="text" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="ui-input" placeholder="123 Education Lane, City, ST" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('school_name')}</label>
                  <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="ui-input" placeholder="Sunshine Childcare" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('admin_email')}</label>
                  <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="ui-input" placeholder="admin@school.com" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t('password')}</label>
                <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="ui-input" placeholder={t('create_password')} required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">ElevenLabs Agent ID</label>
                  <input type="text" value={form.elevenlabsAgentId} onChange={e => setForm({ ...form, elevenlabsAgentId: e.target.value })} className="ui-input" placeholder="agent_xyz123..." />
                  <p className="text-xs text-slate-400 mt-1">Leave blank if not assigned.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">AI Phone Number</label>
                  <input type="text" value={form.aiNumber} onChange={e => setForm({ ...form, aiNumber: e.target.value })} className="ui-input" placeholder="+12223334444" />
                  <p className="text-xs text-slate-400 mt-1">The number parents will call.</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t('referred_by_optional')}</label>
                <select value={form.referrerSchoolId} onChange={e => setForm({ ...form, referrerSchoolId: e.target.value })} className="ui-input">
                  <option value="">{t('none')}</option>
                  {schools.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                <p className="text-xs text-slate-400 mt-1">{t('referral_code_hint')}</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="ui-button-secondary flex-1">{t('cancel')}</button>
                <button type="submit" disabled={creating} className="ui-button-primary flex-1 flex items-center justify-center gap-2">
                  {creating && <Loader2 className="w-4 h-4 animate-spin" />}
                  {creating ? t('creating') : t('create_school')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit Modal ── */}
      {editSchool && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Edit School</h2>
                <p className="text-sm text-slate-500 mt-0.5">{editSchool.name}</p>
              </div>
              <button onClick={() => setEditSchool(null)} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>
            )}

            <form onSubmit={handleEditSave} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">School Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                  className="ui-input"
                  placeholder="School Name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">School Address</label>
                <input
                  type="text"
                  value={editForm.address}
                  onChange={e => setEditForm({ ...editForm, address: e.target.value })}
                  className="ui-input"
                  placeholder="School Address"
                />
              </div>
              {/* Agent ID & AI Number */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">ElevenLabs Agent ID</label>
                  <input
                    type="text"
                    value={editForm.elevenlabsAgentId}
                    onChange={e => setEditForm({ ...editForm, elevenlabsAgentId: e.target.value })}
                    className="ui-input font-mono text-sm"
                    placeholder="agent_xyz123..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">AI Phone Number</label>
                  <input
                    type="text"
                    value={editForm.aiNumber}
                    onChange={e => setEditForm({ ...editForm, aiNumber: e.target.value })}
                    className="ui-input font-mono text-sm"
                    placeholder="+12223334444"
                  />
                </div>
                <p className="text-xs text-slate-400">
                  Agent ID is found in ElevenLabs. AI Number is the Twilio number.
                </p>
              </div>

              {/* Twilio Credentials */}
              <div className="border-t border-slate-100 pt-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>
                  Twilio / SMS Credentials
                </p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Account SID</label>
                    <input
                      type="text"
                      value={editForm.twilioSid}
                      onChange={e => setEditForm({ ...editForm, twilioSid: e.target.value })}
                      className="ui-input font-mono text-sm"
                      placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Auth Token</label>
                    <input
                      type="text"
                      value={editForm.twilioAuthToken}
                      onChange={e => setEditForm({ ...editForm, twilioAuthToken: e.target.value })}
                      className="ui-input font-mono text-sm"
                      placeholder="••••••••••••••••"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Twilio Phone Number</label>
                    <input
                      type="text"
                      value={editForm.twilioPhoneNumber}
                      onChange={e => setEditForm({ ...editForm, twilioPhoneNumber: e.target.value })}
                      className="ui-input font-mono text-sm"
                      placeholder="+15551234567"
                    />
                    <p className="text-xs text-slate-400 mt-1">SMS follow-ups are sent from this number.</p>
                  </div>
                </div>
              </div>

              {/* Status toggle */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">School Status</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setEditForm({ ...editForm, status: 'active' })}
                    className={`flex-1 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                      editForm.status === 'active'
                        ? 'bg-green-50 border-green-400 text-green-700'
                        : 'bg-white border-slate-200 text-slate-500 hover:border-green-300'
                    }`}
                  >
                    ✓ Active
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditForm({ ...editForm, status: 'inactive' })}
                    className={`flex-1 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                      editForm.status === 'inactive'
                        ? 'bg-red-50 border-red-400 text-red-700'
                        : 'bg-white border-slate-200 text-slate-500 hover:border-red-300'
                    }`}
                  >
                    ✕ Inactive
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setEditSchool(null)} className="ui-button-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="ui-button-primary flex-1 flex items-center justify-center gap-2">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Phone Import Modal ── */}
      {sipModalSchool && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Import Phone Number</h2>
                <p className="text-sm text-slate-500 mt-0.5">{sipModalSchool.name}</p>
              </div>
              <button onClick={() => setSipModalSchool(null)} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>
            )}

            <form onSubmit={handleAssignPhone} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Label</label>
                <input
                  type="text"
                  value={phoneForm.label}
                  onChange={e => setPhoneForm({ ...phoneForm, label: e.target.value })}
                  className="ui-input"
                  placeholder="e.g., Italy SIP Line"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phoneForm.phone_number}
                  onChange={e => setPhoneForm({ ...phoneForm, phone_number: e.target.value })}
                  className="ui-input font-mono"
                  placeholder="+390620199287"
                  required
                />
              </div>

              <div className="space-y-4 pt-2 border-t border-slate-50">
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Inbound Trunk Configuration</p>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Inbound SIP Address</label>
                    <input
                      type="text"
                      value={phoneForm.sip_address}
                      onChange={e => setPhoneForm({ ...phoneForm, sip_address: e.target.value })}
                      className="ui-input font-mono text-sm"
                      placeholder="sip.rtc.elevenlabs.io:5060"
                      required
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Default: sip.rtc.elevenlabs.io:5060</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                      <input
                        type="text"
                        value={phoneForm.sip_username}
                        onChange={e => setPhoneForm({ ...phoneForm, sip_username: e.target.value })}
                        className="ui-input font-mono text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                      <input
                        type="password"
                        value={phoneForm.sip_password}
                        onChange={e => setPhoneForm({ ...phoneForm, sip_password: e.target.value })}
                        className="ui-input font-mono text-sm"
                        required
                      />
                    </div>
                  </div>
                </div>


              <div className="flex gap-3 pt-3">
                <button type="button" onClick={() => setSipModalSchool(null)} className="ui-button-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="ui-button-primary bg-indigo-600 hover:bg-indigo-700 flex-1 flex items-center justify-center gap-2">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {saving ? 'Importing…' : 'Import Number'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
