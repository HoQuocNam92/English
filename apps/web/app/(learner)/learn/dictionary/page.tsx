'use client';

import React, { useState, useEffect } from 'react';
import { LearnerShell } from '@/shared/layout';
import { apiClient } from '@/shared/api/api-client';
import { useI18n } from '@/shared/i18n';

export default function DictionaryPage() {
  const { t } = useI18n();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [vocabList, setVocabList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeLetter, setActiveLetter] = useState<string | null>(null);

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const fetchVocab = async () => {
      setLoading(true);
      try {
        const query = debouncedSearch ? `?search=${debouncedSearch}&limit=20` : '?limit=20';
        const res: any = await apiClient.get(`/vocabulary${query}`);
        let items = res?.data ?? res ?? [];
        if (!Array.isArray(items)) {
            items = items.items || [];
        }
        
        if (items.length === 0 && !debouncedSearch) {
          items = [
            { id: 1, term: 'Algorithm', pos: 'noun', phonetic: '/ˈæl.ɡə.rɪ.ðəm/', meaning: 'Thuật toán', example: 'We need a better algorithm to sort this data.' },
            { id: 2, term: 'Bandwidth', pos: 'noun', phonetic: '/ˈbænd.wɪdθ/', meaning: 'Băng thông', example: 'The network lacks the bandwidth for video streaming.' },
            { id: 3, term: 'Compile', pos: 'verb', phonetic: '/kəmˈpaɪl/', meaning: 'Biên dịch', example: 'It takes a few minutes to compile the code.' },
            { id: 4, term: 'Database', pos: 'noun', phonetic: '/ˈdeɪ.tə.beɪs/', meaning: 'Cơ sở dữ liệu', example: 'The user information is stored in the database.' },
            { id: 5, term: 'Encryption', pos: 'noun', phonetic: '/ɪnˈkrɪp.ʃən/', meaning: 'Mã hóa', example: 'End-to-end encryption secures the communication.' },
            { id: 6, term: 'Framework', pos: 'noun', phonetic: '/ˈfreɪm.wɜːk/', meaning: 'Khung ứng dụng', example: 'React is a popular JavaScript framework.' },
          ];
        }
        setVocabList(items);
      } catch (error) {
        setVocabList([
            { id: 1, term: 'Algorithm', pos: 'noun', phonetic: '/ˈæl.ɡə.rɪ.ðəm/', meaning: 'Thuật toán', example: 'We need a better algorithm to sort this data.' },
            { id: 2, term: 'Bandwidth', pos: 'noun', phonetic: '/ˈbænd.wɪdθ/', meaning: 'Băng thông', example: 'The network lacks the bandwidth for video streaming.' },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchVocab();
  }, [debouncedSearch]);

  const displayList = activeLetter 
    ? vocabList.filter(v => v.term.toUpperCase().startsWith(activeLetter))
    : vocabList;

  return (
    <LearnerShell>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary mb-1">{t.dictionary.title || 'Technical Dictionary'}</h1>
        <p className="text-on-surface-variant text-sm">Từ điển thuật ngữ IT chuyên ngành</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-9 flex flex-col gap-6">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
            <input
              type="text"
              placeholder="Tìm từ kỹ thuật IT..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-outline-variant/60 rounded-xl pl-12 pr-4 py-4 bg-surface-container-lowest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 text-lg shadow-sm"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            )}
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-4 flex flex-wrap gap-1 justify-center">
            <button 
              onClick={() => setActiveLetter(null)}
              className={`w-8 h-8 rounded flex items-center justify-center text-sm font-medium transition-colors ${!activeLetter ? 'bg-primary text-white' : 'hover:bg-surface-container'}`}
            >
              All
            </button>
            {alphabet.map(letter => (
              <button
                key={letter}
                onClick={() => setActiveLetter(letter === activeLetter ? null : letter)}
                className={`w-8 h-8 rounded flex items-center justify-center text-sm font-medium transition-colors ${activeLetter === letter ? 'bg-primary text-white' : 'hover:bg-surface-container'}`}
              >
                {letter}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center p-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : displayList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {displayList.map(item => (
                <div key={item.id} className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-5 hover:border-primary/40 hover:shadow-md transition-all cursor-pointer group">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-primary group-hover:text-primary">{item.term}</h3>
                    {item.pos && <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-surface-container rounded text-on-surface-variant">{item.pos}</span>}
                  </div>
                  <div className="text-sm text-on-surface-variant font-mono mb-3">{item.phonetic}</div>
                  <p className="font-medium mb-2">{item.meaning}</p>
                  <p className="text-sm text-on-surface-variant italic line-clamp-2">"{item.example}"</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-12 text-center">
              <span className="material-symbols-outlined text-6xl text-on-surface-variant/50 mb-4">search_off</span>
              <h3 className="text-xl font-bold mb-2">Không tìm thấy từ vựng</h3>
              <p className="text-on-surface-variant mb-6">Thử tìm kiếm với từ khóa khác hoặc xem các gợi ý bên dưới.</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {['Database', 'API', 'Frontend', 'Deployment'].map(s => (
                  <button key={s} onClick={() => setSearchTerm(s)} className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors text-sm font-medium">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-3">
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 sticky top-24">
            <h3 className="text-sm font-bold uppercase tracking-wider text-primary mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">star</span>
              Từ của ngày hôm nay
            </h3>
            <div className="text-2xl font-bold text-primary mb-1">Polymorphism</div>
            <div className="text-sm text-on-surface-variant font-mono mb-4">/ˌpɒl.iˈmɔː.fɪ.zəm/</div>
            <div className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-primary/10 rounded text-primary inline-block mb-4">Noun</div>
            <p className="font-medium mb-4">Tính đa hình (trong lập trình hướng đối tượng)</p>
            <p className="text-sm text-on-surface-variant italic">"Polymorphism allows objects of different types to be treated as objects of a common type."</p>
          </div>
        </div>
      </div>
    </LearnerShell>
  );
}
