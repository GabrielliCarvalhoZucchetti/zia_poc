
import React from 'react';
import { Icons } from '../constants';

const AuditLogsPage: React.FC = () => {
  const [selectedLog, setSelectedLog] = React.useState<any>(null);

  const logs = [
    { 
      id: 1, 
      user: 'Joao Silva', 
      action: 'Criação de Recurso', 
      resource: 'Agente de Vendas', 
      date: '2025-05-10 14:30:22', 
      status: 'Sucesso',
      details: {
        request: 'POST /api/resources',
        payload: '{"name": "Agente de Vendas", "type": "AGENT", "role": "BASIC"}',
        response: '{"id": "r1", "status": "created"}',
        ip: '192.168.1.45'
      }
    },
    { 
      id: 2, 
      user: 'Maria Souza', 
      action: 'Consulta Vetorizada', 
      resource: 'Doc Financeiro', 
      date: '2025-05-10 14:35:10', 
      status: 'Sucesso',
      details: {
        query: 'Qual o faturamento do Q1?',
        vectors_searched: 124,
        latency: '450ms',
        ip: '192.168.1.12'
      }
    },
    { 
      id: 3, 
      user: 'Carlos Ed', 
      action: 'Execução de Rota', 
      resource: 'Agente de Ação', 
      date: '2025-05-10 15:00:05', 
      status: 'Falha (Sem Permissão)',
      details: {
        error_code: 'ERR_AUTH_003',
        error_message: 'User Carlos Ed does not have ADMINISTRATOR role required for this action.',
        stack_trace: 'Error: Access Denied\n  at checkPermissions (auth.ts:45:12)\n  at executeAction (actionAgent.ts:112:5)\n  at handleRequest (server.ts:89:20)',
        request_id: 'req_9823475',
        ip: '10.0.0.5'
      }
    },
    { 
      id: 4, 
      user: 'Joao Silva', 
      action: 'Alteração de Prompt', 
      resource: 'General Assistant', 
      date: '2025-05-10 15:20:45', 
      status: 'Sucesso',
      details: {
        previous_prompt: 'Você é um assistente útil.',
        new_prompt: 'Você é um assistente especializado em Zucchetti.',
        ip: '192.168.1.45'
      }
    },
    { 
      id: 5, 
      user: 'Sistema', 
      action: 'Recalibração de Vetores', 
      resource: 'Doc Jurídico', 
      date: '2025-05-10 16:00:00', 
      status: 'Sucesso',
      details: {
        trigger: 'Scheduled Task',
        documents_processed: 45,
        new_vectors: 1204,
        status: 'completed'
      }
    },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Registro de Auditoria</h1>
          <p className="text-slate-500">Acompanhe todas as interações críticos e mudanças de permissionamento no sistema.</p>
        </div>
        <div className="flex gap-2">
           <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50">Exportar CSV</button>
           <button className="px-4 py-2 bg-sky-600 text-white rounded-lg text-xs font-bold hover:bg-sky-700">Atualizar Logs</button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
              <th className="px-6 py-4">Data/Hora</th>
              <th className="px-6 py-4">Usuário</th>
              <th className="px-6 py-4">Ação</th>
              <th className="px-6 py-4">Recurso</th>
              <th className="px-6 py-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {logs.map((log) => (
              <tr 
                key={log.id} 
                className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                onClick={() => setSelectedLog(log)}
              >
                <td className="px-6 py-4 text-xs font-mono text-slate-500">{log.date}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">{log.user[0]}</div>
                    <span className="text-sm font-medium text-slate-700">{log.user}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{log.action}</td>
                <td className="px-6 py-4 text-sm text-slate-600 font-medium">{log.resource}</td>
                <td className="px-6 py-4 text-right">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${log.status.includes('Sucesso') ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    {log.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de Detalhes Técnicos */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedLog(null)}></div>
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl relative z-10 overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Detalhes Técnicos do Log</h2>
                <p className="text-xs text-slate-500 mt-1">ID: {selectedLog.id} • {selectedLog.date}</p>
              </div>
              <button onClick={() => setSelectedLog(null)} className="text-slate-400 hover:text-slate-600">
                <Icons.X />
              </button>
            </div>
            
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Resumo */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Ação</div>
                  <div className="text-sm font-semibold text-slate-700">{selectedLog.action}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Status</div>
                  <div className={`text-sm font-bold ${selectedLog.status.includes('Sucesso') ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {selectedLog.status}
                  </div>
                </div>
              </div>

              {/* Detalhes JSON */}
              <div className="space-y-2">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Payload / Contexto Técnico</div>
                <div className="bg-slate-900 rounded-xl p-4 overflow-x-auto">
                  <pre className="text-xs font-mono text-sky-400 leading-relaxed">
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              </div>

              {/* Stack Trace se for erro */}
              {selectedLog.details.stack_trace && (
                <div className="space-y-2">
                  <div className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">Stack Trace</div>
                  <div className="bg-rose-950 rounded-xl p-4 overflow-x-auto border border-rose-900/50">
                    <pre className="text-[10px] font-mono text-rose-200 leading-relaxed">
                      {selectedLog.details.stack_trace}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button 
                onClick={() => setSelectedLog(null)}
                className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-all"
              >
                Fechar Detalhes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogsPage;
