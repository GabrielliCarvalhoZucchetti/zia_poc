
import React from 'react';
import { Project } from '../types';
import { Icons } from '../constants';

const LabPage: React.FC = () => {
  const projects: Project[] = [
    { id: '1', title: 'Agente de Atendimento ao Cliente', status: 'IN_PROGRESS', description: 'Desenvolvimento do agente de suporte vetorizado para o produto ClippPro.', scope: 'Interno', metrics: '95% acurácia', deadline: '2025-05-15', user: 'Joao Silva' },
    { id: '2', title: 'Pipeline de Extração de Dados', status: 'TODO', description: 'Automatização da extração de PDFs para relatórios financeiros.', scope: 'Financeiro', metrics: 'Tempo economizado', deadline: '2025-06-01', user: 'Maria Souza' },
    { id: '3', title: 'Otimização de Prompts v2', status: 'REVIEW', description: 'Testando novas instruções de sistema para precisão de raciocínio.', scope: 'Global', metrics: 'Tokens/seg', deadline: '2025-04-20', user: 'Joao Silva' },
    { id: '4', title: 'Migração de Legado', status: 'DONE', description: 'Migrando agentes de GPT-4 para Gemini 3 Pro.', scope: 'Infra', metrics: 'Redução de custo', deadline: '2025-03-10', user: 'Carlos Ed' },
  ];

  const columns: { id: Project['status']; label: string; color: string }[] = [
    { id: 'TODO', label: 'A Fazer', color: 'bg-slate-100' },
    { id: 'IN_PROGRESS', label: 'Em Andamento', color: 'bg-sky-100' },
    { id: 'REVIEW', label: 'Revisão', color: 'bg-amber-100' },
    { id: 'DONE', label: 'Concluído', color: 'bg-emerald-100' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Laboratório de Projetos</h1>
          <p className="text-slate-500">Acompanhe o desenvolvimento de projetos de IA e as métricas de desempenho do time.</p>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Projetos Ativos', value: 3, sub: '+1 desde o último mês' },
          { label: 'Velocidade Média', value: '4.2', sub: 'Tarefas / Semana' },
          { label: 'Tempo de Ciclo', value: '12d', sub: 'Média de desenvolvimento' },
          { label: 'Conformidade SLA', value: '98%', sub: 'Meta: 95%' },
        ].map((kpi, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{kpi.label}</div>
            <div className="text-3xl font-extrabold text-slate-800">{kpi.value}</div>
            <div className="text-[10px] text-emerald-500 font-bold mt-2">{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {columns.map(col => (
          <div key={col.id} className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${col.color.replace('100', '500')}`}></div>
                <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wider">{col.label}</h3>
              </div>
              <span className="text-[10px] font-bold bg-slate-200 px-2 py-0.5 rounded-full text-slate-600">
                {projects.filter(p => p.status === col.id).length}
              </span>
            </div>
            <div className="space-y-4">
              {projects.filter(p => p.status === col.id).map(proj => (
                <div key={proj.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                  <div className="text-xs font-bold text-sky-600 mb-2">{proj.scope}</div>
                  <h4 className="font-bold text-slate-800 text-sm mb-1">{proj.title}</h4>
                  <p className="text-[10px] text-slate-500 line-clamp-2 mb-4">{proj.description}</p>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                    <div className="flex -space-x-2">
                      <div className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[8px] font-bold uppercase">{proj.user[0]}</div>
                    </div>
                    <div className="text-[9px] font-bold text-slate-400">Prazo {new Date(proj.deadline).toLocaleDateString()}</div>
                  </div>
                </div>
              ))}
              <button className="w-full py-2 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-all flex items-center justify-center">
                <Icons.Plus />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LabPage;
