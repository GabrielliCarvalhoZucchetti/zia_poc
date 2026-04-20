
import React, { useState } from 'react';
import { Icons } from '../constants';

const WhatsAppMonitorPage: React.FC = () => {
  const [activeMainFilter, setActiveMainFilter] = useState('Todos');
  const [activeSubFilter, setActiveSubFilter] = useState('Todos');
  const [search, setSearch] = useState('1208');

  return (
    <div className="flex h-full bg-[#f8f9fa] overflow-hidden">
      {/* Sidebar de Conversas */}
      <aside className="w-[320px] bg-white border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-800">WhatsApp Monitor</h1>
            <span className="text-xs text-slate-400">50 conversas</span>
          </div>
          <button className="text-slate-400 hover:text-slate-600">
            <Icons.Settings className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="flex gap-2">
            {['Todos', 'ZWeb', 'ZItau'].map(f => (
              <button 
                key={f}
                onClick={() => setActiveMainFilter(f)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  activeMainFilter === f ? 'bg-sky-100 text-sky-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            {['Todos', 'Handoff', 'Ativo', 'Fechado'].map(f => (
              <button 
                key={f}
                onClick={() => setActiveSubFilter(f)}
                className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                  activeSubFilter === f ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="relative">
            <Icons.Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Buscar..."
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4 bg-slate-50/50 border-y border-slate-100">
            <div className="flex justify-between items-start mb-1">
              <span className="text-sm font-bold text-slate-800">554898651208</span>
              <span className="text-[10px] text-slate-400">23d</span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[9px] font-bold px-1.5 py-0.5 bg-indigo-100 text-indigo-600 rounded">ZWEB</span>
            </div>
            <p className="text-xs text-slate-500 line-clamp-1">Bot: Resumo do rascunho: Cliente: Clipp | Itens: 0...</p>
          </div>
        </div>
      </aside>

      {/* Área do Chat */}
      <main className="flex-1 flex flex-col bg-white min-w-0">
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Mensagem do Usuário */}
          <div className="flex justify-start">
            <div className="max-w-[70%] bg-[#DCF8C6] p-3 rounded-tr-xl rounded-bl-xl rounded-br-xl shadow-sm relative">
              <p className="text-sm text-slate-800">btn_emitir</p>
              <span className="text-[10px] text-slate-500 absolute bottom-1 right-2">16:11</span>
            </div>
          </div>

          <div className="flex justify-start">
            <div className="max-w-[70%] bg-[#DCF8C6] p-3 rounded-tr-xl rounded-bl-xl rounded-br-xl shadow-sm relative">
              <p className="text-sm text-slate-800">Quero emitir uma nota do cliente clipp e do produto saco de feijão</p>
              <span className="text-[10px] text-slate-500 absolute bottom-1 right-2">16:17</span>
            </div>
          </div>

          {/* Mensagem do Bot */}
          <div className="flex justify-end pr-4">
             <div className="max-w-[80%] flex flex-col items-end">
                <div className="flex items-center gap-2 mb-1">
                   <Icons.AgentBuilder className="w-3 h-3 text-slate-400" />
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bot</span>
                </div>
                <div className="bg-[#EBF7FF] p-4 rounded-tl-2xl rounded-bl-2xl rounded-br-2xl shadow-sm relative w-full">
                  <div className="text-sm text-slate-800 space-y-4">
                    <p>Resumo do rascunho: Cliente: Clipp | Itens: 0</p>
                    <p>Não encontramos o produto 'saco de feijão' no catálogo. Segue sugestões disponíveis (selecione pela posição):</p>
                    <div className="space-y-0.5">
                      <p>1) Notebook Insp.</p>
                      <p>2) Mouse MX Master</p>
                      <p>3) Teclado Redragon</p>
                      <p>4) Monitor LG 24</p>
                      <p>5) Headset HyperX</p>
                      <p>6) Galaxy S24</p>
                      <p>7) iPhone 15 Pro</p>
                      <p>8) iPad Air 10.9</p>
                      <p>9) TV Samsung 55</p>
                      <p>10) Canon EOS Rebel</p>
                    </div>
                    <p>Qual deles deseja adicionar à nota?</p>
                  </div>
                  <span className="text-[10px] text-slate-500 block text-right mt-2">16:17</span>
                </div>
                <div className="flex items-center gap-2 mt-2 px-2">
                   <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter italic">Raciocinio IA</span>
                   <span className="text-[9px] font-bold px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded uppercase">INVOICE_EMISSION</span>
                   <Icons.ChevronDown className="w-3 h-3 text-slate-400" />
                </div>
             </div>
          </div>
        </div>

        {/* Input */}
        <div className="p-4 border-t border-slate-100 bg-[#f8f9fa]">
          <div className="max-w-[95%] mx-auto space-y-3">
             <button className="text-[10px] font-bold text-sky-600 border border-sky-200 bg-white px-3 py-1 rounded-md hover:bg-sky-50 transition-colors">
               Sugerir resposta
             </button>
             <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg px-4 py-2">
                <button className="text-slate-400 hover:text-slate-600"><Icons.Paperclip className="w-5 h-5" /></button>
                <button className="text-slate-400 hover:text-slate-600"><Icons.Mic className="w-5 h-5" /></button>
                <input 
                  type="text" 
                  className="flex-1 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none" 
                  placeholder="Enviar mensagem como operador..."
                />
                <button className="w-8 h-8 bg-sky-200 text-sky-600 rounded-full flex items-center justify-center hover:bg-sky-600 hover:text-white transition-all">
                  <Icons.Send className="w-4 h-4 ml-0.5" />
                </button>
             </div>
          </div>
        </div>
      </main>

      {/* Sidebar Lateral Direita (Ferramentas) */}
      <aside className="w-[300px] bg-white border-l border-slate-200 flex flex-col shrink-0 overflow-y-auto">
        <div className="p-6 space-y-8">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</span>
            <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded uppercase">Active</span>
          </div>

          <button className="w-full py-3 bg-[#e67e22] text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#d35400] transition-colors shadow-sm">
             <Icons.User className="w-4 h-4" />
             Assumir Conversa
          </button>

          <div className="space-y-3">
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Notas</span>
             <div className="relative">
                <textarea 
                  className="w-full h-32 bg-[#fffde7] border border-slate-100 rounded-lg p-4 text-xs text-slate-600 placeholder:text-slate-400 focus:outline-none resize-none shadow-sm"
                  placeholder="Nova nota... (Ctrl+Enter para salvar)"
                />
                <button className="absolute bottom-3 right-3 text-amber-500/50 hover:text-amber-500">
                   <Icons.Send className="w-4 h-4" />
                </button>
             </div>
          </div>

          <div className="space-y-4 pt-4">
             {[
               { label: 'Telefone', value: '554898651208', icon: <Icons.Mic className="w-4 h-4" /> },
               { label: 'Autenticado', value: 'Sim', icon: <Icons.User className="w-4 h-4" /> },
               { label: 'Início', value: '27/03, 16:09', icon: <Icons.History className="w-4 h-4" /> },
               { label: 'Última atividade', value: '27/03, 16:17', icon: <Icons.History className="w-4 h-4" /> },
             ].map((item, idx) => (
               <div key={idx} className="flex gap-3">
                  <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
                    {item.icon}
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{item.label}</div>
                    <div className="text-xs font-semibold text-slate-700">{item.value}</div>
                  </div>
               </div>
             ))}
          </div>

          <div className="pt-6 border-t border-slate-100">
             <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-bold uppercase tracking-widest">Histórico</span>
                <Icons.ChevronDown className="w-4 h-4" />
             </div>
          </div>
        </div>
      </aside>

      {/* Botão de Fechar Sidebar (Simbolizado na imagem) */}
      <button className="absolute right-4 top-4 z-20 w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600">
         <Icons.Documentation className="w-4 h-4" />
      </button>
    </div>
  );
};

export default WhatsAppMonitorPage;
