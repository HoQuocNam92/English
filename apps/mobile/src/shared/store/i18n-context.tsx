import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Locale = 'vi' | 'en';

const translations = {
  vi: {
    // Bottom tabs
    tabHome: 'Trang chủ',
    tabLearning: 'Học tập',
    tabPractice: 'Luyện tập',
    tabProgress: 'Tiến độ',
    tabProfile: 'Cá nhân',
    // Common
    loading: 'Đang tải...',
    error: 'Lỗi kết nối',
    retry: 'Thử lại',
    save: 'Lưu',
    cancel: 'Hủy',
    confirm: 'Xác nhận',
    signOut: 'Đăng xuất',
    signIn: 'Đăng nhập',
    back: 'Quay lại',
    seeAll: 'Xem tất cả',
    noData: 'Không có dữ liệu',
    darkMode: 'Chế độ tối',
    lightMode: 'Chế độ sáng',
    language: 'Ngôn ngữ',
    // Home
    greeting: 'Xin chào',
    continueLearn: 'Tiếp tục học',
    todayGoal: 'Mục tiêu hôm nay',
    streak: 'ngày liên tiếp',
    exp: 'EXP',
    flashSale: 'Flash Sale',
    voucher: 'Mã giảm giá',
    // Learning
    lessons: 'Bài học',
    completed: 'Đã hoàn thành',
    inProgress: 'Đang học',
    locked: 'Bị khóa',
    startLearn: 'Bắt đầu học',
    continueLesson: 'Tiếp tục',
    // Profile
    profile: 'Hồ sơ',
    editProfile: 'Chỉnh sửa',
    changePassword: 'Đổi mật khẩu',
    activePlan: 'Gói đang dùng',
    settings: 'Cài đặt',
    appearance: 'Giao diện',
    // Practice
    practice: 'Luyện tập',
    quiz: 'Bài kiểm tra',
    flashcards: 'Flashcards',
    scenario: 'Tình huống',
    // Progress
    progress: 'Tiến độ',
    overallProgress: 'Tổng tiến độ',
    weeklyGoal: 'Mục tiêu tuần',
    badges: 'Huy hiệu',
  },
  en: {
    // Bottom tabs
    tabHome: 'Home',
    tabLearning: 'Learning',
    tabPractice: 'Practice',
    tabProgress: 'Progress',
    tabProfile: 'Profile',
    // Common
    loading: 'Loading...',
    error: 'Connection error',
    retry: 'Retry',
    save: 'Save',
    cancel: 'Cancel',
    confirm: 'Confirm',
    signOut: 'Sign out',
    signIn: 'Sign in',
    back: 'Back',
    seeAll: 'See all',
    noData: 'No data available',
    darkMode: 'Dark mode',
    lightMode: 'Light mode',
    language: 'Language',
    // Home
    greeting: 'Hello',
    continueLearn: 'Continue learning',
    todayGoal: "Today's goal",
    streak: 'day streak',
    exp: 'EXP',
    flashSale: 'Flash Sale',
    voucher: 'Voucher',
    // Learning
    lessons: 'Lessons',
    completed: 'Completed',
    inProgress: 'In progress',
    locked: 'Locked',
    startLearn: 'Start learning',
    continueLesson: 'Continue',
    // Profile
    profile: 'Profile',
    editProfile: 'Edit profile',
    changePassword: 'Change password',
    activePlan: 'Active plan',
    settings: 'Settings',
    appearance: 'Appearance',
    // Practice
    practice: 'Practice',
    quiz: 'Quiz',
    flashcards: 'Flashcards',
    scenario: 'Scenarios',
    // Progress
    progress: 'Progress',
    overallProgress: 'Overall progress',
    weeklyGoal: 'Weekly goal',
    badges: 'Badges',
  },
};

export type TranslationKeys = keyof typeof translations.vi;

interface I18nContextValue {
  locale: Locale;
  t: typeof translations.vi;
  setLocale: (l: Locale) => void;
}

const I18nContext = createContext<I18nContextValue>({
  locale: 'vi',
  t: translations.vi,
  setLocale: () => {},
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('vi');

  useEffect(() => {
    AsyncStorage.getItem('techenglish.locale').then(saved => {
      if (saved === 'vi' || saved === 'en') setLocaleState(saved);
    });
  }, []);

  const setLocale = async (l: Locale) => {
    setLocaleState(l);
    await AsyncStorage.setItem('techenglish.locale', l);
  };

  return (
    <I18nContext.Provider value={{ locale, t: translations[locale], setLocale }}>
      {children}
    </I18nContext.Provider>
  );
}

export const useI18n = () => useContext(I18nContext);
