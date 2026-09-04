'use client';

import React, { useState, useEffect } from 'react';
import { LearnerShell } from '@/shared/layout';
import { apiClient } from '@/shared/api/api-client';
import { useI18n } from '@/shared/i18n';

export default function SmartReviewPage() {
  const { t } = useI18n();
  const [vocab, setVocab] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [stats, setStats] = useState({ reviewedToday: 0, retentionRate: 85, streak: 5 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res: any = await apiClient.get('/vocabulary?limit=50');
        const items = res?.data ?? res ?? [];
        if (Array.isArray(items) && items.length > 0) {
          setVocab(items);
        } else {
          setVocab([
            { id: 1, term: 'Scalability', phonetic: '/ˌskeɪ.ləˈbɪl.ə.ti/', meaning: 'Khả năng mở rộng', example: 'The system was designed with scalability in mind.' },
            { id: 2, term: 'Latency', phonetic: '/ˈleɪ.tən.si/', meaning: 'Độ trễ', example: 'Low latency is crucial for real-time applications.' },
            { id: 3, term: 'Redundancy', phonetic: '/rɪˈdʌn.dən.si/', meaning: 'Sự dự phòng', example: 'Data redundancy ensures high availability.' },
            { id: 4, term: 'Deployment', phonetic: '/dɪˈplɔɪ.mənt/', meaning: 'Triển khai', example: 'We have a new deployment scheduled for tonight.' },
            { id: 5, term: 'Throughput', phonetic: '/ˈθruː.pʊt/', meaning: 'Thông lượng', example: 'The new server handles higher throughput.' },
          ]);
        }
      } catch (error) {
        setVocab([
            { id: 1, term: 'Scalability', phonetic: '/ˌskeɪ.ləˈbɪl.ə.ti/', meaning: 'Khả năng mở rộng', example: 'The system was designed with scalability in mind.' },
            { id: 2, term: 'Latency', phonetic: '/ˈleɪ.tən.si/', meaning: 'Độ trễ', example: 'Low latency is crucial for real-time applications.' },
            { id: 3, term: 'Redundancy', phonetic: '/rɪˈdʌn.dən.si/', meaning: 'Sự dự phòng', example: 'Data redundancy ensures high availability.' },
            { id: 4, term: 'Deployment', phonetic: '/dɪˈplɔɪ.mənt/', meaning: 'Triển khai', example: 'We have a new deployment scheduled for tonight.' },
            { id: 5, term: 'Throughput', phonetic: '/ˈθruː.pʊt/', meaning: 'Thông lượng', example: 'The new server handles higher throughput.' },
        ]);
      }
    };
    fetchData();
  }, []);

  const handleNext = (status: string) => {
    setFlipped(false);
    setTimeout(() => {
      setCurrentIndex(prev => (prev + 1 < vocab.length ? prev + 1 : 0));
      setStats(prev => ({ ...prev, reviewedToday: prev.reviewedToday + 1 }));
    }, 150);
  };

  const currentWord = vocab[currentIndex];

  return (
    <LearnerShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary mb-1">AI Smart Review - Ôn tập thông minh</h1>
        <p className="text-on-surface-variant text-sm">AI phân tích điểm yếu và đề xuất nội dung cần ôn</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[400px]">
            {currentWord ? (
              <div className="w-full max-w-md perspective-1000 mb-8" onClick={() => setFlipped(!flipped)}>
                <div className={`relative w-full h-64 transition-all duration-500 [transform-style:preserve-3d] cursor-pointer ${flipped ? '[transform:rotateY(180deg)]' : ''}`}>
                  <div className="absolute inset-0 w-full h-full backface-hidden bg-surface-container border border-outline-variant/40 rounded-2xl flex flex-col items-center justify-center p-6 shadow-sm">
                    <span className="text-3xl font-bold text-on-surface mb-2">{currentWord.term}</span>
                    <span className="text-on-surface-variant font-mono">{currentWord.phonetic || ''}</span>
                  </div>
                  <div className="absolute inset-0 w-full h-full backface-hidden bg-primary/5 border border-primary/20 rounded-2xl flex flex-col items-center justify-center p-6 shadow-sm [transform:rotateY(180deg)]">
                    <span className="text-xl font-bold text-primary mb-4">{currentWord.meaning}</span>
                    <p className="text-center text-on-surface italic">"{currentWord.example}"</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            )}
            
            <div className="flex items-center gap-4 w-full max-w-md">
              <button onClick={() => handleNext('hard')} className="flex-1 py-2.5 rounded-xl border border-red-200 bg-red-50 text-red-600 font-semibold hover:bg-red-100 transition-colors">Không nhớ</button>
              <button onClick={() => handleNext('medium')} className="flex-1 py-2.5 rounded-xl border border-yellow-200 bg-yellow-50 text-yellow-600 font-semibold hover:bg-yellow-100 transition-colors">Gần được</button>
              <button onClick={() => handleNext('easy')} className="flex-1 py-2.5 rounded-xl border border-green-200 bg-green-50 text-green-600 font-semibold hover:bg-green-100 transition-colors">Nhớ rồi</button>
            </div>
            
            <div className="mt-6 text-sm font-medium text-on-surface-variant">
              Tiến độ: {currentIndex + (vocab.length > 0 ? 1 : 0)} / {vocab.length} từ đã ôn
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-4">Thống kê hôm nay</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-outline-variant/20">
                <span className="text-on-surface-variant">Từ đã ôn</span>
                <span className="font-bold text-lg">{stats.reviewedToday}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-outline-variant/20">
                <span className="text-on-surface-variant">Tỷ lệ nhớ</span>
                <span className="font-bold text-lg text-green-600">{stats.retentionRate}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant">Chuỗi ngày học (Streak)</span>
                <span className="font-bold text-lg text-orange-500">{stats.streak} 🔥</span>
              </div>
            </div>
          </div>
          
          <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-4">Chủ đề (Domains)</h3>
            <div className="flex flex-wrap gap-2">
              {['Tất cả', 'Cloud Computing', 'Networking', 'Security', 'DevOps'].map(domain => (
                <button key={domain} className="px-3 py-1.5 rounded-lg border border-outline-variant/50 text-sm hover:bg-surface-container transition-colors">
                  {domain}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </LearnerShell>
  );
}
