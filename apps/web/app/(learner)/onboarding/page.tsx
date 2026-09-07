'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/shared/api/api-client';

const LEVELS = [
  { id: 'Beginner', title: 'Mới bắt đầu', subtitle: 'Beginner', icon: 'school' },
  { id: 'Intermediate', title: 'Trung cấp', subtitle: 'Intermediate', icon: 'trending_up' },
  { id: 'Advanced', title: 'Nâng cao', subtitle: 'Advanced', icon: 'workspace_premium' },
  { id: 'Professional', title: 'Chuyên nghiệp', subtitle: 'Professional', icon: 'diamond' },
];

const IT_FIELDS = [
  { id: 'Cloud Computing', title: 'Cloud Computing', icon: 'cloud' },
  { id: 'Cybersecurity', title: 'Cybersecurity', icon: 'security' },
  { id: 'Networking', title: 'Networking', icon: 'router' },
  { id: 'Data Engineering', title: 'Data Engineering', icon: 'database' },
  { id: 'Data Science', title: 'Data Science', icon: 'insights' },
  { id: 'Software Engineering', title: 'Software Engineering', icon: 'code' },
  { id: 'DevOps', title: 'DevOps', icon: 'all_inclusive' },
];

const CAREER_GOALS = [
  { id: 'Junior Developer', title: 'Junior Developer', subtitle: 'Xây dựng nền tảng từ vựng kỹ thuật cơ bản để đọc tài liệu và giao tiếp nhóm.', icon: 'code' },
  { id: 'Solution Architect', title: 'Solution Architect', subtitle: 'Tiếng Anh chuyên sâu để thiết kế hệ thống, viết tài liệu kỹ thuật và thuyết trình.', icon: 'architecture' },
  { id: 'Data Scientist', title: 'Data Scientist', subtitle: 'Tập trung vào thuật ngữ AI, Machine Learning và đọc hiểu các báo cáo phân tích.', icon: 'monitoring' },
  { id: 'Project Manager', title: 'Project Manager', subtitle: 'Giao tiếp khách hàng quốc tế, quản lý dự án Agile và đàm phán yêu cầu.', icon: 'manage_accounts' },
];

const TARGET_CERTS = [
  { id: 'AWS Certified Cloud Practitioner', title: 'AWS Certified Cloud Practitioner', subtitle: 'Nền tảng điện toán đám mây AWS.', icon: 'cloud' },
  { id: 'CompTIA Security+', title: 'CompTIA Security+', subtitle: 'Kiến thức bảo mật mạng cơ bản.', icon: 'security' },
  { id: 'Cisco CCNA', title: 'Cisco CCNA', subtitle: 'Quản trị mạng doanh nghiệp.', icon: 'router' },
  { id: 'Google Professional Cloud Architect', title: 'Google Professional Cloud Architect', subtitle: 'Thiết kế kiến trúc Google Cloud.', icon: 'memory' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [level, setLevel] = useState<string>('');
  const [itFields, setItFields] = useState<string[]>([]);
  const [careerGoal, setCareerGoal] = useState<string>('');
  const [targetCert, setTargetCert] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalSteps = 4;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const toggleItField = (id: string) => {
    setItFields(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await apiClient.post('/learner-profiles/me/complete-onboarding', {
        level,
        itFields,
        careerGoal,
        targetCert,
      });
      router.push('/learn');
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      setIsSubmitting(false);
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 1: return !!level;
      case 2: return itFields.length > 0;
      case 3: return !!careerGoal;
      case 4: return !!targetCert;
      default: return false;
    }
  };

  const renderProgressBar = () => (
    <div className="w-full max-w-[600px] flex gap-2 mb-12">
      {Array.from({ length: totalSteps }).map((_, i) => (
        <div 
          key={i} 
          className={`h-2 flex-1 rounded-full ${
            i + 1 <= step ? 'bg-primary' : 'bg-surface-container-highest'
          }`} 
        />
      ))}
    </div>
  );

  return (
    <main className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 md:p-8 w-full">
      <div className="w-full max-w-[800px] flex flex-col items-center relative z-10">
        {renderProgressBar()}

        {step === 1 && (
          <div className="w-full animate-in fade-in duration-300">
            <div className="text-center mb-10 w-full">
              <h1 className="text-[24px] md:text-[30px] font-bold text-on-surface mb-3">
                Trình độ tiếng Anh của bạn?
              </h1>
              <p className="text-[14px] text-on-surface-variant max-w-md mx-auto">
                Chọn mức độ phù hợp nhất hiện tại để chúng tôi thiết lập không gian học tập tối ưu cho bạn.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              {LEVELS.map(item => (
                <div 
                  key={item.id}
                  onClick={() => setLevel(item.id)}
                  className={`bg-white border rounded-xl p-6 cursor-pointer transition-all duration-200 flex items-start gap-4 group ${
                    level === item.id 
                      ? 'border-primary bg-primary-light shadow-[0_0_0_1px_#3525cd]' 
                      : 'border-border-subtle hover:border-primary-fixed-dim hover:shadow-sm'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 transition-colors duration-200 ${
                    level === item.id ? 'bg-primary text-white' : 'bg-surface text-on-surface-variant group-hover:text-primary'
                  }`}>
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>{item.icon}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[14px] font-semibold text-on-surface mb-1">{item.title}</h3>
                    <p className="text-[12px] text-on-surface-variant">{item.subtitle}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-1 shrink-0 ${
                    level === item.id ? 'border-primary' : 'border-outline-variant'
                  }`}>
                    <div className={`w-2.5 h-2.5 rounded-full transition-transform duration-200 ${
                      level === item.id ? 'bg-primary scale-100' : 'bg-transparent scale-0'
                    }`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="w-full animate-in fade-in duration-300">
            <div className="text-center mb-10 w-full">
              <h1 className="text-[24px] md:text-[30px] font-bold text-on-surface mb-3">
                Lĩnh vực CNTT bạn quan tâm?
              </h1>
              <p className="text-[14px] text-on-surface-variant max-w-md mx-auto">
                Chọn một hoặc nhiều lĩnh vực để chúng tôi tùy chỉnh lộ trình học thuật thuật ngữ chuyên ngành phù hợp nhất cho bạn.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full">
              {IT_FIELDS.map((item, index) => {
                const isSelected = itFields.includes(item.id);
                const isLastOdd = IT_FIELDS.length % 2 !== 0 && index === IT_FIELDS.length - 1;
                return (
                  <div 
                    key={item.id}
                    onClick={() => toggleItField(item.id)}
                    className={`bg-white border rounded-lg p-4 flex flex-col items-center justify-center gap-4 text-center h-full min-h-[140px] cursor-pointer transition-all duration-200 ${
                      isSelected 
                        ? 'border-primary bg-primary-light shadow-[0_0_0_2px_#3525cd]' 
                        : 'border-border-subtle hover:border-primary-fixed-dim hover:-translate-y-0.5 hover:shadow-md'
                    } ${isLastOdd ? 'sm:col-span-2 md:col-span-1' : ''}`}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-200 ${
                      isSelected ? 'bg-primary-fixed text-primary' : 'bg-surface-container text-on-surface-variant'
                    }`}>
                      <span className="material-symbols-outlined text-[24px]">{item.icon}</span>
                    </div>
                    <span className="text-[14px] font-semibold text-on-surface">{item.title}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="w-full animate-in fade-in duration-300">
            <div className="text-center mb-10 w-full">
              <h1 className="text-[24px] md:text-[30px] font-bold text-on-surface mb-3">
                Mục tiêu nghề nghiệp của bạn?
              </h1>
              <p className="text-[14px] text-on-surface-variant max-w-md mx-auto">
                Chọn mục tiêu phù hợp nhất để chúng tôi cá nhân hóa lộ trình học tiếng Anh chuyên ngành của bạn.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              {CAREER_GOALS.map(item => (
                <div 
                  key={item.id}
                  onClick={() => setCareerGoal(item.id)}
                  className={`bg-white rounded-lg p-4 border relative flex items-start gap-4 cursor-pointer transition-all duration-200 ${
                    careerGoal === item.id
                      ? 'border-primary bg-primary-light shadow-[0_0_0_1px_#3525cd]'
                      : 'border-border-subtle hover:border-primary hover:-translate-y-0.5 hover:shadow-md'
                  }`}
                >
                  <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${
                    careerGoal === item.id ? 'bg-primary text-white' : 'bg-surface-container-low text-on-surface-variant'
                  }`}>
                    <span className="material-symbols-outlined">{item.icon}</span>
                  </div>
                  <div className="flex-grow pr-8">
                    <h3 className="text-[14px] font-semibold text-on-surface mb-1">{item.title}</h3>
                    <p className="text-[12px] text-on-surface-variant">{item.subtitle}</p>
                  </div>
                  <div className="absolute top-4 right-4">
                    <span className={`material-symbols-outlined text-primary transition-all duration-200 ${
                      careerGoal === item.id ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
                    }`} style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="w-full max-w-[600px] mx-auto animate-in fade-in duration-300">
            <div className="text-center mb-10 w-full">
              <h1 className="text-[24px] md:text-[30px] font-bold text-on-surface mb-3">
                Chứng chỉ mục tiêu?
              </h1>
              <p className="text-[14px] text-on-surface-variant max-w-md mx-auto">
                Chọn chứng chỉ bạn muốn đạt được để chúng tôi cá nhân hóa lộ trình học.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              {TARGET_CERTS.map(item => (
                <div 
                  key={item.id}
                  onClick={() => setTargetCert(item.id)}
                  className={`bg-white border rounded-lg p-5 flex items-start gap-4 cursor-pointer transition-all duration-200 relative ${
                    targetCert === item.id
                      ? 'border-primary bg-primary-light shadow-[0_0_0_1px_#3525cd]'
                      : 'border-border-subtle hover:shadow-md'
                  }`}
                >
                  <div className="w-10 h-10 rounded bg-surface-container flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary">{item.icon}</span>
                  </div>
                  <div className="flex-1 pr-6">
                    <h3 className="text-[14px] font-semibold text-on-surface mb-1">{item.title}</h3>
                    <p className="text-[12px] text-on-surface-variant">{item.subtitle}</p>
                  </div>
                  <div className={`absolute right-5 transition-opacity duration-200 ${
                    targetCert === item.id ? 'opacity-100' : 'opacity-0'
                  }`}>
                    <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="w-full mt-12 flex items-center justify-between border-t border-border-subtle pt-8">
          <button 
            type="button"
            onClick={handleBack}
            disabled={step === 1 || isSubmitting}
            className={`px-6 py-2.5 rounded-lg text-[14px] font-semibold border flex items-center gap-2 transition-colors ${
              step === 1 
                ? 'bg-transparent border-surface-container-highest text-outline opacity-60 cursor-not-allowed'
                : 'bg-transparent border-border-subtle text-on-surface hover:bg-surface-container-low'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            Quay lại
          </button>
          
          <button 
            type="button"
            onClick={step === totalSteps ? handleSubmit : handleNext}
            disabled={!isStepValid() || isSubmitting}
            className={`px-8 py-2.5 rounded-lg text-[14px] font-semibold flex items-center gap-2 transition-all ${
              !isStepValid() || isSubmitting
                ? 'bg-primary text-white opacity-50 cursor-not-allowed'
                : 'bg-primary text-white hover:bg-primary-container shadow-sm'
            }`}
          >
            {isSubmitting ? 'Đang xử lý...' : step === totalSteps ? 'Hoàn tất' : 'Tiếp tục'}
            {!isSubmitting && (
              <span className="material-symbols-outlined text-[20px]">
                {step === totalSteps ? 'check' : 'arrow_forward'}
              </span>
            )}
          </button>
        </div>
      </div>
    </main>
  );
}
