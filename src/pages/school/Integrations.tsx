import { StatusBadge } from '../../components/StatusBadge';
import { mockIntegrations } from '../../api/mockData';
import { Plug } from 'lucide-react';

export const SchoolIntegrations = () => {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
          Integrations
        </h1>
        <p className="text-gray-600">Connect your favorite tools and services</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockIntegrations.map((integration) => (
          <div key={integration.id} className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100/50 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center shadow-sm">
                  <Plug className="w-7 h-7 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{integration.name}</h3>
                  <p className="text-sm text-gray-500">
                    {integration.connectedAt && `Connected on ${integration.connectedAt}`}
                  </p>
                </div>
              </div>
              <StatusBadge 
                status={integration.connected ? 'connected' : 'not connected'} 
              />
            </div>
            <div className="mt-4">
              <button
                className={`w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  integration.connected
                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-200'
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/40 hover:shadow-xl'
                }`}
              >
                {integration.connected ? 'Disconnect' : 'Connect'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

