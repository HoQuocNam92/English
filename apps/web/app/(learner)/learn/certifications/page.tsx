'use client';

import { LearnerShell } from '@/shared/layout';

export default function CertificationsPage() {
  return (
    <LearnerShell>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-[30px] font-bold text-on-surface mb-2">Tiến độ chứng chỉ</h1>
          <p className="text-[14px] text-on-surface-variant">Theo dõi quá trình học tập và mức độ sẵn sàng cho các kỳ thi chứng chỉ quốc tế.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Card 1: AWS CCP */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 hover:shadow-sm transition-shadow flex flex-col relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-surface-container-high">
              <div className="h-full bg-primary" style={{ width: '62%', transition: 'width 1s ease-in-out' }}></div>
            </div>
            <div className="flex justify-between items-start mb-4 mt-2">
              <div>
                <h2 className="text-[20px] font-bold text-on-surface">AWS Certified Cloud Practitioner</h2>
                <span className="text-[12px] font-bold text-on-surface-variant mt-1 inline-block uppercase">Mức độ sẵn sàng</span>
              </div>
              <div className="text-[24px] font-bold text-primary">62%</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow mb-6">
              <div className="bg-surface-container p-4 rounded-lg border border-outline-variant">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-[16px] text-tertiary">check_circle</span>
                  <span className="text-[14px] font-semibold text-on-surface">Kỹ năng đã đạt</span>
                </div>
                <ul className="text-[12px] text-on-surface-variant space-y-2">
                  {['Cloud Basics', 'EC2', 'S3 Storage'].map(s => (
                    <li key={s} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-tertiary mt-1.5 shrink-0"></span>{s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-surface-container p-4 rounded-lg border border-outline-variant">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-[16px] text-secondary">pending</span>
                  <span className="text-[14px] font-semibold text-on-surface">Kỹ năng cần học</span>
                </div>
                <ul className="text-[12px] text-on-surface-variant space-y-2">
                  {['IAM', 'Monitoring', 'VPC'].map(s => (
                    <li key={s} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-outline-variant mt-1.5 shrink-0"></span>{s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="pt-4 border-t border-outline-variant flex justify-end mt-auto">
              <button className="px-4 py-2 bg-primary text-white text-[14px] font-semibold rounded-lg hover:bg-primary/90 transition-colors">
                Tiếp tục học
              </button>
            </div>
          </div>

          {/* Card 2: CompTIA */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 hover:shadow-sm transition-shadow flex flex-col relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-surface-container-high">
              <div className="h-full bg-secondary" style={{ width: '45%' }}></div>
            </div>
            <div className="flex justify-between items-start mb-4 mt-2">
              <div>
                <h2 className="text-[20px] font-bold text-on-surface">CompTIA Security+</h2>
                <span className="text-[12px] font-bold text-on-surface-variant mt-1 inline-block uppercase">Mức độ sẵn sàng</span>
              </div>
              <div className="text-[24px] font-bold text-secondary">45%</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow mb-6">
              <div className="bg-surface-container p-4 rounded-lg border border-outline-variant">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-[16px] text-tertiary">check_circle</span>
                  <span className="text-[14px] font-semibold text-on-surface">Kỹ năng đã đạt</span>
                </div>
                <ul className="text-[12px] text-on-surface-variant space-y-2">
                  {['Threats & Vulnerabilities', 'Identity Management'].map(s => (
                    <li key={s} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-tertiary mt-1.5 shrink-0"></span>{s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-surface-container p-4 rounded-lg border border-outline-variant">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-[16px] text-secondary">pending</span>
                  <span className="text-[14px] font-semibold text-on-surface">Kỹ năng cần học</span>
                </div>
                <ul className="text-[12px] text-on-surface-variant space-y-2">
                  {['Cryptography', 'Risk Management', 'Network Architecture'].map(s => (
                    <li key={s} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-outline-variant mt-1.5 shrink-0"></span>{s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="pt-4 border-t border-outline-variant flex justify-end mt-auto">
              <button className="px-4 py-2 bg-primary text-white text-[14px] font-semibold rounded-lg hover:bg-primary/90 transition-colors">
                Tiếp tục học
              </button>
            </div>
          </div>

          {/* Card 3: Cisco CCNA */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 hover:shadow-sm transition-shadow flex flex-col relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-surface-container-high">
              <div className="h-full bg-tertiary" style={{ width: '80%' }}></div>
            </div>
            <div className="flex justify-between items-start mb-4 mt-2">
              <div>
                <h2 className="text-[20px] font-bold text-on-surface">Cisco CCNA</h2>
                <span className="text-[12px] font-bold text-on-surface-variant mt-1 inline-block uppercase">Mức độ sẵn sàng</span>
              </div>
              <div className="text-[24px] font-bold text-tertiary">80%</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow mb-6">
              <div className="bg-surface-container p-4 rounded-lg border border-outline-variant">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-[16px] text-tertiary">check_circle</span>
                  <span className="text-[14px] font-semibold text-on-surface">Kỹ năng đã đạt</span>
                </div>
                <ul className="text-[12px] text-on-surface-variant space-y-2">
                  {['Network Fundamentals', 'IP Connectivity', 'Security Fundamentals'].map(s => (
                    <li key={s} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-tertiary mt-1.5 shrink-0"></span>{s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-surface-container p-4 rounded-lg border border-outline-variant">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-[16px] text-secondary">pending</span>
                  <span className="text-[14px] font-semibold text-on-surface">Kỹ năng cần học</span>
                </div>
                <ul className="text-[12px] text-on-surface-variant space-y-2">
                  {['Automation & Programmability'].map(s => (
                    <li key={s} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-outline-variant mt-1.5 shrink-0"></span>{s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="pt-4 border-t border-outline-variant flex justify-end mt-auto">
              <button className="px-4 py-2 bg-primary text-white text-[14px] font-semibold rounded-lg hover:bg-primary/90 transition-colors">
                Tiếp tục học
              </button>
            </div>
          </div>

          {/* Card 4: Google Cloud Associate */}
          <div className="bg-[#F5F3FF] border border-secondary rounded-xl p-6 hover:shadow-sm transition-shadow flex flex-col relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-surface-container-high">
              <div className="h-full bg-secondary" style={{ width: '20%' }}></div>
            </div>
            <div className="flex justify-between items-start mb-4 mt-2">
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <span className="material-symbols-outlined text-[16px] text-secondary">auto_awesome</span>
                  <span className="text-[12px] font-bold text-secondary uppercase">Đề xuất lộ trình AI</span>
                </div>
                <h2 className="text-[20px] font-bold text-on-surface">Google Cloud Associate</h2>
                <span className="text-[12px] font-bold text-on-surface-variant mt-1 inline-block uppercase">Mức độ sẵn sàng</span>
              </div>
              <div className="text-[24px] font-bold text-secondary">20%</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow mb-6">
              <div className="bg-surface-container-lowest p-4 rounded-lg border border-outline-variant">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-[16px] text-tertiary">check_circle</span>
                  <span className="text-[14px] font-semibold text-on-surface">Kỹ năng đã đạt</span>
                </div>
                <ul className="text-[12px] text-on-surface-variant space-y-2">
                  {['GCP Basics'].map(s => (
                    <li key={s} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-tertiary mt-1.5 shrink-0"></span>{s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-surface-container-lowest p-4 rounded-lg border border-outline-variant">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-[16px] text-secondary">pending</span>
                  <span className="text-[14px] font-semibold text-on-surface">Kỹ năng cần học</span>
                </div>
                <ul className="text-[12px] text-on-surface-variant space-y-2">
                  {['Compute Engine', 'Kubernetes Engine', 'Cloud Storage'].map(s => (
                    <li key={s} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-outline-variant mt-1.5 shrink-0"></span>{s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="pt-4 border-t border-outline-variant flex justify-end mt-auto">
              <button className="px-4 py-2 bg-surface-container-lowest text-secondary border border-secondary text-[14px] font-semibold rounded-lg hover:bg-secondary/10 transition-colors">
                Bắt đầu học
              </button>
            </div>
          </div>

        </div>
      </div>
    </LearnerShell>
  );
}
