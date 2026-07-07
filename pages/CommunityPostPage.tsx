import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Icons } from '../constants';
import { User } from '../types';

interface CommunityPostPageProps {
  user: User | null;
}

export default function CommunityPostPage({ user }: CommunityPostPageProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<any>(null);
  const [newCommentText, setNewCommentText] = useState('');
  
  const [isEditing, setIsEditing] = useState(id === 'new');
  const [editForm, setEditForm] = useState({
    title: '',
    summary: '',
    content: '',
    imageUrl: '',
    resourceId: '',
    hyperlink: ''
  });

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const applyFormatting = (prefix: string, suffix: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = editForm.content;
    const selectedText = text.substring(start, end);
    
    const replacement = prefix + (selectedText || 'texto') + suffix;
    const newContent = text.substring(0, start) + replacement + text.substring(end);
    
    setEditForm({ ...editForm, content: newContent });

    // Refocus and re-select
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + prefix.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos + (selectedText || 'texto').length);
    }, 0);
  };

  useEffect(() => {
    if (id === 'new') {
      setPost({
        id: 'new',
        author: user?.name || 'Administrador',
        date: new Date().toLocaleDateString('pt-BR'),
        likes: [],
        comments: []
      });
      setEditForm({
        title: '',
        summary: '',
        content: '',
        imageUrl: '',
        resourceId: '',
        hyperlink: ''
      });
      setIsEditing(true);
      return;
    }

    const cached = localStorage.getItem('luna_community_posts');
    if (cached) {
      try {
        const posts = JSON.parse(cached);
        const found = posts.find((p: any) => p.id === id);
        if (found) {
          setPost(found);
          setEditForm({
            title: found.title || '',
            summary: found.summary || '',
            content: found.content || '',
            imageUrl: found.imageUrl || '',
            resourceId: found.resourceId || '',
            hyperlink: found.hyperlink || ''
          });
        }
      } catch (e) {
        console.error("Failed to parse community posts", e);
      }
    }
  }, [id, user]);

  const savePost = (updatedPost: any) => {
    setPost(updatedPost);
    const cached = localStorage.getItem('luna_community_posts');
    if (cached) {
      try {
        const posts = JSON.parse(cached);
        const updatedPosts = posts.map((p: any) => p.id === updatedPost.id ? updatedPost : p);
        localStorage.setItem('luna_community_posts', JSON.stringify(updatedPosts));
        window.dispatchEvent(new Event('storage'));
      } catch (e) {}
    }
  };

  const handleToggleLike = () => {
    if (!post || !user || isEditing) return;
    const likes = post.likes || [];
    const hasLiked = likes.includes(user.name);
    let newLikes;
    if (hasLiked) {
      newLikes = likes.filter((n: string) => n !== user.name);
    } else {
      newLikes = [...likes, user.name];
    }
    savePost({ ...post, likes: newLikes });
  };

  const handleAddComment = () => {
    if (!post || !user || !newCommentText.trim() || isEditing) return;
    const newComment = {
      id: `c-${Date.now()}`,
      user: user.name,
      content: newCommentText.trim(),
      timestamp: new Date().toLocaleString('pt-BR')
    };
    savePost({ ...post, comments: [...(post.comments || []), newComment] });
    setNewCommentText('');
  };

  const handleDeleteComment = (commentId: string) => {
    if (!post || isEditing) return;
    savePost({
      ...post,
      comments: post.comments.filter((c: any) => c.id !== commentId)
    });
  };

  const handleSaveEdit = () => {
    if (!editForm.title.trim() || !editForm.content.trim()) return;

    const updatedPost = {
      ...post,
      ...editForm
    };

    let posts: any[] = [];
    const cached = localStorage.getItem('luna_community_posts');
    if (cached) {
      try {
        posts = JSON.parse(cached);
      } catch (e) {}
    }

    if (id === 'new') {
      updatedPost.id = 'p' + Date.now();
      posts.unshift(updatedPost);
      localStorage.setItem('luna_community_posts', JSON.stringify(posts));
      window.dispatchEvent(new Event('storage'));
      navigate('/community/' + updatedPost.id, { replace: true });
    } else {
      const updatedPosts = posts.map((p: any) => p.id === updatedPost.id ? updatedPost : p);
      localStorage.setItem('luna_community_posts', JSON.stringify(updatedPosts));
      window.dispatchEvent(new Event('storage'));
      setPost(updatedPost);
      setIsEditing(false);
    }
  };

  if (!post) {
    return (
      <div className="h-full overflow-y-auto bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Publicação não encontrada</h2>
          <Link to="/home" className="text-sky-600 mt-4 inline-block font-bold">Voltar ao feed</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-white dark:bg-slate-950 pb-20 relative font-sans w-full">
      {/* Edit Overlay Actions with Formatting Toolbar */}
      {isEditing && (
        <div className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm select-none">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <span className="font-bold text-slate-800 dark:text-white text-sm whitespace-nowrap">Modo de Edição</span>
            
            {/* Formatting Toolbar */}
            <div className="flex items-center gap-0.5 bg-slate-50 dark:bg-slate-950 p-1 rounded-xl border border-slate-200/60 dark:border-slate-800/80">
              <button
                type="button"
                onClick={() => applyFormatting('**', '**')}
                className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:text-sky-600 dark:hover:text-sky-400 rounded-lg transition-all text-xs font-bold w-8 h-8 flex items-center justify-center cursor-pointer"
                title="Negrito"
              >
                B
              </button>
              <button
                type="button"
                onClick={() => applyFormatting('*', '*')}
                className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:text-sky-600 dark:hover:text-sky-400 rounded-lg transition-all text-xs italic w-8 h-8 flex items-center justify-center cursor-pointer"
                title="Itálico"
              >
                I
              </button>
              <button
                type="button"
                onClick={() => applyFormatting('__', '__')}
                className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:text-sky-600 dark:hover:text-sky-400 rounded-lg transition-all text-xs underline w-8 h-8 flex items-center justify-center cursor-pointer"
                title="Sublinhado"
              >
                U
              </button>
              <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1"></div>
              <button
                type="button"
                onClick={() => applyFormatting('# ')}
                className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:text-sky-600 dark:hover:text-sky-400 rounded-lg transition-all text-xs font-black w-8 h-8 flex items-center justify-center cursor-pointer"
                title="Título 1"
              >
                H1
              </button>
              <button
                type="button"
                onClick={() => applyFormatting('## ')}
                className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:text-sky-600 dark:hover:text-sky-400 rounded-lg transition-all text-xs font-black w-8 h-8 flex items-center justify-center cursor-pointer"
                title="Título 2"
              >
                H2
              </button>
              <button
                type="button"
                onClick={() => applyFormatting('- ')}
                className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:text-sky-600 dark:hover:text-sky-400 rounded-lg transition-all text-xs font-bold w-12 h-8 flex items-center justify-center cursor-pointer whitespace-nowrap"
                title="Lista"
              >
                • Lista
              </button>
              <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1"></div>
              <button
                type="button"
                onClick={() => applyFormatting('`', '`')}
                className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:text-sky-600 dark:hover:text-sky-400 rounded-lg transition-all text-[10px] font-mono w-10 h-8 flex items-center justify-center cursor-pointer whitespace-nowrap"
                title="Código"
              >
                &lt;/&gt;
              </button>
              <button
                type="button"
                onClick={() => applyFormatting('[Link](', ')')}
                className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:text-sky-600 dark:hover:text-sky-400 rounded-lg transition-all text-xs font-semibold w-12 h-8 flex items-center justify-center cursor-pointer whitespace-nowrap"
                title="Inserir Link"
              >
                Link
              </button>
            </div>
          </div>
          
          <div className="flex gap-2 shrink-0">
            {id !== 'new' && (
              <button 
                onClick={() => {
                  setIsEditing(false);
                  setEditForm({
                    title: post.title || '',
                    summary: post.summary || '',
                    content: post.content || '',
                    imageUrl: post.imageUrl || '',
                    resourceId: post.resourceId || '',
                    hyperlink: post.hyperlink || ''
                  });
                }}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-semibold rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
            )}
            <button 
              onClick={handleSaveEdit}
              disabled={!editForm.title.trim() || !editForm.content.trim()}
              className="px-6 py-2 bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold rounded-xl shadow-md disabled:opacity-50 cursor-pointer"
            >
              Salvar
            </button>
          </div>
        </div>
      )}

      {/* Notion-style Cover Image */}
      <div className="w-full h-[35vh] lg:h-[40vh] bg-slate-100 dark:bg-slate-900 relative group">
        <img 
          src={isEditing && editForm.imageUrl ? editForm.imageUrl : (!isEditing && post.imageUrl ? post.imageUrl : 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600&auto=format&fit=crop&q=80')} 
          alt={isEditing ? editForm.title : post.title}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        {isEditing && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-6 opacity-0 group-hover:opacity-100 transition-opacity">
            <input 
              type="text" 
              value={editForm.imageUrl}
              onChange={e => setEditForm({...editForm, imageUrl: e.target.value})}
              placeholder="URL da Imagem de Capa (opcional)"
              className="w-full max-w-lg px-4 py-3 bg-white/90 dark:bg-slate-900/90 rounded-xl outline-none shadow-xl border border-white/20 text-slate-900 dark:text-white"
            />
          </div>
        )}
      </div>

      {/* Notion-style Header & Title */}
      <main className="max-w-3xl mx-auto px-6 lg:px-0 pt-16 relative">
        {!isEditing && user?.role === 'ADMINISTRATOR' && (
          <button 
            onClick={() => setIsEditing(true)}
            className="absolute top-4 right-6 lg:right-0 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors"
          >
            <Icons.Edit className="w-4 h-4" />
            Editar
          </button>
        )}

        <div className="space-y-4 mb-8">
          {isEditing ? (
            <input
              type="text"
              value={editForm.title}
              onChange={e => setEditForm({...editForm, title: e.target.value})}
              placeholder="Título da Publicação"
              className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight w-full bg-transparent border-none outline-none placeholder:text-slate-300 dark:placeholder:text-slate-700"
            />
          ) : (
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
              {post.title}
            </h1>
          )}

          {isEditing ? (
            <textarea
              value={editForm.summary}
              onChange={e => setEditForm({...editForm, summary: e.target.value})}
              placeholder="Descrição resumida (opcional)..."
              rows={2}
              className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed w-full bg-transparent border-none outline-none resize-none placeholder:text-slate-300 dark:placeholder:text-slate-700"
            />
          ) : (
            post.summary && (
              <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed">
                {post.summary}
              </p>
            )
          )}
        </div>

        {/* Content */}
        <div className="prose prose-slate dark:prose-invert max-w-none text-base md:text-lg text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-sans">
          {isEditing ? (
            <textarea
              ref={textareaRef}
              value={editForm.content}
              onChange={e => setEditForm({...editForm, content: e.target.value})}
              placeholder="Escreva todo o conteúdo da publicação aqui..."
              rows={15}
              className="w-full bg-transparent border border-slate-200 dark:border-slate-800 rounded-2xl p-6 outline-none focus:ring-2 focus:ring-sky-500/20 resize-none text-slate-700 dark:text-slate-300"
            />
          ) : (
            post.content
          )}
        </div>

        {/* Edit mode extra fields */}
        {isEditing && (
          <div className="mt-8 space-y-4 p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-slate-800 dark:text-white">Opções Extras</h3>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-400">Hiperlink de Destino (Opcional)</label>
              <input
                type="text"
                value={editForm.hyperlink}
                onChange={e => setEditForm({...editForm, hyperlink: e.target.value})}
                placeholder="Ex: https://zucchetti.com.br"
                className="w-full px-4 py-2.5 bg-white dark:bg-slate-950 text-sm text-slate-800 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-sky-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-400">ID de Recurso do Playground (Opcional)</label>
              <input
                type="text"
                value={editForm.resourceId}
                onChange={e => setEditForm({...editForm, resourceId: e.target.value})}
                placeholder="Ex: r1"
                className="w-full px-4 py-2.5 bg-white dark:bg-slate-950 text-sm text-slate-800 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-sky-500"
              />
            </div>
          </div>
        )}

        {/* Action Button (Inline) */}
        {!isEditing && (post.resourceId || post.hyperlink) && (
          <div className="mt-12 flex justify-center">
            <a
              href={post.hyperlink ? post.hyperlink : `#/chat?resource=${post.resourceId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-sky-600 hover:bg-sky-500 text-white rounded-full font-black tracking-wide shadow-lg shadow-sky-900/20 transition-all flex items-center justify-center gap-3 cursor-pointer hover:scale-105 w-full sm:w-auto"
            >
              <span>{post.resourceId ? 'Abrir no Playground 🤖' : 'Acessar Link da Matéria'}</span>
              <Icons.ArrowRight className="w-5 h-5" />
            </a>
          </div>
        )}
        
        {/* Author & Interactions Footer */}
        {!isEditing && (
          <div className="mt-16 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full flex items-center justify-center font-bold text-sm uppercase">
                {post.author.substring(0, 2)}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {post.author}
                </p>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  {post.date}
                </p>
              </div>
            </div>
            
            <button
              type="button"
              onClick={handleToggleLike}
              className={`px-4 py-2 rounded-xl text-sm font-semibold tracking-wide transition-all border flex items-center justify-center gap-2 cursor-pointer w-fit ${
                post.likes?.includes(user?.name)
                  ? 'bg-red-50 dark:bg-red-950/30 text-red-500 border-red-200/50 dark:border-red-900/50'
                  : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              <span className="text-lg">{post.likes?.includes(user?.name) ? '❤️' : '🤍'}</span>
              <span>{post.likes?.includes(user?.name) ? 'Curtido' : 'Curtir'}</span>
              <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full text-xs shadow-sm ml-1">
                {post.likes?.length || 0}
              </span>
            </button>
          </div>
        )}

        {/* Comments Section */}
        {!isEditing && (
          <div className="pt-8 border-t border-slate-100 dark:border-slate-800/50 space-y-8">
            <h4 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Comentários</span>
              <span className="font-mono bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full text-[10px]">
                {post.comments?.length || 0}
              </span>
            </h4>

            {/* Add Comment */}
            {user && (
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full flex items-center justify-center font-bold text-xs uppercase shrink-0 mt-1">
                  {user.name.substring(0, 2)}
                </div>
                <div className="flex-1 space-y-3">
                  <textarea
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    placeholder="Adicionar um comentário..."
                    rows={2}
                    className="w-full px-3 py-2 bg-transparent text-sm text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-700 resize-none transition-all placeholder:text-slate-400"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleAddComment();
                      }
                    }}
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleAddComment}
                      disabled={!newCommentText.trim()}
                      className="px-4 py-1.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold text-xs rounded-md flex items-center justify-center cursor-pointer transition-colors disabled:opacity-50"
                    >
                      Enviar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Comments List */}
            <div className="space-y-6 pt-4">
              {(post.comments || []).map((cmt: any) => (
                <div key={cmt.id} className="flex gap-4 group relative">
                  <div className="w-8 h-8 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full flex items-center justify-center font-bold text-xs uppercase shrink-0">
                    {cmt.user.substring(0, 2)}
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-slate-900 dark:text-slate-100 font-semibold text-sm">{cmt.user}</span>
                      <span className="text-xs text-slate-400">{cmt.timestamp}</span>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {cmt.content}
                    </p>
                    {(user?.role === 'ADMINISTRATOR' || user?.name === cmt.user) && (
                      <button
                        type="button"
                        onClick={() => handleDeleteComment(cmt.id)}
                        className="absolute top-0 right-0 p-1.5 text-slate-400 hover:text-red-500 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        title="Excluir comentário"
                      >
                        <Icons.Trash className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {(post.comments || []).length === 0 && (
                <div className="py-8 text-slate-400 text-sm">
                  Nenhum comentário.
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
