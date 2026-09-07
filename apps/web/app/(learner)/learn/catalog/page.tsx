'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LearnerShell } from '@/shared/layout';

export default function LearningCatalogPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [itFieldFilter, setItFieldFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');

  const modules = [
    {
      id: 'vocab',
      title: 'Vocabulary',
      description: 'Master essential words for coding, meetings, and daily tech operations.',
      icon: 'font_download',
      href: '/learn/modules/vocab',
      bgClass: 'bg-primary/10',
      bgOpacity: 'opacity-50',
      textClass: 'text-primary',
      groupHoverBgClass: 'group-hover:bg-primary',
      groupHoverTextClass: 'group-hover:text-white',
      borderLeftClass: '',
    },
    {
      id: 'terminology',
      title: 'Technical Terminology',
      description: 'Deep dive into specific jargon for networking, databases, and algorithms.',
      icon: 'memory',
      href: '/learn/modules/terminology',
      bgClass: 'bg-tertiary/10',
      bgOpacity: 'opacity-50',
      textClass: 'text-tertiary',
      groupHoverBgClass: 'group-hover:bg-tertiary',
      groupHoverTextClass: 'group-hover:text-white',
      borderLeftClass: '',
    },
    {
      id: 'reading',
      title: 'Technical Reading',
      description: 'Improve comprehension with real-world articles, RFCs, and engineering blogs.',
      icon: 'menu_book',
      href: '/learn/modules/reading',
      bgClass: 'bg-secondary/10',
      bgOpacity: 'opacity-50',
      textClass: 'text-secondary',
      groupHoverBgClass: 'group-hover:bg-secondary',
      groupHoverTextClass: 'group-hover:text-white',
      borderLeftClass: '',
    },
    {
      id: 'api-doc',
      title: 'API Documentation',
      description: 'Learn to read and write clear, standard API docs (REST, GraphQL).',
      icon: 'api',
      href: '/learn/modules/api-doc',
      bgClass: 'bg-[#F5F3FF]', // ai-accent equivalent
      bgOpacity: 'opacity-50',
      textClass: 'text-secondary-container',
      groupHoverBgClass: 'group-hover:bg-secondary-container',
      groupHoverTextClass: 'group-hover:text-white',
      borderLeftClass: 'border-l-4 border-l-[#F5F3FF]',
    },
    {
      id: 'system-design',
      title: 'System Design',
      description: 'Language for describing architectures, trade-offs, and scalability.',
      icon: 'architecture',
      href: '/learn/modules/system-design',
      bgClass: 'bg-surface-container-high',
      bgOpacity: 'opacity-50',
      textClass: 'text-on-surface',
      groupHoverBgClass: 'group-hover:bg-on-surface',
      groupHoverTextClass: 'group-hover:text-white',
      borderLeftClass: '',
    },
    {
      id: 'case-study',
      title: 'Case Study',
      description: 'Analyze tech company case studies and project post-mortems.',
      icon: 'assignment',
      href: '/learn/modules/case-study',
      bgClass: 'bg-primary-container',
      bgOpacity: 'opacity-10',
      textClass: 'text-primary-container',
      groupHoverBgClass: 'group-hover:bg-primary-container',
      groupHoverTextClass: 'group-hover:text-white',
      borderLeftClass: '',
    },
  ];

  return (
    <LearnerShell>
      <div className="flex-grow w-full py-4">
        {/* Header & Search/Filters Section */}
        <section className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
            <div>
              <h1 className="text-[30px] font-bold text-on-surface mb-2 leading-[38px] tracking-[-0.02em]">
                Learning Catalog
              </h1>
              <p className="text-[14px] text-on-surface-variant">
                Explore specialized technical English modules designed for your IT career path.
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

            {/* Filters */}
            <div className="flex w-full md:w-auto gap-2">
              {/* IT Field Filter */}
              <div className="relative w-full md:w-48">
                <select
                  value={itFieldFilter}
                  onChange={(e) => setItFieldFilter(e.target.value)}
                  className="w-full appearance-none pl-3 pr-8 py-2 border border-outline-variant rounded bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary text-[14px] text-on-surface cursor-pointer"
                >
                  <option value="">All IT Fields</option>
                  <option value="frontend">Frontend Development</option>
                  <option value="backend">Backend Development</option>
                  <option value="data">Data Science</option>
                  <option value="devops">DevOps &amp; Cloud</option>
                </select>
                <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-outline pointer-events-none">
                  arrow_drop_down
                </span>
              </div>

              {/* Level Filter */}
              <div className="relative w-full md:w-40">
                <select
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                  className="w-full appearance-none pl-3 pr-8 py-2 border border-outline-variant rounded bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary text-[14px] text-on-surface cursor-pointer"
                >
                  <option value="">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="professional">Professional</option>
                </select>
                <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-outline pointer-events-none">
                  arrow_drop_down
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Catalog Grid */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((module) => (
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
                  <span>Explore Modules</span>
                  <span className="material-symbols-outlined ml-1 group-hover:translate-x-1 transition-transform duration-300 text-[18px]">
                    arrow_forward
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </LearnerShell>
  );
}
