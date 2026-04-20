
import React from 'react';
import { Icons } from '../../constants';

const ZnoteHistory: React.FC = () => {
  const historyData = [
    {
      id: 1,
      title: 'Reunião 20/04/2026, 11:39',
      date: '20/04/2026, 11:39',
      duration: '0s',
      status: 'Processando',
      content: 'Aguardando dados do processamento em tempo real...',
      isProcessing: true
    },
    {
      id: 2,
      title: 'Reunião 20/04/2026, 08:39',
      date: '20/04/2026, 08:39',
      duration: '33m 59s',
      status: 'Processada',
      content: 'Resumo Executivo: Reunião focada em diagnosticar a queda de conversão decorrente da mudança no mix de origens de leads (forte aumento de Hub e Autocontratação e queda acentuada de PA/Executivo) e em definir ações imediatas e de curto prazo. Ficou decidido manter o funil como está por ora, priorizar a análise/limpeza dos leads do Hub para segmentação e abordagem diferenciada, disparar um e-mail de reengajamento para leads parados, padronizar a coleta de "motivos de perdido" e instrumentar o Bitrix para medir toques e eficácia por canal. Em paralelo, buscar com o Itaú melhorias na qualificação dos leads de Portal, reabrir a "torneira" de PA/Executivo e viabilizar remarketing (pixel/lista de downloads).',
      points: [
        'Queda de conversão e qualidade de leads:',
        'Antes: ~100/mês majoritariamente PA/Executivo, com ~34% de fechamento (ex.: 34 em 100).'
      ],
      isProcessing: false
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <div className="space-y-4">
        <h1 className="text-[32px] font-bold text-slate-800">Histórico</h1>
        <p className="text-slate-500 text-lg leading-relaxed max-w-3xl">
          Revise sessões gravadas, uploads e textos processados com busca por palavras-chave em resumos e transcrições.
        </p>
      </div>

      <div className="flex gap-4 items-center">
        <button className="flex items-center gap-2 px-6 py-2 bg-white border border-[#0070E0] text-[#0070E0] rounded-lg text-sm font-bold hover:bg-sky-50 transition-all">
          <Icons.History className="w-4 h-4 rotate-180" />
          Atualizar
        </button>
        <div className="relative flex-1 max-w-md">
            <Icons.Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
                type="text" 
                placeholder="Pesquisar sessões, ID, resumo"
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none"
            />
        </div>
        <p className="text-slate-500 text-sm font-medium">💡 Pressione Enter ou clique na lupa para buscar</p>
      </div>

      <div className="space-y-8">
        {historyData.map((item) => (
          <div key={item.id} className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 space-y-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-slate-800 tracking-tight">{item.title}</h3>
                  <div className="flex items-center gap-4 text-slate-400 text-sm font-medium">
                    <div className="flex items-center gap-1.5">
                        <Icons.History className="w-4 h-4" />
                        {item.date}
                    </div>
                    <div className="flex items-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        {item.duration}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                    <Icons.History className={`w-4 h-4 ${item.isProcessing ? 'animate-spin text-slate-400' : 'text-slate-400'}`} />
                    <span className="text-sm font-bold text-slate-700">{item.status}</span>
                </div>
              </div>

              <div className="h-[1px] w-full bg-slate-100"></div>

              <div className="space-y-4">
                {item.isProcessing ? (
                     <div className="space-y-2">
                        <p className="font-bold text-slate-800 italic">Processando...</p>
                        <p className="text-slate-500">{item.content}</p>
                     </div>
                ) : (
                    <div className="space-y-4">
                        <p className="text-[#334155] leading-relaxed">
                            <span className="font-bold">Resumo Executivo:</span> {item.content}
                        </p>
                        {item.points && (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#0070E0]"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 17 2.5 17 3 19 4 21 5c-6.7 2-6.7 2-7 15Z"/><path d="M14.9 8.2C14.1 5.3 12 5 11 5"/></svg>
                                    <span className="font-bold text-slate-800">Pontos de Discussão Principais:</span>
                                </div>
                                <ul className="list-disc pl-6 space-y-1 text-slate-600">
                                    {item.points.map((p, i) => (
                                        <li key={i}>{p}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
              </div>
            </div>

            <div className="bg-slate-50/50 p-6 flex justify-end gap-3 border-t border-slate-100">
                <button className="flex items-center gap-2 px-6 py-2 bg-[#0070E0] text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-100">
                    <Icons.ChevronDown className="w-4 h-4 translate-y-0.5" />
                    Ver detalhes
                </button>
                <button className="flex items-center gap-2 px-6 py-2 bg-white border border-[#0070E0] text-[#0070E0] rounded-lg text-sm font-bold hover:bg-sky-50 transition-all">
                    <Icons.History className="w-4 h-4" />
                    Reprocessar
                </button>
                <button className="flex items-center gap-2 px-6 py-2 bg-[#EF4444] text-white rounded-lg text-sm font-bold hover:bg-red-600 transition-all shadow-md shadow-red-100">
                    <Icons.Trash className="w-4 h-4" />
                    Deletar
                </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ZnoteHistory;
