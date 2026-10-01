'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LearnerShell } from '@/shared/layout';
import { lessonTracks } from '@/shared/lib/lesson-tracks';

export default function LearningCatalogPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const modules = [
    {
      id: 'vocab',
      title: 'Vocabulary',
      description: 'Master essential words for coding, meetings, and daily tech operations.',
      icon: 'font_download',
      href: '/learn/flashcards',
      bgClass: 'bg-primary/10',
      bgOpacity: 'opacity-50',
      textClass: 'text-primary',
      groupHoverBgClass: 'group-hover:bg-primary',
      groupHoverTextClass: 'group-hover:text-white',
      borderLeftClass: '',
    },
    ...lessonTracks.map(track => ({ id: track.type, title: track.label, description: track.description, icon: track.icon, href: `/learn/lessons?type=${track.type}`, bgClass: 'bg-primary/10', bgOpacity: 'opacity-50', textClass: 'text-primary', groupHoverBgClass: 'group-hover:bg-primary', groupHoverTextClass: 'group-hover:text-white', borderLeftClass: '' })),
  ];
  const visibleModules = modules.filter(module => `${module.title} ${module.description}`.toLocaleLowerCase('vi').includes(searchQuery.trim().toLocaleLowerCase('vi')));

  return (
    <LearnerShell>
      <div className="flex-grow w-full py-4">
        {/* Header & Search/Filters Section */}
        <section className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
            <div>
              <h1 className="text-[30px] font-bold text-on-surface mb-2 leading-[38px] tracking-[-0.02em]">
                Danh mục học tập
              </h1>
              <p className="text-[14px] text-on-surface-variant">
                Khám phá các học phần tiếng Anh chuyên ngành phù hợp với định hướng nghề nghiệp CNTT của bạn.
              </p>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="bg-surface-container-lowest rounded-lg border border-outline-variant p-4 flex flex-col md:flex-row gap-4 items-center shadow-sm hover:shadow-md transition-shadow duration-300">
            {/* Search Input */}
            <div className="relative w-full md:flex-grow">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm bài học, từ vựng..."
                className="w-full pl-10 pr-4 py-2 border border-outline-variant rounded bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-[14px] placeholder:text-on-surface-variant transition-all"
              />
            </div>

          </div>
        </section>

        {/* Catalog Grid */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {visibleModules.map((module) => (
              <Link
                key={module.id}
                href={module.href}
                className={`group block bg-surface-container-lowest rounded-lg border border-outline-variant p-6 hover:shadow-[0_1px_3px_rgba(15,23,24,0.06)] transition-all duration-300 relative overflow-hidden ${module.borderLeftClass}`}
              >
                <div
                  className={`absolute top-0 right-0 w-32 h-32 ${module.bgClass} rounded-bl-full -z-10 ${module.bgOpacity} group-hover:scale-110 transition-transform duration-500`}
                />
                <div
                  className={`w-12 h-12 bg-surface-container flex items-center justify-center rounded-lg mb-4 ${module.textClass} ${module.groupHoverBgClass} ${module.groupHoverTextClass} transition-colors duration-300`}
                >
                  <span className="material-symbols-outlined">{module.icon}</span>
                </div>
                <h3 className="text-[20px] font-semibold text-on-surface mb-1">
                  {module.title}
                </h3>
                <p className="text-[14px] text-on-surface-variant mb-4">
                  {module.description}
                </p>
                <div className={`flex items-center ${module.textClass} text-[14px] font-semibold`}>
                  <span>Khám phá chuyên đề</span>
                  <span className="material-symbols-outlined ml-1 group-hover:translate-x-1 transition-transform duration-300 text-[18px]">
                    arrow_forward
                  </span>
                </div>
              </Link>
            ))}
            {!visibleModules.length && <p className="text-sm text-on-surface-variant">Không có chuyên đề phù hợp.</p>}
          </div>
        </section>
      </div>
    </LearnerShell>
  );
}
