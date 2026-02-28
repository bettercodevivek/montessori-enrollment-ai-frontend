import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, Loader2, Save, FileText, CheckCircle, AlertCircle, GripVertical } from 'lucide-react';
import api from '../../api/axios';
import type { FormQuestion } from '../../types';

export const SchoolForms = () => {
  const { t } = useTranslation();
  const [questions, setQuestions] = useState<FormQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchForms = async () => {
      try {
        const res = await api.get('/school/forms');
        setQuestions(res.data);
      } catch (err) {
        console.error('Failed to load forms:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchForms();
  }, []);

  const addQuestion = () => {
    const newQuestion: FormQuestion = {
      id: Date.now().toString(),
      question: '',
      required: false,
    };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const updateQuestion = (id: string, field: keyof FormQuestion, value: string | boolean) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, [field]: value } : q))
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post('/school/forms', { questions });
      setSuccess(t('form_saved'));
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      console.error('Failed to save forms:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-3">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
        <p className="text-slate-500 text-sm">{t('loading')}</p>
      </div>
    );
  }

  return (
    <div className="animate-soft max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{t('inquiry_form')}</h1>
          <p className="text-sm text-slate-500">{t('inquiry_form_desc')}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={addQuestion} className="ui-button-secondary gap-2">
            <Plus className="w-4 h-4" />
            {t('add_question')}
          </button>
          <button onClick={handleSave} disabled={saving} className="ui-button-primary gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? t('saving') : t('save')}
          </button>
        </div>
      </div>

      {success && (
        <div className="mb-6 bg-emerald-50 text-emerald-700 px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2 border border-emerald-200">
          <CheckCircle className="w-4 h-4" />
          {success}
        </div>
      )}

      <div className="space-y-6">
        {questions.map((question, index) => (
          <div
            key={question.id}
            className="bg-white border border-slate-200 rounded-2xl p-8 hover:border-slate-300 transition-all shadow-sm group"
          >
            <div className="flex items-start gap-6">
              <div className="flex flex-col items-center gap-2 pt-2">
                <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-100">
                  <span className="text-xs font-bold text-slate-500">{index + 1}</span>
                </div>
                <div className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 transition-colors">
                  <GripVertical className="w-4 h-4" />
                </div>
              </div>

              <div className="flex-1 space-y-6">
                <div className="relative group/input">
                  <input
                    type="text"
                    value={question.question}
                    onChange={(e) => updateQuestion(question.id, 'question', e.target.value)}
                    placeholder={t('question_placeholder')}
                    className="ui-input rounded-lg p-3 text-sm text-slate-700 bg-white border-slate-200 focus:border-primary-500"
                  />
                  <FileText className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                  <div className="flex items-center gap-8">
                    <label className="flex items-center gap-3 cursor-pointer group/toggle">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={question.required}
                          onChange={(e) => updateQuestion(question.id, 'required', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:bg-emerald-500 transition-all"></div>
                        <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full peer-checked:translate-x-4 transition-transform"></div>
                      </div>
                      <span className="text-xs text-slate-500">{t('required')}</span>
                    </label>
                  </div>

                  <button
                    onClick={() => removeQuestion(question.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {t('remove')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {questions.length === 0 && (
          <div className="bg-white border border-dashed border-slate-200 rounded-xl p-12 text-center">
            <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-1">{t('no_questions_yet')}</h3>
            <p className="text-slate-500 text-sm mb-6">{t('no_questions_desc')}</p>
            <button onClick={addQuestion} className="ui-button-primary">
              {t('add_first_question')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
