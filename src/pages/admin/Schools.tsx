import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StatusBadge } from '../../components/StatusBadge';
import api from '../../api/axios';
import { Plus, X, Loader2, Trash2, CheckCircle } from 'lucide-react';

interface SchoolData {
  id: string;
  name: string;
  aiNumber: string;
  routingNumber: string;
  status: 'active' | 'inactive';
  calls: number;
  tours: number;
}

export const AdminSchools = () => {
  const { t } = useTranslation();
  const [schools, setSchools] = useState<SchoolData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', referrerSchoolId: '' });
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
      await api.post('/admin/schools', { ...form, aiNumber: '', routingNumber: '' });
      setSuccess(t('school_created'));
      setShowModal(false);
      setForm({ name: '', email: '', password: '', referrerSchoolId: '' });
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
      setShowModal(false);
      await fetchSchools();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || t('create_school_failed');
      setError(msg);
    }
  };

  const handleToggleStatus = async (id: string, status: string) => {
    setError('');
    try {
      await api.put(`/admin/schools/${id}`, { status: status === 'active' ? 'inactive' : 'active' });
      await fetchSchools();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to update status.';
      setError(msg);
    }
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
              <th className="px-5 py-3">{t('routing_number')}</th>
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
                <td className="px-5 py-3 text-xs text-slate-600 font-mono">{school.aiNumber || '-'}</td>
                <td className="px-5 py-3 text-xs text-slate-600 font-mono">{school.routingNumber || '-'}</td>
                <td className="px-5 py-3">
                  <button onClick={() => handleToggleStatus(school.id, school.status)}>
                    <StatusBadge status={school.status} />
                  </button>
                </td>
                <td className="px-5 py-3 text-sm text-slate-700">{school.calls}</td>
                <td className="px-5 py-3 text-sm text-slate-700">{school.tours}</td>
                <td className="px-5 py-3 text-right">
                  <button
                    onClick={() => handleDelete(school.id, school.name)}
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

      {/* Create Modal */}
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
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('school_name')}</label>
                  <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="ui-input" placeholder="Sunshine Montessori" required />
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
    </div>
  );
};
