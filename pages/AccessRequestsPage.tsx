
import React from 'react';
import { AccessRequest, UserRole } from '../types';
import { Icons } from '../constants';

interface AccessRequestsPageProps {
  requests: AccessRequest[];
  onApprove: (requestId: string) => void;
  onReject: (requestId: string) => void;
}

const AccessRequestsPage: React.FC<AccessRequestsPageProps> = ({ requests, onApprove, onReject }) => {
  const pendingRequests = requests.filter(r => r.status === 'PENDING');
  const historyRequests = requests.filter(r => r.status !== 'PENDING');

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Solicitações de Acesso</h1>
          <p className="text-slate-500">Gerencie pedidos de usuários para acessar agentes e recursos restritos.</p>
        </div>
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-100 px-4 py-2 rounded-xl">
          <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
          <span className="text-xs font-bold text-amber-700">{pendingRequests.length} Pendentes</span>
        </div>
      </div>

      {/* Lista de Pendentes */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Solicitações Pendentes</h2>
        {pendingRequests.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-12 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-4">
              <Icons.Check />
            </div>
            <p className="text-slate-500 font-medium">Tudo em dia! Nenhuma solicitação pendente.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingRequests.map(req => (
              <div key={req.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <img src={req.userAvatar} alt={req.userName} className="w-10 h-10 rounded-full border-2 border-slate-50" />
                    <div>
                      <div className="text-sm font-bold text-slate-800">{req.userName}</div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 font-medium">{req.timestamp}</span>
                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                        <span className="text-[10px] font-bold text-sky-600 uppercase">{req.userBU}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs font-bold px-2 py-0.5 bg-amber-50 text-amber-600 rounded uppercase">Pendente</div>
                </div>
                
                <div className="bg-slate-50 rounded-xl p-3 mb-4 border border-slate-100">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-1">
                    {req.resourceCategory === 'Promoção' ? 'Solicitou promoção de:' : 'Solicitou acesso a:'}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      {req.resourceName}
                    </div>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      req.resourceCategory === 'Promoção' ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {req.resourceCategory}
                    </span>
                  </div>
                </div>

                {req.requiresDoubleApproval && (
                  <div className="mb-4 space-y-2">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status da Aprovação Dupla</div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className={`p-2 rounded-lg border text-center transition-all ${req.ownerApproved ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                        <div className="text-[8px] font-bold uppercase">Gestor do Recurso</div>
                        <div className="text-[10px] font-medium truncate">{req.resourceOwnerEmail || 'Pendente'}</div>
                        {req.ownerApproved && <div className="text-[8px] font-bold mt-1 text-emerald-500">APROVADO</div>}
                      </div>
                      <div className={`p-2 rounded-lg border text-center transition-all ${req.iaTeamApproved ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                        <div className="text-[8px] font-bold uppercase">Time de IA</div>
                        <div className="text-[10px] font-medium">ia.team@zucchetti.com</div>
                        {req.iaTeamApproved && <div className="text-[8px] font-bold mt-1 text-emerald-500">APROVADO</div>}
                      </div>
                    </div>
                  </div>
                )}

                {req.resourceCategory === 'Promoção' && (
                  <div className="mb-4 p-3 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center gap-2">
                    <Icons.Settings className="w-3 h-3 text-indigo-600" />
                    <div className="text-[10px] font-bold text-indigo-800">Aprovação irá criar task no backlog do Jira</div>
                  </div>
                )}

                {req.reason && (
                  <div className="text-xs text-slate-500 italic mb-4 line-clamp-2">
                    "{req.reason}"
                  </div>
                )}

                <div className="flex gap-2">
                  <button 
                    onClick={() => onReject(req.id)}
                    className="flex-1 py-2 text-xs font-bold text-slate-600 border border-slate-200 rounded-lg hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all"
                  >
                    Recusar
                  </button>
                  <button 
                    onClick={() => onApprove(req.id)}
                    className="flex-1 py-2 text-xs font-bold text-white bg-sky-600 rounded-lg hover:bg-sky-700 transition-all shadow-lg shadow-sky-100"
                  >
                    {req.requiresDoubleApproval 
                      ? (!req.ownerApproved ? 'Aprovar (Gestor)' : 'Aprovar (IA)') 
                      : 'Aprovar'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Histórico Recente */}
      {historyRequests.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Histórico Recente</h2>
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                  <th className="px-6 py-4">Usuário / BU</th>
                  <th className="px-6 py-4">Recurso / Categoria</th>
                  <th className="px-6 py-4">Data</th>
                  <th className="px-6 py-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {historyRequests.map(req => (
                  <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <img src={req.userAvatar} alt={req.userName} className="w-6 h-6 rounded-full" />
                        <div>
                          <div className="text-sm font-medium text-slate-700">{req.userName}</div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase">{req.userBU}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-600 font-medium">{req.resourceName}</div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">{req.resourceCategory}</span>
                        {req.requiresDoubleApproval && (
                          <span className="text-[9px] font-bold text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-100">
                            DUPLA APROVAÇÃO
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-500">{req.timestamp}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        req.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                      }`}>
                        {req.status === 'APPROVED' ? 'Aprovado' : 'Recusado'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccessRequestsPage;
