
import React from 'react';
import { Icons } from '../constants';

const AuditLogsPage: React.FC = () => {
  const logs = [
    { id: 1, user: 'Joao Silva', action: 'Criação de Recurso', resource: 'Agente de Vendas', date: '2025-05-10 14:30:22', status: 'Sucesso' },
    { id: 2, user: 'Maria Souza', action: 'Consulta Vetorizada', resource: 'Doc Financeiro', date: '2025-05-10 14:35:10', status: 'Sucesso' },
    { id: 3, user: 'Carlos Ed', action: 'Execução de Rota', resource: 'Agente de Ação', date: '2025-05-10 15:00:05', status: 'Falha (Sem Permissão)' },
    { id: 4, user: 'Joao Silva', action: 'Alteração de Prompt', resource: 'General Assistant', date: '2025-05-10 15:20:45', status: 'Sucesso' },
    { id: 5, user: 'Sistema', action: 'Recalibração de Vetores', resource: 'Doc Jurídico', date: '2025-05-10 16:00:00', status: 'Sucesso' },
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
              <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
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
    </div>
  );
};

export default AuditLogsPage;
