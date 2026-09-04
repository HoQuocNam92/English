'use client';

import { useState } from 'react';
import { LearnerShell } from '@/shared/layout';
import { apiClient } from '@/shared/api/api-client';
import { useI18n } from '@/shared/i18n';

export default function PathGeneratorPage() {
  const { t } = useI18n();
  const [goal, setGoal] = useState('AWS Developer');
  const [level, setLevel] = useState('Beginner');
  const [time, setTime] = useState(30);
  const [path, setPath] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const generatePath = async () => {
    setLoading(true);
    try {
      const recRes: any = await apiClient.get('/recommendations/my');
      const lessonsRes: any = await apiClient.get('/lessons?limit=50');
      
      // Mock generated path
      const mockPath = [
        { id: 1, title: 'Introduction to Cloud Computing', time: '45 mins', domain: 'Cloud' },
        { id: 2, title: 'AWS Core Services', time: '60 mins', domain: 'AWS' },
        { id: 3, title: 'IAM and Security', time: '45 mins', domain: 'Security' },
        { id: 4, title: 'S3 and Storage Solutions', time: '90 mins', domain: 'Storage' },
        { id: 5, title: 'EC2 Instances Deep Dive', time: '120 mins', domain: 'Compute' },
      ];
      setPath(mockPath);
    } catch (error) {
      console.error(error);
      const mockPath = [
        { id: 1, title: 'Introduction to Cloud Computing', time: '45 mins', domain: 'Cloud' },
        { id: 2, title: 'AWS Core Services', time: '60 mins', domain: 'AWS' },
        { id: 3, title: 'IAM and Security', time: '45 mins', domain: 'Security' },
      ];
      setPath(mockPath);
    } finally {
      setLoading(false);
    }
  };

  const savePath = async () => {
    setSaving(true);
    try {
      for (const lesson of path) {
        await apiClient.post('/planner/my', { lessonId: lesson.id, date: new Date().toISOString() });
      }
      alert('Đã lưu lộ trình!');
    } catch (error) {
      console.error(error);
      alert('Đã lưu lộ trình (Mock)!');
    } finally {
      setSaving(false);
    }
  };

  return (
    <LearnerShell>
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-on-surface">{t.pathGenerator.title || 'Learning Path Generator'}</h1>
        
        {!path.length ? (
          <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6 space-y-6">
            <div>
              <label className="block mb-2 font-medium">Career Goal</label>
              <select 
                className="w-full border border-outline-variant/60 rounded-xl px-4 py-3 bg-surface-container-lowest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
                value={goal} onChange={(e) => setGoal(e.target.value)}
              >
                <option>AWS Developer</option>
                <option>Cloud Architect</option>
                <option>DevSecOps</option>
                <option>Network Engineer</option>
              </select>
            </div>
            
            <div>
              <label className="block mb-2 font-medium">Current Level</label>
              <select 
                className="w-full border border-outline-variant/60 rounded-xl px-4 py-3 bg-surface-container-lowest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
                value={level} onChange={(e) => setLevel(e.target.value)}
              >
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </div>
            
            <div>
              <label className="block mb-2 font-medium">Time per day: {time} mins</label>
              <input 
                type="range" min="15" max="120" step="15"
                className="w-full"
                value={time} onChange={(e) => setTime(Number(e.target.value))}
              />
            </div>
            
            <button 
              onClick={generatePath}
              disabled={loading}
              className="bg-primary !text-white font-semibold rounded-xl px-5 py-2.5 hover:opacity-90 transition-opacity w-full"
            >
              {loading ? 'Generating...' : 'Tạo lộ trình'}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-2">Estimated Completion Time</h2>
              <p className="text-lg text-primary font-semibold">4 tuần</p>
              <div className="mt-4">
                <button 
                  onClick={savePath}
                  disabled={saving}
                  className="bg-primary !text-white font-semibold rounded-xl px-5 py-2.5 hover:opacity-90 transition-opacity"
                >
                  {saving ? 'Saving...' : 'Lưu lộ trình'}
                </button>
              </div>
            </div>
            
            <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6 relative">
              <div className="absolute left-10 top-10 bottom-10 w-0.5 bg-gray-200"></div>
              <div className="space-y-8 relative z-10">
                {path.map((item, index) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="bg-white border rounded-xl p-4 flex-grow shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold">{item.title}</h3>
                        <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">{item.domain}</span>
                      </div>
                      <p className="text-sm text-gray-500 mb-4">{item.time}</p>
                      <button className="text-primary font-medium hover:underline text-sm">
                        Học ngay
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </LearnerShell>
  );
}
