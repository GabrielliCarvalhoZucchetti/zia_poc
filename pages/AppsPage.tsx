
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Icons } from '../constants';

const AppsPage: React.FC = () => {
  const navigate = useNavigate();
  const apps = [
    {
      id: 1,
      name: 'Znote',
      description: 'Transforme gravações em insights acionáveis. Capture áudio, organize transcrições e acompanhe decisões com uma experiência otimizada para qualquer tamanho de tela.',
      category: 'Automação',
      isUsing: true,
      url: '/znote'
    },
    {
      id: 2,
      name: 'Upload de Lead Itaú',
      description: 'Aqui o time comercial da POS pode fazer o upload de leads do Itaú para envio de mensagens com o Agente PDV.',
      category: 'Agente',
      isUsing: true,
      url: '/itau-upload'
    },
    {
      id: 3,
      name: 'WhatsApp Monitor',
      description: 'Visualize aqui os leads que estão interagindo por conversa com os Agentes.',
      category: '',
      isUsing: true,
      url: '/whatsapp-monitor'
    }
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/50">
      <div className="p-12 max-w-[1600px] mx-auto space-y-10">
        <div>
          <h1 className="text-[40px] font-bold text-slate-800 leading-tight">Aplicações</h1>
          <p className="text-lg text-slate-500 mt-2">Explore e gerencie as ferramentas integradas ao ecossistema ZIA.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {apps.map((app) => (
            <div key={app.id} className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm hover:shadow-md transition-all group relative flex flex-col h-full">
              <div className="flex-1">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3 mt-4">
                    <h3 className="text-[28px] font-bold text-slate-800 tracking-tight">{app.name}</h3>
                    {app.category && (
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                        {app.category}
                      </span>
                    )}
                  </div>
                  <div className="h-[1px] w-full bg-slate-100"></div>
                  <p className="text-base text-slate-500 leading-relaxed mt-2 whitespace-pre-line">
                    {app.description}
                  </p>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-slate-50 flex items-center justify-between">
                <button className="text-[15px] font-bold text-sky-600 hover:text-sky-700 transition-colors">
                  Ver Detalhes
                </button>
                <button 
                  onClick={() => {
                    if (app.url) {
                      if (app.url.startsWith('http')) {
                        window.open(app.url, '_blank');
                      } else {
                        navigate(app.url);
                      }
                    }
                  }}
                  className="px-6 py-2.5 bg-[#0070E0] text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                >
                  Abrir
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AppsPage;
