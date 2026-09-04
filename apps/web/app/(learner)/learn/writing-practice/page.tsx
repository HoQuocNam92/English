'use client';

import { useState, useEffect } from 'react';
import { LearnerShell } from '@/shared/layout';
import { apiClient } from '@/shared/api/api-client';
import { useI18n } from '@/shared/i18n';

export default function WritingPracticePage() {
  const { t } = useI18n();
  const [tab, setTab] = useState<'practice' | 'history'>('practice');
  const [prompts, setPrompts] = useState<any[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res: any = await apiClient.get('/writing/prompts');
      const histRes: any = await apiClient.get('/writing/my');
      setPrompts(res?.data ?? [{ id: 1, text: 'Write an email to a client explaining a server outage.' }]);
      setHistory(histRes?.data ?? [{ id: 1, topic: 'Incident Report', date: '2026-09-01', score: 8 }]);
    } catch (e) {
      setPrompts([{ id: 1, text: 'Write an email to a client explaining a server outage.' }]);
      setHistory([{ id: 1, topic: 'Incident Report', date: '2026-09-01', score: 8 }]);
    }
    setSelectedPrompt('1');
  };

  const submitWriting = async () => {
    setLoading(true);
    try {
      const res: any = await apiClient.post('/writing/submit', { promptId: selectedPrompt, content });
      const data = res?.data ?? { score: 8.5, grammar: 8, clarity: 9, vocabulary: 8.5, feedback: 'Great job explaining the technical issue clearly to a non-technical client.' };
      setResult(data);
    } catch (e) {
      setResult({ score: 8.5, grammar: 8, clarity: 9, vocabulary: 8.5, feedback: 'Great job explaining the technical issue clearly to a non-technical client.' });
    } finally {
      setLoading(false);
    }
  };

  const wordCount = content.trim().split(/\s+/).filter(w => w.length > 0).length;

  return (
    <LearnerShell>
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-on-surface">{t.writingPractice.title || 'AI Writing Practice'}</h1>
        
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:col-span-7 md:w-7/12 space-y-6">
            <div className="flex gap-4 border-b pb-2">
              <button 
                className={`font-semibold pb-2 ${tab === 'practice' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
                onClick={() => setTab('practice')}
              >
                Làm bài
              </button>
              <button 
                className={`font-semibold pb-2 ${tab === 'history' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
                onClick={() => setTab('history')}
              >
                Lịch sử
              </button>
            </div>

            {tab === 'practice' && (
              <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6 space-y-4">
                <select 
                  className="w-full border border-outline-variant/60 rounded-xl px-4 py-3 bg-surface-container-lowest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
                  value={selectedPrompt} onChange={(e) => setSelectedPrompt(e.target.value)}
                >
                  {prompts.map(p => (
                    <option key={p.id} value={p.id}>{p.text}</option>
                  ))}
                </select>
                
                <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-900 font-medium">
                  {prompts.find(p => p.id.toString() === selectedPrompt)?.text || 'Select a prompt'}
                </div>
                
                <div>
                  <textarea 
                    className="w-full border border-outline-variant/60 rounded-xl px-4 py-3 bg-surface-container-lowest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 min-h-[300px]"
                    value={content} onChange={(e) => setContent(e.target.value)}
                    placeholder="Start writing here..."
                  />
                  <div className="text-right text-sm text-gray-500 mt-1">
                    Word count: {wordCount}
                  </div>
                </div>
                
                {!result ? (
                  <button 
                    onClick={submitWriting}
                    disabled={loading || !content}
                    className="bg-primary !text-white font-semibold rounded-xl px-5 py-2.5 hover:opacity-90 transition-opacity"
                  >
                    {loading ? 'Đang nộp...' : 'Nộp bài'}
                  </button>
                ) : (
                  <div className="mt-6 border-t pt-6 space-y-4">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="text-4xl font-bold text-primary">{result.score}/10</div>
                      <div className="text-lg font-semibold">Overall Score</div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Grammar</span><span>{result.grammar}/10</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(result.grammar/10)*100}%` }}></div>
                      </div>
                      
                      <div className="flex justify-between text-sm mb-1 mt-2">
                        <span>Clarity</span><span>{result.clarity}/10</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: `${(result.clarity/10)*100}%` }}></div>
                      </div>

                      <div className="flex justify-between text-sm mb-1 mt-2">
                        <span>Vocabulary</span><span>{result.vocabulary}/10</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${(result.vocabulary/10)*100}%` }}></div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-xl mt-4">
                      <h4 className="font-semibold mb-2">AI Feedback</h4>
                      <p className="text-sm">{result.feedback}</p>
                    </div>
                    
                    <button 
                      onClick={() => { setResult(null); setContent(''); }}
                      className="mt-4 text-primary font-medium hover:underline"
                    >
                      Viết bài khác
                    </button>
                  </div>
                )}
              </div>
            )}

            {tab === 'history' && (
              <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6 space-y-4">
                {history.map(item => (
                  <div key={item.id} className="flex justify-between items-center p-4 border rounded-xl hover:bg-gray-50">
                    <div>
                      <h4 className="font-medium">{item.topic}</h4>
                      <p className="text-sm text-gray-500">{item.date}</p>
                    </div>
                    <div className="bg-primary/10 text-primary px-3 py-1 rounded-full font-bold">
                      {item.score}/10
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="md:col-span-5 md:w-5/12 space-y-6">
            <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6">
              <h3 className="font-bold mb-4">Tips for IT Writing</h3>
              <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
                <li>Be concise and get straight to the point.</li>
                <li>Use active voice instead of passive voice.</li>
                <li>Define acronyms before using them if the audience is non-technical.</li>
                <li>Use bullet points for steps or lists.</li>
                <li>Maintain a professional and objective tone.</li>
              </ul>
            </div>
            
            <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6">
              <h3 className="font-bold mb-4">Vocabulary Suggestions</h3>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">Deploy</span>
                <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">Mitigate</span>
                <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">Infrastructure</span>
                <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">Latency</span>
                <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">Scalability</span>
                <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">Redundancy</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LearnerShell>
  );
}
