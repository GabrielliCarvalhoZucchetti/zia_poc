
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

        {/* Environments (New Section) */}
        <div className="bg-slate-900 p-10 rounded-[40px] text-white md:col-span-2 shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 blur-[100px] rounded-full"></div>
           <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                 <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-500/20 text-sky-400 rounded-full text-[10px] font-bold uppercase tracking-widest border border-sky-500/30">
                    Governança de Ambientes
                 </div>
                 <h2 className="text-3xl font-bold tracking-tight">Homologação vs. Produção</h2>
                 <p className="text-slate-400 text-sm leading-relaxed">
                    A ZIA utiliza um sistema de isolamento de ambientes para garantir que novos agentes e documentos sejam validados antes de estarem disponíveis para toda a organização.
                 </p>
              </div>
              <div className="grid grid-cols-1 gap-4">
                 <div className="p-5 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 transition-colors group">
                    <div className="flex items-center gap-3 mb-3">
                       <div className="w-8 h-8 bg-amber-500/20 text-amber-500 rounded-xl flex items-center justify-center font-bold text-xs">H</div>
                       <h3 className="font-bold text-amber-500">Ambiente de Homologação</h3>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                       Todo novo recurso é criado automaticamente neste ambiente. Ele é **privado**, visível apenas para o criador e administradores. Use este espaço para refinar prompts e testar a precisão das respostas.
                    </p>
                 </div>
                 <div className="p-5 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 transition-colors group">
                    <div className="flex items-center gap-3 mb-3">
                       <div className="w-8 h-8 bg-emerald-500/20 text-emerald-500 rounded-xl flex items-center justify-center font-bold text-xs">P</div>
                       <h3 className="font-bold text-emerald-700">Ambiente de Produção</h3>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                       Após a validação, o recurso pode ser promovido. Uma vez em produção, ele torna-se **público** para todos os usuários que possuem o nível de permissão (Role) exigido pelo recurso.
                    </p>
                 </div>
              </div>
           </div>
        </div>
        {/* Webhooks (New Section) */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow md:col-span-2">
           <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-2xl flex items-center justify-center">
                 <Icons.Settings />
              </div>
              <div>
                 <h2 className="text-2xl font-bold text-slate-800">Integração via Webhooks</h2>
                 <p className="text-sm text-slate-500">Conecte a ZIA ao n8n, Lovable, Make ou sistemas proprietários.</p>
              </div>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                 <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Como Funciona</div>
                 <p className="text-xs text-slate-600 leading-relaxed">
                    Ao configurar uma URL de Webhook em um Agente, a ZIA deixa de processar a resposta internamente e delega a execução para o seu endpoint externo.
                 </p>
              </div>
              <div className="space-y-3">
                 <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Payload de Envio</div>
                 <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 font-mono text-[9px] text-slate-500">
                    <div>{"{"}</div>
                    <div className="pl-2">"message": "Olá mundo",</div>
                    <div className="pl-2">"user": {"{ \"id\": \"...\", \"role\": \"...\" }"},</div>
                    <div className="pl-2">"history": [...],</div>
                    <div className="pl-2">"attachments": [...]</div>
                    <div>{"}"}</div>
                 </div>
              </div>
              <div className="space-y-3">
                 <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Resposta Esperada</div>
                 <p className="text-xs text-slate-600 leading-relaxed">
                    Seu sistema deve retornar um JSON. A ZIA buscará a resposta nos campos: <code className="bg-slate-100 px-1 rounded text-sky-600">response</code>, <code className="bg-slate-100 px-1 rounded text-sky-600">output</code> ou <code className="bg-slate-100 px-1 rounded text-sky-600">text</code>.
                 </p>
              </div>
           </div>
           
           <div className="mt-8 pt-6 border-t border-slate-100">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
                    <Icons.Monitoring className="w-4 h-4" />
                 </div>
                 <div>
                    <h3 className="text-sm font-bold text-slate-800">Webhook de Sistema (Global)</h3>
                    <p className="text-[10px] text-slate-500">Configurável em Monitoramento. Notifica seu sistema sobre novas solicitações de acesso e eventos de governança.</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentationPage;
