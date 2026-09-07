'use client';

import * as React from 'react';
import { PageHeader } from '@/shared/ui';
import { apiClient } from '@/shared/api/api-client';

export default function AdminReportDetailPage() {
  return (
    <div className="p-6">
      <PageHeader title="Chi tiết Báo cáo" description="Giao diện cập nhật từ design" />
      <div className="mt-6">
        <div className="space-y-6">


<header className="h-[64px] bg-surface-container-lowest flex justify-between items-center w-full px-margin sticky top-0 z-30 shadow-[0_1px_2px_rgba(0,0,0,0.05)] md:border-b-0 md:shadow-none border-b border-outline-variant">
<div className="flex items-center md:hidden">
<span className="font-headline-h2 text-headline-h2 font-black text-primary">IT English Pro</span>
</div>
<div className="flex-1 flex items-center justify-start md:pl-0">

<nav className="hidden md:flex items-center gap-sm font-body-md text-body-md text-on-surface-variant">
<a className="hover:text-primary transition-colors" href="#">Báo cáo</a>
<span className="material-symbols-outlined text-[16px]">chevron_right</span>
<span className="text-primary font-interface-sb">Chi tiết lĩnh vực Cloud Computing</span>
</nav>
</div>
<div className="flex items-center gap-md">
<button className="p-2 text-on-surface-variant hover:text-primary transition-colors rounded-full hover:bg-surface-container">
<span className="material-symbols-outlined" data-icon="notifications">notifications</span>
</button>
<button className="p-2 text-on-surface-variant hover:text-primary transition-colors rounded-full hover:bg-surface-container hidden md:block">
<span className="material-symbols-outlined" data-icon="help_outline">help_outline</span>
</button>
<img alt="Administrator Profile" className="w-8 h-8 rounded-full object-cover border border-outline-variant md:hidden" data-alt="A professional headshot of an IT administrator, modern lighting, neutral background, crisp focus." src="https://lh3.googleusercontent.com/aida-public/AB6AXuB09Vnb0mBo8ytntYZiYiNm5kHZ__5b8kz2NN7uoSK8uxJ34-8hCsvwgI4evB-aUI5xIdIWFeALBSJzn0ekEXVAV4vDN3v0B-4svuAygkPmpIGR-iMPRA168NrI1XLgMN_7jtCZLvhiJkTxUrB6C8r_5Jl0N06KSrTzHaAMAesQ2mjAuVmHkV4dF1PVhiWS480iaNuWBd-TqJpHLR-xwtnJaWXo_A9tfNBzh1Jow71TI2LtoFDYnWM"/>
</div>
</header>

<div className="p-margin flex-1 flex flex-col gap-lg max-w-[1600px] mx-auto w-full">

<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-md">
<div>
<h2 className="font-headline-h1 text-headline-h1 text-on-surface">Cloud Computing Overview</h2>
<p className="font-body-md text-body-md text-on-surface-variant mt-1">Detailed performance and engagement metrics for the Cloud Computing curriculum.</p>
</div>
<div className="flex gap-md w-full md:w-auto">
<button className="flex-1 md:flex-none flex items-center justify-center gap-sm px-4 py-2 border border-outline-variant rounded-lg font-interface-sb text-interface-sb text-on-surface bg-surface-container-lowest hover:bg-surface-container hover:shadow-[0_1px_3px_rgba(15,23,24,0.06)] transition-all">
<span className="material-symbols-outlined text-[20px]">calendar_today</span>
                        This Month
                    </button>
<button className="flex-1 md:flex-none flex items-center justify-center gap-sm px-4 py-2 bg-primary text-on-primary rounded-lg font-interface-sb text-interface-sb hover:opacity-90 transition-opacity shadow-sm">
<span className="material-symbols-outlined text-[20px]">download</span>
                        Export
                    </button>
</div>
</div>

<div className="grid grid-cols-1 md:grid-cols-3 gap-lg">

<div className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant hover:shadow-[0_1px_3px_rgba(15,23,24,0.06)] transition-all flex flex-col gap-md">
<div className="flex justify-between items-start">
<span className="font-body-md text-body-md text-on-surface-variant">Total Cloud Learners</span>
<div className="p-2 bg-primary-fixed rounded-lg text-primary">
<span className="material-symbols-outlined text-[20px]">group</span>
</div>
</div>
<div>
<div className="font-headline-h1 text-headline-h1 text-on-surface">1,248</div>
<div className="flex items-center gap-xs mt-1 text-sm text-[#059669]">
<span className="material-symbols-outlined text-[16px]">arrow_upward</span>
<span className="font-interface-sb">12%</span>
<span className="text-on-surface-variant">vs last month</span>
</div>
</div>
</div>

<div className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant hover:shadow-[0_1px_3px_rgba(15,23,24,0.06)] transition-all flex flex-col gap-md">
<div className="flex justify-between items-start">
<span className="font-body-md text-body-md text-on-surface-variant">Avg. Assessment Score</span>
<div className="p-2 bg-tertiary-fixed rounded-lg text-tertiary">
<span className="material-symbols-outlined text-[20px]">score</span>
</div>
</div>
<div>
<div className="font-headline-h1 text-headline-h1 text-on-surface">86.4%</div>
<div className="flex items-center gap-xs mt-1 text-sm text-[#059669]">
<span className="material-symbols-outlined text-[16px]">arrow_upward</span>
<span className="font-interface-sb">2.1%</span>
<span className="text-on-surface-variant">vs last month</span>
</div>
</div>
</div>

<div className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant hover:shadow-[0_1px_3px_rgba(15,23,24,0.06)] transition-all flex flex-col gap-md">
<div className="flex justify-between items-start">
<span className="font-body-md text-body-md text-on-surface-variant">Top Certificate Goal</span>
<div className="p-2 bg-secondary-fixed rounded-lg text-secondary">
<span className="material-symbols-outlined text-[20px]">workspace_premium</span>
</div>
</div>
<div>
<div className="font-headline-h2 text-headline-h2 text-on-surface truncate">AWS Solutions Architect</div>
<div className="flex items-center gap-xs mt-1 text-sm">
<span className="font-interface-sb text-on-surface-variant">45% of learners targeting</span>
</div>
</div>
</div>
</div>

<div className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant hover:shadow-[0_1px_3px_rgba(15,23,24,0.06)] transition-all">
<div className="flex justify-between items-center mb-lg">
<h3 className="font-headline-h3 text-headline-h3 text-on-surface">Tỷ lệ đạt mục tiêu theo tuần</h3>
<div className="flex gap-2">
<span className="flex items-center gap-xs text-body-sm font-body-sm text-on-surface-variant"><span className="w-2 h-2 rounded-full bg-primary block"></span> Cloud</span>
<span className="flex items-center gap-xs text-body-sm font-body-sm text-on-surface-variant"><span className="w-2 h-2 rounded-full bg-tertiary block"></span> Overall</span>
</div>
</div>

<div className="h-[300px] w-full relative flex items-end pt-10 border-b border-l border-outline-variant/50 pb-6 pl-10">

<div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-body-sm text-on-surface-variant pr-2 text-right">
<span>100%</span>
<span>75%</span>
<span>50%</span>
<span>25%</span>
<span>0%</span>
</div>

<div className="absolute left-10 right-0 bottom-0 flex justify-between text-body-sm text-on-surface-variant pt-2">
<span>W1</span><span>W2</span><span>W3</span><span>W4</span><span>W5</span><span>W6</span><span>W7</span><span>W8</span>
</div>

<div className="absolute inset-0 left-10 bottom-6 flex flex-col justify-between pointer-events-none">
<div className="w-full h-px bg-outline-variant/20 border-dashed border-b"></div>
<div className="w-full h-px bg-outline-variant/20 border-dashed border-b"></div>
<div className="w-full h-px bg-outline-variant/20 border-dashed border-b"></div>
<div className="w-full h-px bg-outline-variant/20 border-dashed border-b"></div>
<div className="w-full h-px"></div>
</div>

<svg className="absolute inset-0 left-10 bottom-6 h-full w-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 1000 100">
<path d="M0,80 C100,75 200,60 300,50 C400,40 500,45 600,30 C700,15 800,20 1000,10" fill="none" stroke="#3525cd" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3"></path>

<circle className="hover:r-6 cursor-pointer" cx="0" cy="80" fill="#3525cd" r="4"></circle>
<circle cx="142" cy="70" fill="#3525cd" r="4"></circle>
<circle cx="285" cy="55" fill="#3525cd" r="4"></circle>
<circle cx="428" cy="45" fill="#3525cd" r="4"></circle>
<circle cx="571" cy="35" fill="#3525cd" r="4"></circle>
<circle cx="714" cy="20" fill="#3525cd" r="4"></circle>
<circle cx="857" cy="18" fill="#3525cd" r="4"></circle>
<circle cx="1000" cy="10" fill="#3525cd" r="4"></circle>
</svg>

<svg className="absolute inset-0 left-10 bottom-6 h-full w-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 1000 100">
<path d="M0,90 C150,85 250,75 350,70 C450,65 550,60 700,55 C850,50 950,45 1000,40" fill="none" stroke="#5c00ca" strokeDasharray="4,4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
</svg>
</div>
</div>

<div className="bg-surface-container-lowest rounded-xl border border-outline-variant flex flex-col overflow-hidden">
<div className="p-lg border-b border-outline-variant flex flex-col sm:flex-row justify-between items-start sm:items-center gap-md">
<h3 className="font-headline-h3 text-headline-h3 text-on-surface">Chi tiết người học Cloud Computing</h3>

<div className="flex items-center gap-sm w-full sm:w-auto">
<div className="relative flex-1 sm:w-64">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
<input className="w-full pl-10 pr-4 py-2 border border-outline-variant rounded-lg font-body-md text-body-md focus:border-primary focus:ring-2 focus:ring-primary-fixed focus:outline-none transition-shadow bg-surface-bright" placeholder="Search learners..." type="text"/>
</div>
<button className="p-2 border border-outline-variant rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors flex items-center justify-center">
<span className="material-symbols-outlined">filter_list</span>
</button>
</div>
</div>
<div className="overflow-x-auto w-full">
<table className="w-full text-left border-collapse min-w-[800px]">
<thead>
<tr className="bg-surface font-interface-sb text-body-sm text-on-surface-variant uppercase tracking-wider border-b border-outline-variant">
<th className="p-4 pl-lg">Name</th>
<th className="p-4">Current Goal</th>
<th className="p-4">Progress</th>
<th className="p-4">Last Active</th>
<th className="p-4 pr-lg text-right">Actions</th>
</tr>
</thead>
<tbody className="font-body-md text-on-surface divide-y divide-outline-variant">
<tr className="hover:bg-surface-bright transition-colors group">
<td className="p-4 pl-lg flex items-center gap-3">
<img alt="User Avatar" className="w-8 h-8 rounded-full object-cover bg-surface-container" data-alt="A small circular avatar of a young professional woman in a modern tech office setting. Bright lighting, clean background, sharp focus." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDBO1af4znxQ5rZnKth-XhTyRvOYcGV0jRWdiII6Ij3NM7pjIpbxCtp7gE9orB_taZf9KT3QZlq3fBTaCK6MZQangGsoegY9FXQvhf7tyT9rxa9dgmhB2Kk8H2yoSibH4nwP0l2VM2NCMTMYZdRoCeG3h63ZtU7sna8QvFyGal3faY4vQNPIdPFUSzIS4s8_bcF0xDva_oGi4O6OmRRq4TpL7D2i3uXG1YwA6aGBpdUVz_kFyn8dNQ"/>
<div>
<div className="font-interface-sb">Nguyen Van A</div>
<div className="text-body-sm text-on-surface-variant">nguyen.a@example.com</div>
</div>
</td>
<td className="p-4">
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-fixed text-on-primary-fixed">
                                        AWS Certified
                                    </span>
</td>
<td className="p-4 w-48">
<div className="flex items-center gap-2">
<div className="flex-1 h-2 bg-surface-container rounded-full overflow-hidden">
<div className="h-full bg-primary rounded-full" ></div>
</div>
<span className="text-body-sm font-interface-sb">78%</span>
</div>
</td>
<td className="p-4 text-on-surface-variant">2 hours ago</td>
<td className="p-4 pr-lg text-right">
<button className="text-on-surface-variant hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity">
<span className="material-symbols-outlined text-[20px]">more_vert</span>
</button>
</td>
</tr>
<tr className="hover:bg-surface-bright transition-colors group">
<td className="p-4 pl-lg flex items-center gap-3">
<img alt="User Avatar" className="w-8 h-8 rounded-full object-cover bg-surface-container" data-alt="A small circular avatar of a middle-aged male developer in a casual tech environment. Warm lighting, slightly blurred background, high quality." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAC-Lkcua2nS29341nj_L6MHcB4E69KGEaH6P4wxSNVfbsqmM82nfv1cL1HeBBebMQyITm67zyhXqqQgi8rtv5hwynDxX-4dJQzMZhNlzyjUgVGx79w9O7uuODgj9DdYB48Hp3AGzlKOo_i8QfgxwnTXvddYO_mvqhifiqypvFW951HMxyxvU_iWJNjpbPMDbGIjoIPx0qRoYOkl6-Cw8HvSJQSIS4OeVq7msA54NWko_-emVNuKw8"/>
<div>
<div className="font-interface-sb">Tran Thi B</div>
<div className="text-body-sm text-on-surface-variant">tran.b@example.com</div>
</div>
</td>
<td className="p-4">
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-tertiary-fixed text-on-tertiary-fixed">
                                        Azure Fundamentals
                                    </span>
</td>
<td className="p-4 w-48">
<div className="flex items-center gap-2">
<div className="flex-1 h-2 bg-surface-container rounded-full overflow-hidden">
<div className="h-full bg-tertiary rounded-full" ></div>
</div>
<span className="text-body-sm font-interface-sb">45%</span>
</div>
</td>
<td className="p-4 text-on-surface-variant">1 day ago</td>
<td className="p-4 pr-lg text-right">
<button className="text-on-surface-variant hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity">
<span className="material-symbols-outlined text-[20px]">more_vert</span>
</button>
</td>
</tr>
<tr className="hover:bg-surface-bright transition-colors group">
<td className="p-4 pl-lg flex items-center gap-3">
<img alt="User Avatar" className="w-8 h-8 rounded-full object-cover bg-surface-container" data-alt="A small circular avatar of a male student with glasses in a library setting. Soft natural lighting, focused on face, professional look." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDX54ETVpYS9KehUK8f6U_pU5I17CNtj6KDZ8NQEf3o2N1bth7E5w9qvG3UXmEinkUeL8ifNw7vmx6sys3KZxpN7Wqzn77eVEY5vc8mV4XOqUTjI2dl4MtHPCsYMeXZfvQo4NbTkEEF-5ZMINXRveke5W8Ri6DwC-6JU8k9Wk3BxQUQcr6XlGgVaZD9rva4UzKRwBzGBxBdtLr3DlYbz5wUcWb1ZND784JOCj_wiDWt9-Bjn7jPPNA"/>
<div>
<div className="font-interface-sb">Le Van C</div>
<div className="text-body-sm text-on-surface-variant">le.c@example.com</div>
</div>
</td>
<td className="p-4">
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#ecfdf5] text-[#065f46]">
                                        Google Cloud Pro
                                    </span>
</td>
<td className="p-4 w-48">
<div className="flex items-center gap-2">
<div className="flex-1 h-2 bg-surface-container rounded-full overflow-hidden">
<div className="h-full bg-[#059669] rounded-full" ></div>
</div>
<span className="text-body-sm font-interface-sb text-[#059669]">100%</span>
</div>
</td>
<td className="p-4 text-on-surface-variant">3 days ago</td>
<td className="p-4 pr-lg text-right">
<button className="text-on-surface-variant hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity">
<span className="material-symbols-outlined text-[20px]">more_vert</span>
</button>
</td>
</tr>
<tr className="hover:bg-surface-bright transition-colors group">
<td className="p-4 pl-lg flex items-center gap-3">
<img alt="User Avatar" className="w-8 h-8 rounded-full object-cover bg-surface-container" data-alt="A small circular avatar of a female software engineer smiling in a well-lit co-working space. High resolution, clear facial features, modern vibe." src="https://lh3.googleusercontent.com/aida-public/AB6AXuC7Ghkq-MvGe6gWMGo6BKTIH3Br0jXHAgVnyHAGgAQQNocyic2GH2o-7dMH9qKO70zxX5b-6sk0byeOSA2QVury3CG7vws-1VseLKS3VzfTAsJfHxl7tdqTO3tzbbnmih2f4CuaqAE2ygckv6Hrj7DSv8Indb9-VKb4VO3lHu9BktayWGAiNHVjsSoggQVH2jkVWAqcU4DKOHtpeYjCez32GX-GQU4F7VOO8K6T2bMLKeZ40N5WiW8"/>
<div>
<div className="font-interface-sb">Pham Thi D</div>
<div className="text-body-sm text-on-surface-variant">pham.d@example.com</div>
</div>
</td>
<td className="p-4">
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-fixed text-on-primary-fixed">
                                        AWS Certified
                                    </span>
</td>
<td className="p-4 w-48">
<div className="flex items-center gap-2">
<div className="flex-1 h-2 bg-surface-container rounded-full overflow-hidden">
<div className="h-full bg-primary rounded-full" ></div>
</div>
<span className="text-body-sm font-interface-sb">12%</span>
</div>
</td>
<td className="p-4 text-on-surface-variant">Just now</td>
<td className="p-4 pr-lg text-right">
<button className="text-on-surface-variant hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity">
<span className="material-symbols-outlined text-[20px]">more_vert</span>
</button>
</td>
</tr>
</tbody>
</table>
</div>

<div className="p-4 border-t border-outline-variant flex items-center justify-between text-body-sm text-on-surface-variant">
<span>Showing 1 to 4 of 1,248 learners</span>
<div className="flex gap-1">
<button className="px-3 py-1 border border-outline-variant rounded hover:bg-surface-container disabled:opacity-50" disabled>Prev</button>
<button className="px-3 py-1 bg-primary text-on-primary rounded">1</button>
<button className="px-3 py-1 border border-outline-variant rounded hover:bg-surface-container">2</button>
<button className="px-3 py-1 border border-outline-variant rounded hover:bg-surface-container">3</button>
<button className="px-3 py-1 border border-outline-variant rounded hover:bg-surface-container">Next</button>
</div>
</div>
</div>
<div className="pb-xl"></div>
</div>

</div>
      </div>
    </div>
  );
}