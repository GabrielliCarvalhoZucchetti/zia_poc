
import React from 'react';
import { Icons } from '../constants';

const AppsPage: React.FC = () => {
  const apps = [
    {
      id: 1,
      name: 'Znote',
      description: 'Transforme gravações em insights acionáveis. Capture áudio, organize transcrições e acompanhe decisões com uma experiência otimizada para qualquer tamanho de tela.',
      category: 'Automação',
      isUsing: true,
      url: 'https://znote.zucchetti.com.br/home'
    },
    {
      id: 2,
      name: 'Upload de Lead Itaú',
      description: 'Aqui o time comercial da POS pode fazer o upload de leads do Itaú para envio de mensagens com o Agente PDV.',
      category: 'Agente',
      isUsing: true
    },
    {
      id: 3,
      name: 'WhatsApp Monitor',
      description: 'Visualize aqui os leads que estão interagindo por conversa com os Agentes.',
      category: '',
      isUsing: true
    }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Aplicações</h1>
          <p className="text-slate-500">Explore e gerencie as ferramentas integradas ao ecossistema ZIA.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {apps.map((app) => (
          <div key={app.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
            <div className="absolute top-6 right-6">
              <span className={`text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider ${
                app.isUsing ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'
              }`}>
                Utilizando
              </span>
            </div>
            
            <div className="space-y-2 mt-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-bold text-slate-800">{app.name}</h3>
                  {app.category && (
                    <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-50 px-1.5 py-0.5 rounded">
                      {app.category}
                    </span>
                  )}
                </div>
                <div className="h-0.5 w-full bg-slate-100 rounded-full"></div>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">
                {app.description}
              </p>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between">
              <button className="text-sm font-bold text-sky-600 hover:text-sky-700 transition-colors">
                Ver Detalhes
              </button>
              <button 
                onClick={() => {
                  if (app.url) {
                    window.open(app.url, '_blank');
                  }
                }}
                className="px-4 py-2 bg-sky-600 text-white rounded-lg text-xs font-bold hover:bg-sky-700 transition-all shadow-md shadow-sky-100"
              >
                Abrir
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AppsPage;
