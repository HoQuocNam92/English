'use client';

import * as React from 'react';
import { PageHeader } from '@/shared/ui';
import { apiClient } from '@/shared/api/api-client';

export default function AdminCertificationDetailPage() {
  return (
    <div className="p-6">
      <PageHeader title="Chi tiết Chứng chỉ" description="Giao diện cập nhật từ design" />
      <div className="mt-6">
        <div className="space-y-6">

<div className="max-w-7xl mx-auto space-y-xl">

<div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-lg shadow-[0_1px_3px_rgba(15,23,24,0.06)]">
<div className="flex flex-col md:flex-row justify-between md:items-start gap-lg">
<div className="flex gap-lg">
<div className="w-24 h-24 rounded-lg bg-surface flex items-center justify-center shrink-0 border border-outline-variant">
<img className="w-16 h-16 object-contain" data-alt="A clean, modern logo representing cloud computing, featuring a stylized cloud icon with circuit board elements in deep blue and indigo. Minimalist corporate design." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDCO4wC_Ovq2I3Q-cJ4LrF9_-6B6MuTtggT1uAWkomtHyhyMR2ZqzUgepMLtM-0QfqlPjwQcpEodr8Xf_c85SoxO8h2KCJ7eMNBKLRWDyF6E-eyrKoA0NmzH8W8EXQKiPke8mGQBWTWUdNNe39dN5s16fNV0GnOU1YEkmfUWrXl4GyZY40EXNl6kwmR6T5OFXnwBQ_kw1Vw0SA4vPhJUrBq3l38AcxXYoYdWE5sfJkcl-w57zXb0fU"/>
</div>
<div>
<h1 className="font-headline-h1 text-headline-h1 text-on-surface mb-xs">AWS Certified Cloud Practitioner</h1>
<p className="font-body-md text-body-md text-on-surface-variant mb-md">Foundational certification validating overall understanding of the AWS Cloud platform.</p>
<div className="flex flex-wrap gap-md">
<span className="inline-flex items-center gap-xs px-2.5 py-0.5 rounded-full text-xs font-interface-sb bg-surface-container-high text-on-surface">
<span className="material-symbols-outlined" >cloud</span>
                                        Cloud Computing
                                    </span>
<span className="inline-flex items-center gap-xs px-2.5 py-0.5 rounded-full text-xs font-interface-sb bg-surface-container-high text-on-surface">
<span className="material-symbols-outlined" >trending_up</span>
                                        Intermediate
                                    </span>
<span className="inline-flex items-center gap-xs px-2.5 py-0.5 rounded-full text-xs font-interface-sb bg-primary-container text-on-primary-container">
<span className="material-symbols-outlined" >check_circle</span>
                                        Active
                                    </span>
</div>
</div>
</div>
<div className="flex gap-sm">
<button className="px-md py-sm border border-outline-variant rounded-lg font-interface-sb text-on-surface hover:bg-surface-container transition-colors">Edit Details</button>
<button className="px-md py-sm bg-primary text-on-primary rounded-lg font-interface-sb hover:bg-opacity-90 transition-colors">Publish Updates</button>
</div>
</div>
</div>

<div className="border-b border-outline-variant">
<nav aria-label="Tabs" className="flex space-x-lg overflow-x-auto">
<button className="border-b-2 border-primary py-sm px-1 text-primary font-interface-sb whitespace-nowrap">Tổng quan</button>
<button className="border-b-2 border-transparent py-sm px-1 text-on-surface-variant hover:text-on-surface font-body-md whitespace-nowrap transition-colors">Chủ đề</button>
<button className="border-b-2 border-transparent py-sm px-1 text-on-surface-variant hover:text-on-surface font-body-md whitespace-nowrap transition-colors">Nội dung học</button>
<button className="border-b-2 border-transparent py-sm px-1 text-on-surface-variant hover:text-on-surface font-body-md whitespace-nowrap transition-colors">Câu hỏi</button>
<button className="border-b-2 border-transparent py-sm px-1 text-on-surface-variant hover:text-on-surface font-body-md whitespace-nowrap transition-colors">Bài kiểm tra</button>
<button className="border-b-2 border-transparent py-sm px-1 text-on-surface-variant hover:text-on-surface font-body-md whitespace-nowrap transition-colors">Người học</button>
</nav>
</div>

<div className="grid grid-cols-1 md:grid-cols-3 gap-lg">

<div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
<div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-md flex items-center justify-between shadow-[0_1px_3px_rgba(15,23,24,0.06)] hover:shadow-md transition-shadow">
<div>
<p className="font-body-sm text-body-sm text-on-surface-variant mb-xs">Total Students</p>
<p className="font-headline-h2 text-headline-h2 text-on-surface">1,248</p>
</div>
<div className="w-12 h-12 rounded-full bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed">
<span className="material-symbols-outlined">group</span>
</div>
</div>
<div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-md flex items-center justify-between shadow-[0_1px_3px_rgba(15,23,24,0.06)] hover:shadow-md transition-shadow">
<div>
<p className="font-body-sm text-body-sm text-on-surface-variant mb-xs">Avg. Completion</p>
<p className="font-headline-h2 text-headline-h2 text-on-surface">62%</p>
</div>
<div className="w-12 h-12 rounded-full bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed">
<span className="material-symbols-outlined">donut_large</span>
</div>
</div>
<div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-md flex items-center justify-between shadow-[0_1px_3px_rgba(15,23,24,0.06)] hover:shadow-md transition-shadow">
<div>
<p className="font-body-sm text-body-sm text-on-surface-variant mb-xs">Total Topics</p>
<p className="font-headline-h2 text-headline-h2 text-on-surface">14</p>
</div>
<div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed">
<span className="material-symbols-outlined">view_list</span>
</div>
</div>
<div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-md flex items-center justify-between shadow-[0_1px_3px_rgba(15,23,24,0.06)] hover:shadow-md transition-shadow">
<div>
<p className="font-body-sm text-body-sm text-on-surface-variant mb-xs">Questions Pool</p>
<p className="font-headline-h2 text-headline-h2 text-on-surface">350</p>
</div>
<div className="w-12 h-12 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant">
<span className="material-symbols-outlined">help_center</span>
</div>
</div>
</div>

<div className="md:col-span-2 bg-surface-container-lowest rounded-xl border border-outline-variant p-lg shadow-[0_1px_3px_rgba(15,23,24,0.06)]">
<div className="flex justify-between items-center mb-lg">
<h3 className="font-headline-h3 text-headline-h3 text-on-surface">Enrollment &amp; Completion Trend</h3>
<select className="text-sm border-outline-variant rounded-md text-on-surface-variant focus:ring-primary focus:border-primary">
<option>Last 30 Days</option>
<option>Last 3 Months</option>
<option>This Year</option>
</select>
</div>

<div className="h-64 w-full rounded-lg bg-surface flex items-end justify-between px-md pt-lg pb-sm border-x border-b border-outline-variant relative">

<div className="absolute inset-0 flex flex-col justify-between py-sm pointer-events-none opacity-20">
<div className="border-b border-outline w-full"></div>
<div className="border-b border-outline w-full"></div>
<div className="border-b border-outline w-full"></div>
<div className="border-b border-outline w-full"></div>
</div>

<div className="w-8 bg-secondary-fixed rounded-t-sm h-[40%] relative z-10 hover:bg-secondary transition-colors"></div>
<div className="w-8 bg-secondary-fixed rounded-t-sm h-[55%] relative z-10 hover:bg-secondary transition-colors"></div>
<div className="w-8 bg-secondary-fixed rounded-t-sm h-[30%] relative z-10 hover:bg-secondary transition-colors"></div>
<div className="w-8 bg-secondary-fixed rounded-t-sm h-[70%] relative z-10 hover:bg-secondary transition-colors"></div>
<div className="w-8 bg-secondary-fixed rounded-t-sm h-[65%] relative z-10 hover:bg-secondary transition-colors"></div>
<div className="w-8 bg-primary rounded-t-sm h-[85%] relative z-10"></div>
<div className="w-8 bg-secondary-fixed rounded-t-sm h-[60%] relative z-10 hover:bg-secondary transition-colors"></div>
</div>
<div className="flex justify-between px-md mt-sm text-xs text-on-surface-variant">
<span>W1</span><span>W2</span><span>W3</span><span>W4</span><span>W5</span><span>W6</span><span>W7</span>
</div>
</div>

<div className="bg-surface-container-lowest rounded-xl border border-[#7C3AED] bg-[#F5F3FF] p-lg shadow-[0_1px_3px_rgba(15,23,24,0.06)]">
<div className="flex items-center gap-sm mb-lg">
<span className="material-symbols-outlined text-[#7C3AED]">lightbulb</span>
<h3 className="font-headline-h3 text-headline-h3 text-[#5B21B6]">AI Recommendations</h3>
</div>
<ul className="space-y-md">
<li className="flex gap-md">
<div className="w-2 h-2 mt-2 rounded-full bg-[#7C3AED] shrink-0"></div>
<p className="font-body-md text-body-md text-[#4C1D95]">Consider adding more scenario-based questions to Topic 3 (Security). Students show a 15% drop in accuracy here.</p>
</li>
<li className="flex gap-md">
<div className="w-2 h-2 mt-2 rounded-full bg-[#7C3AED] shrink-0"></div>
<p className="font-body-md text-body-md text-[#4C1D95]">Module 2 video retention is high. Replicate this format for upcoming content updates.</p>
</li>
</ul>
</div>
</div>
</div>

</div>
      </div>
    </div>
  );
}