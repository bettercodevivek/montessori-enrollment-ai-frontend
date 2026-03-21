import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StatusBadge } from '../../components/StatusBadge';
import api from '../../api/axios';
import { Plus, X, Loader2, Trash2, CheckCircle, Pencil, Phone } from 'lucide-react';

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
  const [editForm, setEditForm] = useState({ name: '', address: '', elevenlabsAgentId: '', status: 'active' as 'active' | 'inactive', aiNumber: '' });
  const [saving, setSaving] = useState(false);

  // Phone Assignment Modal (Pooled)
  const [assignModalSchool, setAssignModalSchool] = useState<SchoolData | null>(null);
  const [availableNumbers, setAvailableNumbers] = useState<any[]>([]);
  const [selectedPhoneId, setSelectedPhoneId] = useState('');


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

  const fetchAvailableNumbers = async () => {
    try {
      const res = await api.get('/admin/phone-numbers');
      // Filter for unassigned numbers OR numbers assigned to this specific school
      const available = res.data.filter((n: any) => !n.schoolId || n.schoolId._id === assignModalSchool?.id);
      setAvailableNumbers(available);
    } catch (err) {
      console.error('Failed to fetch available numbers:', err);
    }
  };

  useEffect(() => { fetchSchools(); }, []);

  useEffect(() => {
    if (assignModalSchool) {
      fetchAvailableNumbers();
    }
  }, [assignModalSchool]);

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
    if (!assignModalSchool || !selectedPhoneId) return;
    setSaving(true);
    setError('');
    try {
      await api.post(`/admin/schools/${assignModalSchool.id}/assign-number`, { phoneNumberId: selectedPhoneId });
      setSuccess('Phone number assigned successfully!');
      setAssignModalSchool(null);
      setSelectedPhoneId('');
      await fetchSchools();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to assign number.');
    } finally {
      setSaving(false);
    }
  };


  const openPhoneModal = (school: SchoolData) => {
    setAssignModalSchool(school);
    setSelectedPhoneId('');
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
                  {school.aiNumber || '-'}
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
                  Agent ID is found in ElevenLabs. AI Number is assigned in the Phone Management tab.
                </p>
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

      {/* ── Phone Assignment Modal ── */}
      {assignModalSchool && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Assign AI Number</h2>
                <p className="text-sm text-slate-500 font-medium">{assignModalSchool.name}</p>
              </div>
              <button onClick={() => setAssignModalSchool(null)} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-50 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 text-red-700 text-sm rounded-xl font-medium">{error}</div>
            )}

            <form onSubmit={handleAssignPhone} className="space-y-5">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Available Numbers</label>
                <div className="relative">
                  <select
                    value={selectedPhoneId}
                    onChange={e => setSelectedPhoneId(e.target.value)}
                    className="ui-input h-12 pr-10 appearance-none bg-slate-50 border-slate-200 focus:bg-white"
                    required
                  >
                    <option value="">Select a number...</option>
                    {availableNumbers.map(n => (
                      <option key={n._id} value={n._id}>
                        {n.phone_number} ({n.label})
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                </div>
                {availableNumbers.length === 0 && (
                  <p className="mt-2 text-[11px] text-orange-600 font-semibold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                    No available numbers. Import some first in the Phone Management tab.
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setAssignModalSchool(null)} className="ui-button-secondary flex-1 h-11">Cancel</button>
                <button type="submit" disabled={saving || !selectedPhoneId} className="ui-button-primary flex-1 h-11 flex items-center justify-center gap-2 shadow-lg shadow-blue-200">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {saving ? 'Assigning…' : 'Assign Number'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
