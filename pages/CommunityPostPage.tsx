import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Icons } from '../constants';
import { User } from '../types';

interface CommunityPostPageProps {
  user: User | null;
}

export default function CommunityPostPage({ user }: CommunityPostPageProps) {
  const { id } = useParams();
  const [post, setPost] = useState<any>(null);
  const [newCommentText, setNewCommentText] = useState('');

  useEffect(() => {
    const cached = localStorage.getItem('luna_community_posts');
    if (cached) {
      try {
        const posts = JSON.parse(cached);
        const found = posts.find((p: any) => p.id === id);
        if (found) setPost(found);
      } catch (e) {
        console.error("Failed to parse community posts", e);
      }
    }
  }, [id]);

  const savePost = (updatedPost: any) => {
    setPost(updatedPost);
    const cached = localStorage.getItem('luna_community_posts');
    if (cached) {
      try {
        const posts = JSON.parse(cached);
        const updatedPosts = posts.map((p: any) => p.id === updatedPost.id ? updatedPost : p);
        localStorage.setItem('luna_community_posts', JSON.stringify(updatedPosts));
        
        // Notify other tabs
        window.dispatchEvent(new Event('storage'));
      } catch (e) {}
    }
  };

  const handleToggleLike = () => {
    if (!post || !user) return;
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
    if (!post || !user || !newCommentText.trim()) return;
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
    if (!post) return;
    savePost({
      ...post,
      comments: post.comments.filter((c: any) => c.id !== commentId)
    });
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
      {/* Notion-style Cover Image */}
      <div className="w-full h-[35vh] lg:h-[40vh] bg-slate-100 dark:bg-slate-900">
        <img 
          src={post.imageUrl || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600&auto=format&fit=crop&q=80'} 
          alt={post.title}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Notion-style Header & Title */}
      <main className="max-w-3xl mx-auto px-6 lg:px-0 pt-16">
        <div className="space-y-4 mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
            {post.title}
          </h1>
          {post.summary && (
            <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed">
              {post.summary}
            </p>
          )}
        </div>

        {/* Content */}
        <div className="prose prose-slate dark:prose-invert max-w-none text-base md:text-lg text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-sans">
          {post.content}
        </div>

        {/* Action Button (Inline) */}
        {(post.resourceId || post.hyperlink) && (
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

        {/* Comments Section */}
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
      </main>
    </div>
  );
}
