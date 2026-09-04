'use client';

import React, { useState, useEffect } from 'react';
import { LearnerShell } from '@/shared/layout';
import { apiClient } from '@/shared/api/api-client';
import { useI18n } from '@/shared/i18n';

export default function CommunityPage() {
  const { t } = useI18n();
  const [view, setView] = useState<'list' | 'detail'>('list');
  const [posts, setPosts] = useState<any[]>([]);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [activeTag, setActiveTag] = useState('Tất cả');
  const [showModal, setShowModal] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', tags: '' });

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res: any = await apiClient.get('/discussion/posts');
        const items = res?.data ?? res ?? [];
        if (Array.isArray(items) && items.length > 0) {
          setPosts(items);
        } else {
          setPosts([
            { id: 1, title: 'How to memorize AWS services effectively?', content: 'I am struggling to remember all the different AWS services for my Cloud Practitioner exam. Does anyone have tips or flashcards they recommend?', tags: ['cloud', 'tips'], author: 'David Tran', initial: 'D', voteCount: 24, commentCount: 5, timeAgo: '2 hours ago', pinned: true },
            { id: 2, title: 'Difference between TCP and UDP', content: 'Can someone explain the real-world use cases for TCP vs UDP? I know the theoretical differences but want practical examples.', tags: ['networking'], author: 'Sarah Lee', initial: 'S', voteCount: 15, commentCount: 3, timeAgo: '5 hours ago', pinned: false },
            { id: 3, title: 'Best resources for DevOps automation', content: 'Looking for good tutorials on setting up CI/CD with GitHub Actions and Terraform.', tags: ['devops', 'tools'], author: 'Mike Nguyen', initial: 'M', voteCount: 32, commentCount: 8, timeAgo: '1 day ago', pinned: false },
          ]);
        }
      } catch (error) {
        setPosts([
          { id: 1, title: 'How to memorize AWS services effectively?', content: 'I am struggling to remember all the different AWS services for my Cloud Practitioner exam. Does anyone have tips or flashcards they recommend?', tags: ['cloud', 'tips'], author: 'David Tran', initial: 'D', voteCount: 24, commentCount: 5, timeAgo: '2 hours ago', pinned: true },
        ]);
      }
    };
    fetchPosts();
  }, []);

  const handlePostClick = (post: any) => {
    setSelectedPost({
      ...post,
      comments: [
        { id: 101, author: 'Alex V.', initial: 'A', content: 'Try associating each service with a real-world object. It helps a lot!', timeAgo: '1 hour ago' },
        { id: 102, author: 'Linda K.', initial: 'L', content: 'I used the flashcards here on TechEnglish and they were great.', timeAgo: '45 mins ago' }
      ]
    });
    setView('detail');
  };

  const tags = ['Tất cả', 'networking', 'cloud', 'security', 'devops', 'tips'];
  const filteredPosts = activeTag === 'Tất cả' ? posts : posts.filter(p => p.tags.includes(activeTag));

  return (
    <LearnerShell>
      {view === 'list' ? (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-primary mb-1">Cộng đồng TechEnglish</h1>
              <p className="text-on-surface-variant text-sm">Hỏi đáp, chia sẻ kiến thức chuyên ngành</p>
            </div>
            <button 
              onClick={() => setShowModal(true)}
              className="bg-primary !text-white font-semibold rounded-xl px-5 py-2.5 hover:opacity-90 transition-opacity flex items-center gap-2 whitespace-nowrap"
            >
              <span className="material-symbols-outlined">edit_square</span>
              Đặt câu hỏi
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            {tags.map(tag => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                  activeTag === tag ? 'bg-primary border-primary text-white' : 'bg-surface-container-lowest border-outline-variant/40 text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                {tag === 'Tất cả' ? tag : `#${tag}`}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {filteredPosts.map(post => (
              <div 
                key={post.id} 
                onClick={() => handlePostClick(post)}
                className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6 hover:border-primary/40 hover:shadow-sm transition-all cursor-pointer group"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {post.pinned && <span className="text-orange-500 text-sm">📌</span>}
                      <h3 className="text-lg font-bold group-hover:text-primary transition-colors">{post.title}</h3>
                    </div>
                    <p className="text-on-surface-variant text-sm mb-4 line-clamp-2">{post.content}</p>
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-[10px] font-bold">
                          {post.initial}
                        </div>
                        <span className="text-xs font-medium">{post.author}</span>
                        <span className="text-xs text-on-surface-variant">• {post.timeAgo}</span>
                      </div>
                      <div className="flex gap-2 ml-auto">
                        {post.tags.map((t: string) => (
                          <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-medium">#{t}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2 shrink-0 ml-4">
                    <div className="flex items-center gap-1 text-on-surface-variant bg-surface-container-low px-2 py-1 rounded text-sm font-medium">
                      <span className="material-symbols-outlined text-[16px]">thumb_up</span>
                      {post.voteCount}
                    </div>
                    <div className="flex items-center gap-1 text-on-surface-variant text-sm font-medium">
                      <span className="material-symbols-outlined text-[16px]">chat_bubble</span>
                      {post.commentCount}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="max-w-4xl mx-auto">
          <button 
            onClick={() => setView('list')}
            className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors mb-6 font-semibold"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Quay lại
          </button>

          {selectedPost && (
            <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-8 mb-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">
                  {selectedPost.initial}
                </div>
                <div>
                  <div className="font-bold">{selectedPost.author}</div>
                  <div className="text-xs text-on-surface-variant">{selectedPost.timeAgo}</div>
                </div>
              </div>

              <h1 className="text-2xl font-bold mb-4">{selectedPost.title}</h1>
              <p className="text-on-surface leading-relaxed mb-6 whitespace-pre-wrap">{selectedPost.content}</p>

              <div className="flex gap-2 mb-8">
                {selectedPost.tags.map((t: string) => (
                  <span key={t} className="text-xs px-3 py-1 rounded-full bg-surface-container text-on-surface-variant font-medium">#{t}</span>
                ))}
              </div>

              <div className="flex items-center gap-4 pt-4 border-t border-outline-variant/30">
                <button className="flex items-center gap-2 text-primary bg-primary/10 px-4 py-2 rounded-xl font-semibold hover:bg-primary/20 transition-colors">
                  <span className="material-symbols-outlined">thumb_up</span>
                  {selectedPost.voteCount} Upvotes
                </button>
                <div className="flex items-center gap-2 text-on-surface-variant font-medium">
                  <span className="material-symbols-outlined">chat_bubble</span>
                  {selectedPost.commentCount} Bình luận
                </div>
              </div>
            </div>
          )}

          <div className="mb-6">
            <h3 className="font-bold mb-4">Bình luận</h3>
            <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-4 mb-6">
              <textarea 
                className="w-full border-none outline-none resize-none bg-transparent text-on-surface placeholder:text-on-surface-variant min-h-[80px]"
                placeholder="Viết bình luận của bạn..."
              ></textarea>
              <div className="flex justify-end mt-2">
                <button className="bg-primary !text-white font-semibold rounded-xl px-5 py-2 hover:opacity-90 transition-opacity">
                  Bình luận
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {selectedPost?.comments?.map((comment: any) => (
                <div key={comment.id} className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center text-secondary font-bold text-sm">
                      {comment.initial}
                    </div>
                    <div>
                      <div className="font-bold text-sm">{comment.author}</div>
                      <div className="text-xs text-on-surface-variant">{comment.timeAgo}</div>
                    </div>
                  </div>
                  <p className="text-on-surface text-sm">{comment.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col">
            <div className="p-6 border-b border-outline-variant/30 flex items-center justify-between">
              <h2 className="text-xl font-bold">Tạo bài viết mới</h2>
              <button onClick={() => setShowModal(false)} className="text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined">{t.community.title || 'close'}</span>
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Tiêu đề</label>
                <input 
                  type="text" 
                  value={newPost.title}
                  onChange={e => setNewPost({...newPost, title: e.target.value})}
                  className="w-full border border-outline-variant/60 rounded-xl px-4 py-3 bg-surface-container-lowest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
                  placeholder="Nhập tiêu đề ngắn gọn..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Nội dung</label>
                <textarea 
                  value={newPost.content}
                  onChange={e => setNewPost({...newPost, content: e.target.value})}
                  className="w-full border border-outline-variant/60 rounded-xl px-4 py-3 bg-surface-container-lowest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 min-h-[150px] resize-y"
                  placeholder="Mô tả chi tiết câu hỏi hoặc chia sẻ của bạn..."
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Tags (cách nhau bởi dấu phẩy)</label>
                <input 
                  type="text" 
                  value={newPost.tags}
                  onChange={e => setNewPost({...newPost, tags: e.target.value})}
                  className="w-full border border-outline-variant/60 rounded-xl px-4 py-3 bg-surface-container-lowest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
                  placeholder="vd: networking, cloud, exam"
                />
              </div>
            </div>
            <div className="p-6 border-t border-outline-variant/30 flex justify-end gap-3 bg-surface-container/30">
              <button 
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 rounded-xl font-semibold text-on-surface-variant hover:bg-surface-container transition-colors"
              >
                Hủy
              </button>
              <button 
                onClick={() => setShowModal(false)}
                className="bg-primary !text-white font-semibold rounded-xl px-5 py-2.5 hover:opacity-90 transition-opacity"
              >
                Đăng bài
              </button>
            </div>
          </div>
        </div>
      )}
    </LearnerShell>
  );
}
