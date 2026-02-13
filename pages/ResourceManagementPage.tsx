
import React, { useState } from 'react';
import { Resource, ResourceType, AgentType, UserRole } from '../types';
import { Icons } from '../constants';

interface ResourceManagementPageProps {
  resources: Resource[];
  onCreateResource: (resource: Omit<Resource, 'id' | 'createdAt'>) => void;
  onDeleteResource: (id: string) => void;
}

const ResourceManagementPage: React.FC<ResourceManagementPageProps> = ({ 
  resources, 
  onCreateResource, 
  onDeleteResource 
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createType, setCreateType] = useState<ResourceType>(ResourceType.AGENT);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [agentType, setAgentType] = useState<AgentType>(AgentType.READING);
  const [requiredRole, setRequiredRole] = useState<UserRole>(UserRole.BASIC);
  const [prompt, setPrompt] = useState('');
  const [icon, setIcon] = useState('🤖');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateResource({
      name,
      description,
      type: createType,
      agentType: createType === ResourceType.AGENT ? agentType : undefined,
      requiredRole,
      prompt,
      icon
    });
    setShowCreateModal(false);
    resetForm();
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setPrompt('');
    setIcon('🤖');
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Gestão de Recursos</h1>
          <p className="text-slate-500">Crie e configure agentes de IA, assistentes e bancos de documentos vetorizados.</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="bg-sky-600 hover:bg-sky-700 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 shadow-lg shadow-sky-200 transition-all"
        >
          <Icons.Plus />
          Novo Recurso
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        {[
          { label: 'Total Recursos', value: resources.length, icon: <Icons.Search />, color: 'bg-blue-500' },
          { label: 'Agentes Ativos', value: resources.filter(r => r.type === ResourceType.AGENT).length, icon: <Icons.AgentBuilder />, color: 'bg-indigo-500' },
          { label: 'Documentação', value: resources.filter(r => r.type === ResourceType.DOCUMENTATION).length, icon: <Icons.Documentation />, color: 'bg-emerald-500' },
          { label: 'Apenas Admin', value: resources.filter(r => r.requiredRole === UserRole.ADMINISTRATOR).length, icon: <Icons.Settings />, color: 'bg-amber-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 ${stat.color} text-white rounded-xl flex items-center justify-center`}>
              {stat.icon}
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800">{stat.value}</div>
              <div className="text-xs font-semibold text-slate-400 uppercase">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <h2 className="font-bold text-slate-700">Recursos Existentes</h2>
          <div className="flex gap-2">
            <input type="text" placeholder="Pesquisar..." className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500" />
          </div>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
              <th className="px-6 py-4">Recurso</th>
              <th className="px-6 py-4">Tipo / Classe</th>
              <th className="px-6 py-4">Nível de Permissão</th>
              <th className="px-6 py-4">Criado em</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {resources.map((res) => (
              <tr key={res.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{res.icon}</span>
                    <div>
                      <div className="text-sm font-bold text-slate-800">{res.name}</div>
                      <div className="text-xs text-slate-400 max-w-xs truncate">{res.description}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded w-fit mb-1 ${
                      res.type === ResourceType.AGENT ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'
                    }`}>
                      {res.type === ResourceType.AGENT ? 'Agente' : 'Documento'}
                    </span>
                    {res.agentType && (
                      <span className="text-[10px] text-slate-500 font-medium">Classe: {res.agentType}</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded w-fit ${
                    res.requiredRole === UserRole.ADMINISTRATOR ? 'bg-rose-50 text-rose-600' : 
                    res.requiredRole === UserRole.ADVANCED ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-600'
                  }`}>
                    {res.requiredRole}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs text-slate-400">{res.createdAt}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-2 text-slate-400 hover:text-sky-600 transition-colors"><Icons.Edit /></button>
                    <button 
                      onClick={() => onDeleteResource(res.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                    >
                      <Icons.Trash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowCreateModal(false)}></div>
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800">Novo Recurso ZIA</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto">
              <div className="flex gap-4 p-1 bg-slate-100 rounded-xl mb-4">
                <button 
                  type="button"
                  onClick={() => setCreateType(ResourceType.AGENT)}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${createType === ResourceType.AGENT ? 'bg-white shadow text-sky-600' : 'text-slate-500'}`}
                >
                  Agente / Assistente
                </button>
                <button 
                  type="button"
                  onClick={() => setCreateType(ResourceType.DOCUMENTATION)}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${createType === ResourceType.DOCUMENTATION ? 'bg-white shadow text-sky-600' : 'text-slate-500'}`}
                >
                  Documentação
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Nome do Recurso</label>
                  <input required value={name} onChange={e => setName(e.target.value)} type="text" placeholder="Ex: Assistente de Vendas" className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Ícone (Emoji)</label>
                  <input value={icon} onChange={e => setIcon(e.target.value)} type="text" className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Descrição</label>
                <textarea required value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder="Breve explicação do propósito deste recurso..." className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"></textarea>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {createType === ResourceType.AGENT && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Classe do Agente</label>
                    <select value={agentType} onChange={e => setAgentType(e.target.value as AgentType)} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white">
                      <option value={AgentType.READING}>Leitura</option>
                      <option value={AgentType.WRITING}>Escrita</option>
                      <option value={AgentType.INTERPRETATION}>Interpretação</option>
                      <option value={AgentType.ACTION}>Ação</option>
                    </select>
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Permissão Mínima</label>
                  <select value={requiredRole} onChange={e => setRequiredRole(e.target.value as UserRole)} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white">
                    <option value={UserRole.BASIC}>Básico</option>
                    <option value={UserRole.INTERMEDIATE}>Intermediário</option>
                    <option value={UserRole.ADVANCED}>Avançado</option>
                    <option value={UserRole.ADMINISTRATOR}>Administrador</option>
                  </select>
                </div>
              </div>

              {createType === ResourceType.AGENT ? (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Prompt do Sistema / Instruções</label>
                  <textarea value={prompt} onChange={e => setPrompt(e.target.value)} rows={4} placeholder="Defina a personalidade e restrições do agente..." className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"></textarea>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Upload de Documentos (Simulado)</label>
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-slate-400 hover:border-sky-400 transition-colors cursor-pointer">
                    <Icons.Plus />
                    <span className="text-xs font-semibold mt-2">Clique ou arraste arquivos para vetorização (.pdf, .txt, .csv)</span>
                  </div>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 py-3 px-4 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-all">Cancelar</button>
                <button type="submit" className="flex-1 py-3 px-4 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-sky-100">Criar Recurso</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceManagementPage;
