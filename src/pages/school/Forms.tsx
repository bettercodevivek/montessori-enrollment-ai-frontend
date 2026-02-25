import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { FormQuestion } from '../../types';

export const SchoolForms = () => {
  const [questions, setQuestions] = useState<FormQuestion[]>([
    { id: '1', question: 'What is your child\'s name?', required: true },
    { id: '2', question: 'What is your preferred contact method?', required: false },
  ]);

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

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
            Forms
          </h1>
          <p className="text-gray-600">Build dynamic forms for your leads</p>
        </div>
        <button
          onClick={addQuestion}
          className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/40 hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          Add Question
        </button>
      </div>

      <div className="space-y-4">
        {questions.map((question) => (
          <div
            key={question.id}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={question.question}
                  onChange={(e) => updateQuestion(question.id, 'question', e.target.value)}
                  placeholder="Enter question..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white/50 backdrop-blur-sm"
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={question.required}
                    onChange={(e) => updateQuestion(question.id, 'required', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Required</span>
                </label>
                <button
                  onClick={() => removeQuestion(question.id)}
                  className="p-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {questions.length === 0 && (
        <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-lg">
          <p className="text-gray-500">No questions yet. Click "Add Question" to get started.</p>
        </div>
      )}
    </div>
  );
};

