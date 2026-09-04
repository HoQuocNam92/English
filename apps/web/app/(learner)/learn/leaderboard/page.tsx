'use client';

import { useState, useEffect } from 'react';
import { LearnerShell } from '@/shared/layout';
import { apiClient } from '@/shared/api/api-client';
import { useI18n } from '@/shared/i18n';

export default function LeaderboardPage() {
  const { t } = useI18n();
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [period, setPeriod] = useState('weekly');
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const authRes: any = await apiClient.get('/auth/me');
        if (authRes) setCurrentUser(authRes.data ?? authRes.user ?? authRes);
      } catch (e) {
        setCurrentUser({ id: 999, name: 'You', points: 1250, rank: 124, lessons: 14 });
      }

      try {
        const streakRes: any = await apiClient.get('/leaderboard/streaks/me');
        if (streakRes) {
          const streakData = streakRes.data ?? streakRes;
          setCurrentUser((prev: any) => ({ ...prev, ...streakData }));
        }
      } catch (e) {}

      try {
        const res: any = await apiClient.get(`/leaderboard/top?period=${period}`);
        if (res) {
          const data = res.data ?? res;
          if (Array.isArray(data)) {
            setLeaderboard(data.map(item => ({
              id: item.userId,
              name: item.displayName || 'Unknown',
              points: item.expPoints || 0,
              lessons: item.currentStreak || 0,
              rank: item.rank || 0,
              avatarUrl: item.avatarUrl
            })));
          } else {
            setLeaderboard(data);
          }
        }
      } catch (error) {
        setLeaderboard([
          { id: 1, name: 'Hoang Nguyen', points: 15200, lessons: 120, rank: 1 },
          { id: 2, name: 'Minh Tran', points: 12450, lessons: 98, rank: 2 },
          { id: 3, name: 'Lan Pham', points: 11890, lessons: 90, rank: 3 },
          { id: 4, name: 'Tuan Le', points: 9420, lessons: 84, rank: 4 },
          { id: 5, name: 'Mai Vu', points: 8950, lessons: 76, rank: 5 },
          { id: 6, name: 'Duy Quang', points: 8100, lessons: 72, rank: 6 },
          { id: 7, name: 'Bao Ngo', points: 7650, lessons: 68, rank: 7 },
        ]);
      }
    };
    fetchData();
  }, [period]);

  const top3 = leaderboard.filter(u => u.rank <= 3).sort((a, b) => a.rank - b.rank);
  const rest = leaderboard.filter(u => u.rank > 3);

  return (
    <LearnerShell>
      <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto py-6">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-on-surface mb-2">{t.leaderboard.title}</h1>
            <p className="text-sm md:text-base text-on-surface/70">{t.leaderboard.subtitle}</p>
          </div>
          <div className="flex gap-2">
            <select value={period} onChange={(e) => setPeriod(e.target.value)} className="h-10 pl-4 pr-8 bg-surface-container-lowest border border-outline-variant/40 rounded-lg text-sm text-on-surface outline-none cursor-pointer">
              <option value="weekly">{t.leaderboard.weekly}</option>
              <option value="monthly">{t.leaderboard.monthly}</option>
              <option value="all">{t.leaderboard.allTime}</option>
            </select>
          </div>
        </div>

        {/* Podium (Top 3) */}
        {top3.length >= 3 && (
          <div className="flex justify-center items-end gap-4 md:gap-8 mb-8 mt-8">
            {/* Rank 2 */}
            <div className="flex flex-col items-center z-10">
              <div className="relative mb-4">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gray-200 border-4 border-gray-300 flex items-center justify-center text-xl font-bold text-gray-500">{top3[1].name.charAt(0)}</div>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-bold text-gray-600">2</div>
              </div>
              <div className="text-center mb-4">
                <h3 className="font-bold text-on-surface text-sm md:text-base">{top3[1].name}</h3>
                <p className="text-xs md:text-sm text-primary font-semibold mt-1">{top3[1].points.toLocaleString()} pts</p>
              </div>
              <div className="w-24 md:w-32 h-[100px] bg-surface-container-lowest border border-outline-variant/40 border-b-0 rounded-t-xl"></div>
            </div>

            {/* Rank 1 */}
            <div className="flex flex-col items-center z-20">
              <div className="relative mb-4">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-yellow-100 border-4 border-yellow-400 flex items-center justify-center text-3xl font-bold text-yellow-600 shadow-md relative z-10">{top3[0].name.charAt(0)}</div>
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-yellow-500">
                  <span className="material-symbols-outlined text-4xl">workspace_premium</span>
                </div>
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-yellow-200 border-2 border-white flex items-center justify-center font-bold text-yellow-800 z-20">1</div>
              </div>
              <div className="text-center mb-4">
                <h3 className="text-lg md:text-xl font-bold text-on-surface">{top3[0].name}</h3>
                <p className="font-bold text-primary mt-1">{top3[0].points.toLocaleString()} pts</p>
              </div>
              <div className="w-28 md:w-40 h-[140px] bg-primary border border-primary/20 border-b-0 rounded-t-xl shadow-lg"></div>
            </div>

            {/* Rank 3 */}
            <div className="flex flex-col items-center z-10">
              <div className="relative mb-4">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-orange-100 border-4 border-orange-200 flex items-center justify-center text-xl font-bold text-orange-500">{top3[2].name.charAt(0)}</div>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-orange-200 border-2 border-white flex items-center justify-center text-xs font-bold text-orange-800">3</div>
              </div>
              <div className="text-center mb-4">
                <h3 className="font-bold text-on-surface text-sm md:text-base">{top3[2].name}</h3>
                <p className="text-xs md:text-sm text-primary font-semibold mt-1">{top3[2].points.toLocaleString()} pts</p>
              </div>
              <div className="w-24 md:w-32 h-[80px] bg-surface-container-lowest border border-outline-variant/40 border-b-0 rounded-t-xl"></div>
            </div>
          </div>
        )}

        {/* Table List */}
        <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-xl overflow-hidden shadow-2xs">
          <div className="grid grid-cols-12 gap-4 py-3 px-6 border-b border-outline-variant/40 bg-surface-container-low text-xs font-bold text-on-surface/70 uppercase">
            <div className="col-span-2 md:col-span-1 text-center">{t.leaderboard.rank}</div>
            <div className="col-span-6 md:col-span-5">{t.leaderboard.player}</div>
            <div className="col-span-4 md:col-span-3 text-right">{t.leaderboard.exp}</div>
            <div className="hidden md:block md:col-span-3 text-right">{t.leaderboard.lessons}</div>
          </div>
          
          <div className="divide-y divide-outline-variant/20">
            {rest.map((user) => (
              <div key={user.id} className="grid grid-cols-12 gap-4 py-4 px-6 items-center hover:bg-surface-container-low transition-colors">
                <div className="col-span-2 md:col-span-1 text-center font-bold text-on-surface/70">{user.rank}</div>
                <div className="col-span-6 md:col-span-5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">{user.name.charAt(0)}</div>
                  <div>
                    <p className="font-bold text-on-surface">{user.name}</p>
                    <p className="text-xs text-on-surface/60 md:hidden">{user.lessons} {t.leaderboard.lessons}</p>
                  </div>
                </div>
                <div className="col-span-4 md:col-span-3 text-right font-bold text-primary">
                  {user.points.toLocaleString()}
                </div>
                <div className="hidden md:flex md:col-span-3 justify-end text-sm text-on-surface">
                  {user.lessons}
                </div>
              </div>
            ))}
          </div>

          {/* Current User Row */}
          {currentUser && (
            <div className="grid grid-cols-12 gap-4 py-4 px-6 items-center bg-primary/5 border-t-2 border-primary mt-2 sticky bottom-0 z-10">
              <div className="col-span-2 md:col-span-1 text-center font-bold text-primary">{currentUser.rank}</div>
              <div className="col-span-6 md:col-span-5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full border-2 border-primary bg-white flex items-center justify-center font-bold text-primary">
                  {currentUser.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-on-surface flex items-center gap-2">
                    {currentUser.name}
                    <span className="bg-primary text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">{t.leaderboard.currentUserLabel}</span>
                  </p>
                </div>
              </div>
              <div className="col-span-4 md:col-span-3 text-right font-bold text-primary">
                {currentUser.points.toLocaleString()}
              </div>
              <div className="hidden md:flex md:col-span-3 justify-end text-sm text-on-surface">
                {currentUser.lessons}
              </div>
            </div>
          )}
        </div>
      </div>
    </LearnerShell>
  );
}
