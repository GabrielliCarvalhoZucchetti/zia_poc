
import React from 'react';
import { Icons } from '../constants';

const MonitoringPage: React.FC = () => {
  const [apiKeys, setApiKeys] = React.useState([
    { name: 'Produção - ERP', key: 'sk-...4a2b', status: 'Ativa', usage: 'High' },
    { name: 'Dev - Sandbox', key: 'sk-...9f1e', status: 'Ativa', usage: 'Low' },
    { name: 'Testes - QA', key: 'sk-...3c8d', status: 'Inativa', usage: 'None' },
  ]);

  const [showModal, setShowModal] = React.useState(false);
  const [newKeyName, setNewKeyName] = React.useState('');

  const handleGenerateKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    const newKey = {
      name: newKeyName,
      key: `sk-...${Math.random().toString(36).substr(2, 4)}`,
      status: 'Ativa',
      usage: 'None'
    };

    setApiKeys([newKey, ...apiKeys]);
    setNewKeyName('');
    setShowModal(false);
  };

  const tokenUsage = [
    { agent: 'Assistente Geral', tokens: '1.2M', cost: '$0.12' },
    { agent: 'Gestor de Base', tokens: '850K', cost: '$0.08' },
    { agent: 'Auditor de Sistema', tokens: '420K', cost: '$0.04' },
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Monitoramento</h1>
        <p className="text-slate-500">Visão geral do consumo de recursos e chaves de API.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Token Consumption Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-sky-100 text-sky-600 rounded-xl flex items-center justify-center">
              <Icons.Monitoring />
            </div>
            <h2 className="text-lg font-bold text-slate-800">Consumo de Tokens</h2>
          </div>
          
          <div className="space-y-4">
            {tokenUsage.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div>
                  <div className="text-sm font-bold text-slate-700">{item.agent}</div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Acumulado</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-sky-600">{item.tokens}</div>
                  <div className="text-[10px] text-slate-400 font-medium">{item.cost}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* API Keys Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                <Icons.Settings />
              </div>
              <h2 className="text-lg font-bold text-slate-800">Chaves de API</h2>
            </div>
            <button 
              onClick={() => setShowModal(true)}
              className="text-[10px] font-bold bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
            >
              Gerar Nova Chave
            </button>
          </div>

          <div className="space-y-4">
            {apiKeys.map((key, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div>
                  <div className="text-sm font-bold text-slate-700">{key.name}</div>
                  <div className="text-[10px] font-mono text-slate-400">{key.key}</div>
                </div>
                <div className="text-right">
                  <div className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-tighter ${
                    key.status === 'Ativa' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'
                  }`}>
                    {key.status}
                  </div>
                  <div className="text-[9px] text-slate-400 mt-1 font-medium">Uso: {key.usage}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal para Gerar Chave */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl relative z-10 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">Gerar Nova API Key</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <form onSubmit={handleGenerateKey} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Nome da Chave</label>
                <input 
                  autoFocus
                  required
                  value={newKeyName}
                  onChange={e => setNewKeyName(e.target.value)}
                  type="text" 
                  placeholder="Ex: Integração Mobile" 
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-all">Cancelar</button>
                <button type="submit" className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-100">Gerar Chave</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default MonitoringPage;
