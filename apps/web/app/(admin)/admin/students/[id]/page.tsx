'use client';

import * as React from 'react';
import { PageHeader } from '@/shared/ui';
import { apiClient } from '@/shared/api/api-client';

export default function AdminStudentDetailPage() {
  return (
    <div className="p-6">
      <PageHeader title="Chi tiết Học viên" description="Giao diện cập nhật từ design" />
      <div className="mt-6">
        <div className="space-y-6">

<div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter max-w-[1440px] mx-auto">

<div className="lg:col-span-4 space-y-gutter">

<div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-lg hover:shadow-[0_1px_3px_rgba(15,23,24,0.06)] transition-shadow">
<div className="flex flex-col items-center text-center">
<div className="relative mb-4">
<img alt="Lê Thị B Avatar" className="w-24 h-24 rounded-full border-4 border-surface shadow-sm object-cover" data-alt="A high-quality, professional portrait of an adult female learner, 'Lê Thị B', in an academic or tech setting. She appears confident and focused, lit with soft, flattering studio lighting. The background is a subtle, clean gradient, ensuring the focus remains on her." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAQ-jkt2lbEj4LN44dcl83PuuHnN9W-mS7qXd0oFD2va7gkSGZNJDjoy_hiw1tbzUICw5hFiKgajIBSyRd6OVR2wA25Ny0UXRowiiINI6uunuJ7OvWWLySPddzDoD2PacFc_5qSGsJ0cPVT6omxFg-QxtHVTqbImeXG0ifmOikneIS5LoLW3z3CBl1eEr5Iy-z7hacfoMh9haRNxVmGs7TYvTU3W6J8W3V17iGEHWitgjRKADJIWjM"/>
<span className="absolute bottom-0 right-0 bg-primary-container text-primary text-xs font-bold px-2 py-1 rounded-full border-2 border-surface flex items-center gap-1">
<span className="material-symbols-outlined text-[12px] icon-fill">verified</span>
                                    PRO
                                </span>
</div>
<h2 className="font-headline-h3 text-headline-h3 text-on-surface mb-1">Lê Thị B</h2>
<p className="font-body-md text-body-md text-on-surface-variant mb-4">lethib.dev@example.com</p>
<div className="flex flex-wrap justify-center gap-2 mb-6">
<span className="bg-surface-container text-on-surface-variant font-label-caps text-label-caps px-3 py-1 rounded-full flex items-center gap-1">
<span className="material-symbols-outlined text-[14px]">school</span>
                                    Advanced
                                </span>
<span className="bg-tertiary-fixed text-on-tertiary-fixed font-label-caps text-label-caps px-3 py-1 rounded-full flex items-center gap-1">
<span className="material-symbols-outlined text-[14px]">cloud</span>
                                    DevOps
                                </span>
</div>
<div className="w-full flex gap-2">
<button className="flex-1 bg-primary text-on-primary font-interface-sb text-interface-sb py-2 px-4 rounded-lg hover:bg-primary-fixed-variant transition-colors flex items-center justify-center gap-2">
<span className="material-symbols-outlined text-[18px]">mail</span>
                                     Message
                                 </button>
<button className="px-4 py-2 border border-outline-variant rounded-lg text-on-surface hover:bg-surface-container transition-colors">
<span className="material-symbols-outlined text-[18px]">more_horiz</span>
</button>
</div>
</div>
<div className="mt-6 pt-6 border-t border-outline-variant space-y-4">
<div className="flex justify-between items-center">
<span className="text-on-surface-variant font-body-sm text-body-sm">Thành viên từ</span>
<span className="text-on-surface font-interface-sb text-interface-sb">Oct 12, 2023</span>
</div>
<div className="flex justify-between items-center">
<span className="text-on-surface-variant font-body-sm text-body-sm">Lần đăng nhập cuối</span>
<span className="text-on-surface font-interface-sb text-interface-sb">2 giờ trước</span>
</div>
<div className="flex justify-between items-center">
<span className="text-on-surface-variant font-body-sm text-body-sm">Trạng thái</span>
<span className="text-green-700 bg-green-100 font-interface-sb text-xs px-2 py-0.5 rounded">Active</span>
</div>
</div>
</div>

<div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-lg hover:shadow-[0_1px_3px_rgba(15,23,24,0.06)] transition-shadow">
<div className="flex items-center gap-2 mb-4">
<span className="material-symbols-outlined text-primary">target</span>
<h3 className="font-interface-sb text-interface-sb text-on-surface">Mục tiêu chứng chỉ</h3>
</div>
<div className="bg-surface-container-low p-4 rounded-lg border border-outline-variant relative overflow-hidden">

<div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9IiMwMDAiLz48L3N2Zz4=')]"></div>
<div className="relative z-10">
<h4 className="font-headline-h3 text-[16px] text-on-surface mb-1">AWS Certified DevOps Engineer</h4>
<p className="text-on-surface-variant text-body-sm font-body-sm mb-4">Professional Level</p>
<div className="flex justify-between items-end mb-2">
<span className="font-headline-h2 text-primary">72%</span>
<span className="text-on-surface-variant text-xs font-interface-sb">Est. completion: 3 weeks</span>
</div>
<div className="w-full bg-surface-variant rounded-full h-2">
<div className="bg-primary h-2 rounded-full" ></div>
</div>
</div>
</div>
</div>
</div>

<div className="lg:col-span-8 space-y-gutter">

<div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">

<div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-lg hover:shadow-[0_1px_3px_rgba(15,23,24,0.06)] transition-shadow col-span-1 md:col-span-1 flex flex-col items-center justify-center">
<h3 className="font-interface-sb text-interface-sb text-on-surface w-full text-left mb-4">Tổng quan tiến độ</h3>
<div className="relative w-32 h-32">
<svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">

<path className="text-surface-variant" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3"></path>

<path className="text-primary donut-segment" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="72, 100" strokeLinecap="round" strokeWidth="3"></path>
</svg>
<div className="absolute inset-0 flex items-center justify-center flex-col">
<span className="font-headline-h2 text-headline-h2 text-on-surface">72%</span>
<span className="text-[10px] text-on-surface-variant font-label-caps">HOÀN THÀNH</span>
</div>
</div>
</div>

<div className="col-span-1 md:col-span-2 grid grid-cols-2 gap-gutter">
<div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-lg hover:shadow-[0_1px_3px_rgba(15,23,24,0.06)] transition-shadow flex flex-col justify-between">
<div className="flex justify-between items-start">
<div className="w-10 h-10 rounded-lg bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed">
<span className="material-symbols-outlined">library_books</span>
</div>
<span className="bg-surface-container px-2 py-1 rounded text-xs font-interface-sb text-on-surface flex items-center gap-1">
<span className="material-symbols-outlined text-[14px] text-green-600">arrow_upward</span>
                                        12%
                                    </span>
</div>
<div>
<p className="text-on-surface-variant font-body-sm mt-4">Bài học đã hoàn thành</p>
<div className="flex items-baseline gap-2">
<h3 className="font-headline-h1 text-headline-h1 text-on-surface">84</h3>
<span className="text-on-surface-variant font-interface-sb">/ 120</span>
</div>
</div>
</div>
<div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-lg hover:shadow-[0_1px_3px_rgba(15,23,24,0.06)] transition-shadow flex flex-col justify-between">
<div className="flex justify-between items-start">
<div className="w-10 h-10 rounded-lg bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed">
<span className="material-symbols-outlined">grade</span>
</div>
<span className="bg-surface-container px-2 py-1 rounded text-xs font-interface-sb text-on-surface flex items-center gap-1">
<span className="material-symbols-outlined text-[14px] text-green-600">arrow_upward</span>
                                        0.4
                                    </span>
</div>
<div>
<p className="text-on-surface-variant font-body-sm mt-4">Điểm trung bình</p>
<div className="flex items-baseline gap-2">
<h3 className="font-headline-h1 text-headline-h1 text-on-surface">8.8</h3>
<span className="text-on-surface-variant font-interface-sb">/ 10</span>
</div>
</div>
</div>
</div>
</div>

<div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-lg hover:shadow-[0_1px_3px_rgba(15,23,24,0.06)] transition-shadow">
<div className="flex items-center justify-between mb-6">
<h3 className="font-headline-h3 text-headline-h3 text-on-surface">Tiến độ theo chủ đề</h3>
<button className="text-primary font-interface-sb text-sm hover:underline">Xem tất cả</button>
</div>
<div className="space-y-5">

<div>
<div className="flex justify-between items-center mb-1">
<span className="font-interface-sb text-interface-sb text-on-surface">Containerization (Docker/K8s)</span>
<span className="font-interface-sb text-sm text-on-surface-variant">92%</span>
</div>
<div className="w-full bg-surface-variant rounded-full h-2">
<div className="bg-tertiary h-2 rounded-full" ></div>
</div>
</div>

<div>
<div className="flex justify-between items-center mb-1">
<span className="font-interface-sb text-interface-sb text-on-surface">CI/CD Pipelines</span>
<span className="font-interface-sb text-sm text-on-surface-variant">85%</span>
</div>
<div className="w-full bg-surface-variant rounded-full h-2">
<div className="bg-secondary h-2 rounded-full" ></div>
</div>
</div>

<div>
<div className="flex justify-between items-center mb-1">
<span className="font-interface-sb text-interface-sb text-on-surface">Infrastructure as Code (Terraform)</span>
<span className="font-interface-sb text-sm text-on-surface-variant">60%</span>
</div>
<div className="w-full bg-surface-variant rounded-full h-2">
<div className="bg-primary h-2 rounded-full" ></div>
</div>
</div>
</div>
</div>

<div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-0 hover:shadow-[0_1px_3px_rgba(15,23,24,0.06)] transition-shadow overflow-hidden">
<div className="p-lg border-b border-outline-variant flex justify-between items-center">
<h3 className="font-headline-h3 text-headline-h3 text-on-surface">Kết quả bài kiểm tra gần đây</h3>
<button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors">
<span className="material-symbols-outlined text-on-surface-variant">filter_list</span>
</button>
</div>
<ul className="divide-y divide-outline-variant">
<li className="p-lg flex items-center justify-between hover:bg-surface-container-low transition-colors group cursor-pointer">
<div className="flex items-center gap-4">
<div className="w-12 h-12 rounded-lg bg-surface-variant flex items-center justify-center text-on-surface-variant group-hover:bg-primary-fixed group-hover:text-primary transition-colors">
<span className="material-symbols-outlined">quiz</span>
</div>
<div>
<h4 className="font-interface-sb text-interface-sb text-on-surface mb-0.5">Advanced Kubernetes Networking</h4>
<p className="font-body-sm text-body-sm text-on-surface-variant">Oct 24, 2023 • 45 mins</p>
</div>
</div>
<div className="text-right flex items-center gap-4">
<div className="flex flex-col items-end">
<span className="font-headline-h3 text-on-surface text-green-600">9.5 <span className="text-sm text-on-surface-variant font-normal">/ 10</span></span>
<span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded font-label-caps uppercase mt-1">Passed</span>
</div>
<span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors">chevron_right</span>
</div>
</li>
<li className="p-lg flex items-center justify-between hover:bg-surface-container-low transition-colors group cursor-pointer">
<div className="flex items-center gap-4">
<div className="w-12 h-12 rounded-lg bg-surface-variant flex items-center justify-center text-on-surface-variant group-hover:bg-primary-fixed group-hover:text-primary transition-colors">
<span className="material-symbols-outlined">quiz</span>
</div>
<div>
<h4 className="font-interface-sb text-interface-sb text-on-surface mb-0.5">Jenkins Pipeline Setup</h4>
<p className="font-body-sm text-body-sm text-on-surface-variant">Oct 18, 2023 • 30 mins</p>
</div>
</div>
<div className="text-right flex items-center gap-4">
<div className="flex flex-col items-end">
<span className="font-headline-h3 text-on-surface">8.2 <span className="text-sm text-on-surface-variant font-normal">/ 10</span></span>
<span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded font-label-caps uppercase mt-1">Passed</span>
</div>
<span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors">chevron_right</span>
</div>
</li>
<li className="p-lg flex items-center justify-between hover:bg-surface-container-low transition-colors group cursor-pointer">
<div className="flex items-center gap-4">
<div className="w-12 h-12 rounded-lg bg-surface-variant flex items-center justify-center text-on-surface-variant group-hover:bg-error-container group-hover:text-error transition-colors">
<span className="material-symbols-outlined">quiz</span>
</div>
<div>
<h4 className="font-interface-sb text-interface-sb text-on-surface mb-0.5">Terraform State Management</h4>
<p className="font-body-sm text-body-sm text-on-surface-variant">Oct 10, 2023 • 60 mins</p>
</div>
</div>
<div className="text-right flex items-center gap-4">
<div className="flex flex-col items-end">
<span className="font-headline-h3 text-error">5.5 <span className="text-sm text-on-surface-variant font-normal">/ 10</span></span>
<span className="text-[10px] bg-error-container text-error px-2 py-0.5 rounded font-label-caps uppercase mt-1">Needs Review</span>
</div>
<span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors">chevron_right</span>
</div>
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