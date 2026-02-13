
import React from 'react';
import { Icons } from '../constants';

const DocumentationPage: React.FC = () => {
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-12 pb-24">
      <div className="space-y-4 text-center">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Arquitetura de Permissionamento</h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto">Entenda como a ZIA gerencia papéis, autorização de agentes e a governança de dados.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* User Permissions (C.4) */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-2xl flex items-center justify-center mb-6">
            <Icons.Search />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Hierarquia de Usuários</h2>
          <div className="space-y-4">
            {[
              { role: 'BÁSICO', desc: 'Acesso de leitura e consulta. Funcionalidades limitadas.', color: 'bg-slate-100' },
              { role: 'INTERMEDIÁRIO', desc: 'Leitura, consulta e modificação de dados não críticos.', color: 'bg-indigo-50' },
              { role: 'AVANÇADO', desc: 'Modificação total, acionamento de rotas e execução de ações.', color: 'bg-amber-50' },
              { role: 'ADMINISTRADOR', desc: 'Governança completa, gestão de chaves e auditoria total.', color: 'bg-rose-50' },
            ].map((r, i) => (
              <div key={i} className="flex gap-4 p-3 rounded-xl border border-slate-100">
                <div className={`shrink-0 w-2 h-full rounded-full ${r.color}`}></div>
                <div>
                   <div className="text-xs font-bold text-slate-800 uppercase mb-1">{r.role}</div>
                   <p className="text-xs text-slate-500">{r.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Agent Classes (C.2) */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
            <Icons.AgentBuilder />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Classes de Agentes</h2>
          <div className="grid grid-cols-2 gap-4">
             {[
               { type: 'LEITURA', label: 'Recuperação de Dados' },
               { type: 'ESCRITA', label: 'Persistência de Dados' },
               { type: 'INTERPRETAÇÃO', label: 'Análise Semântica' },
               { type: 'AÇÃO', label: 'Execução de Sistema' }
             ].map((a, i) => (
               <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                  <div className="text-xs font-bold text-slate-800 mb-1">{a.type}</div>
                  <div className="text-[10px] text-slate-500 uppercase font-medium">{a.label}</div>
               </div>
             ))}
          </div>
          <div className="mt-6 p-4 bg-indigo-600 rounded-2xl text-white text-xs leading-relaxed">
             <span className="font-bold block mb-2 underline">Protocolo de Autorização:</span>
             Agentes devem ser especificamente autorizados por um usuário Avançado ou Administrador antes de poderem executar comandos da classe "AÇÃO".
          </div>
        </div>

        {/* Resource Lifecycle (C.1) */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow md:col-span-2">
           <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Icons.Plus /> Ciclo de Vida do Recurso & Vetorização
           </h2>
           <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-1 space-y-4">
                 <p className="text-slate-600 text-sm leading-relaxed">
                    Recursos na ZIA são "Unidades Atômicas" que combinam capacidades de LLM com dados proprietários. 
                    Quando você cria um recurso de **Documentação**, o sistema aciona automaticamente um pipeline de vetorização (RAG).
                 </p>
                 <ul className="space-y-2">
                    {['Codificação vetorial automatizada', 'Indexação para busca semântica', 'Associação de metadados', 'Mascaramento por nível de acesso'].map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                         <div className="w-1.5 h-1.5 bg-sky-500 rounded-full"></div> {item}
                      </li>
                    ))}
                 </ul>
              </div>
              <div className="shrink-0 w-full md:w-1/2 bg-slate-900 rounded-2xl p-6 text-sky-400 font-mono text-[10px] overflow-hidden">
                 <div className="flex gap-2 mb-2"><div className="w-2 h-2 rounded-full bg-rose-500"></div><div className="w-2 h-2 rounded-full bg-amber-500"></div><div className="w-2 h-2 rounded-full bg-emerald-500"></div></div>
                 <div>{"{"}</div>
                 <div className="pl-4">"id_recurso": "vector-idx-992",</div>
                 <div className="pl-4">"politica": "RBAC-ESTRITO",</div>
                 <div className="pl-4">"modelo_embedding": "text-embedding-004",</div>
                 <div className="pl-4">"fragmentos": 4202,</div>
                 <div className="pl-4">"controle_acesso": {"["} "BÁSICO", "INTERMEDIÁRIO" {"]"}</div>
                 <div>{"}"}</div>
                 <div className="mt-4 animate-pulse text-white">SISTEMA: Vetorização Concluída. Índice Pronto.</div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentationPage;
