import { useState } from 'react';
import { Globe } from 'lucide-react';

export const SchoolSettings = () => {
  const [aiNumber, setAiNumber] = useState('+1 (555) 123-4567');
  const [routingNumber, setRoutingNumber] = useState('+1 (555) 123-4568');
  const [language, setLanguage] = useState<'EN' | 'ES'>('EN');
  const [script, setScript] = useState('Welcome to our school. How can I help you today?');

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
          Settings
        </h1>
        <p className="text-gray-600">Manage your school configuration</p>
      </div>
      
      <div className="space-y-6">
        {/* AI Phone Number */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">AI Phone Number</h2>
          <input
            type="text"
            value={aiNumber}
            onChange={(e) => setAiNumber(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white/50 backdrop-blur-sm"
            placeholder="Enter AI phone number"
          />
        </div>

        {/* Front Desk Routing Number */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Front Desk Routing Number</h2>
          <input
            type="text"
            value={routingNumber}
            onChange={(e) => setRoutingNumber(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white/50 backdrop-blur-sm"
            placeholder="Enter routing number"
          />
        </div>

        {/* Business Hours */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Business Hours</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <label className="w-32 text-sm font-medium text-gray-700">Monday - Friday</label>
              <input
                type="time"
                defaultValue="09:00"
                className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white/50 backdrop-blur-sm"
              />
              <span className="text-gray-500 font-medium">to</span>
              <input
                type="time"
                defaultValue="17:00"
                className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white/50 backdrop-blur-sm"
              />
            </div>
          </div>
        </div>

        {/* Language Toggle */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-bold text-gray-900">Language</h2>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setLanguage('EN')}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  language === 'EN'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/40 hover:bg-blue-700'
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-200'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setLanguage('ES')}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  language === 'ES'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/40 hover:bg-blue-700'
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-200'
                }`}
              >
                Español
              </button>
            </div>
          </div>
        </div>

        {/* Script Editor */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Script Editor</h2>
          <textarea
            value={script}
            onChange={(e) => setScript(e.target.value)}
            rows={6}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white/50 backdrop-blur-sm resize-none"
            placeholder="Enter your AI script..."
          />
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/40 hover:shadow-xl">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

