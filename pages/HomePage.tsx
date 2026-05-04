
import React from 'react';
import { Icons } from '../constants';

const CHAMPIONS = [
  { id: 1, name: 'Alice Castro', type: 'N1', role: 'IA Generativa & Chatbot', status: 'Ativo', avatar: 'https://picsum.photos/seed/alice/100/100' },
  { id: 2, name: 'Gabriel Ricardo', type: 'N2', role: 'Auditoria & Logs Especialista', status: 'Ativo', avatar: 'https://picsum.photos/seed/gabrie/100/100' },
  { id: 3, name: 'Gabrielli Marques', type: 'N3', role: 'Lab & Desenvolvimento n8n', status: 'Ativo', avatar: 'https://picsum.photos/seed/gabrielli/100/100' },
  { id: 4, name: 'Ana Costa', type: 'N4', role: 'Comercial & Negócios IA', status: 'Ativo', avatar: 'https://picsum.photos/seed/ana/100/100' },
  { id: 5, name: 'Marcos Oliveira', type: 'N5', role: 'Infra & Segurança de Dados', status: 'Ativo', avatar: 'https://picsum.photos/seed/marcos/100/100' },
];

const InteractionTypes = [
  { id: 'N1', label: 'Nível 1', description: 'Interações básicas e triagem', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
  { id: 'N2', label: 'Nível 2', description: 'Análise técnica intermediária', color: 'bg-sky-50 text-sky-600 border-sky-100' },
  { id: 'N3', label: 'Nível 3', description: 'Desenvolvimento e customização', color: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
  { id: 'N4', label: 'Nível 4', description: 'Consultoria estratégica de negócio', color: 'bg-amber-50 text-amber-600 border-amber-100' },
  { id: 'N5', label: 'Nível 5', description: 'Governança e arquitetura crítica', color: 'bg-rose-50 text-rose-600 border-rose-100' },
];

const HomePage: React.FC = () => {
  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/50 p-8">
      <div className="max-w-7xl mx-auto space-y-10">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Bem-vindo ao ZIA</h1>
          <p className="text-slate-500 max-w-2xl">
            Sua central de Inteligência Artificial Zucchetti. Monitore, desenvolva e colabore em projetos de IA.
          </p>
        </header>

        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Icons.Users className="w-5 h-5 text-sky-600" />
              ZIA Champions & Níveis de Interação
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {InteractionTypes.map((level) => {
              const champion = CHAMPIONS.find(c => c.type === level.id);
              return (
                <div key={level.id} className="bg-white rounded-[24px] border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all group">
                  <div className={`p-4 border-b ${level.color} flex items-center justify-between`}>
                    <span className="text-xs font-bold uppercase tracking-widest">{level.label}</span>
                    <Icons.Sparkle className="w-4 h-4 opacity-50" />
                  </div>
                  
                  <div className="p-6 space-y-6">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Propósito</p>
                      <p className="text-xs text-slate-600 font-medium leading-relaxed">{level.description}</p>
                    </div>

                    {champion ? (
                      <div className="space-y-4 pt-4 border-t border-slate-50">
                        <div className="flex items-center gap-3">
                          <img 
                            src={champion.avatar} 
                            alt={champion.name} 
                            className="w-10 h-10 rounded-xl object-cover border border-slate-100"
                          />
                          <div>
                            <div className="text-sm font-bold text-slate-800">{champion.name}</div>
                            <div className="text-[10px] text-slate-400 font-medium uppercase">{champion.role}</div>
                          </div>
                        </div>
                        <button className="w-full py-2 bg-slate-50 hover:bg-sky-600 hover:text-white text-slate-600 text-xs font-bold rounded-xl transition-all border border-slate-100 hover:border-sky-600">
                          Contatar Champion
                        </button>
                      </div>
                    ) : (
                      <div className="pt-4 border-t border-slate-50 text-center">
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest italic">Vaga Aberta</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;
