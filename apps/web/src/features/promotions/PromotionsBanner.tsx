'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/shared/api/api-client';

export function PromotionsBanner() {
  const [flashSales, setFlashSales] = useState<any[]>([]);
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    async function fetchPromotions() {
      try {
        const [flashRes, voucherRes] = await Promise.allSettled([
          apiClient.get('/flash-sales/active'),
          apiClient.get('/vouchers/active'),
        ]);

        if (flashRes.status === 'fulfilled') {
          const val: any = flashRes.value;
          const data = val?.data ?? val ?? [];
          if (Array.isArray(data)) setFlashSales(data);
        }

        if (voucherRes.status === 'fulfilled') {
          const val: any = voucherRes.value;
          const data = val?.data ?? val ?? [];
          if (Array.isArray(data)) setVouchers(data);
        }
      } catch {
        // Handled silently
      }
    }
    fetchPromotions();
  }, []);

  // Calculate live countdown timer for active flash sale
  const activeSale = flashSales.length > 0 ? flashSales[0] : null;

  useEffect(() => {
    if (!activeSale?.endTime) return;

    const updateTimer = () => {
      const diff = new Date(activeSale.endTime).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft(null);
        return;
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [activeSale]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  // If no active promotion data from API, do not render empty section
  if (!activeSale && vouchers.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6 my-6">
      {/* ─── Sleek Clean Flash Sale Banner (Adheres to Design Tokens) ────── */}
      {activeSale && (
        <div className="rounded-2xl bg-surface-container-lowest border border-outline-variant/40 p-6 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-outline-variant/30">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-indigo-50 text-primary border border-indigo-200 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px] fill-1">bolt</span>
                <span>FLASH SALE HOẠT ĐỘNG</span>
              </span>
              <span className="text-xs font-extrabold text-purple-600 bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-full">
                Giảm {activeSale.discountPercent}%
              </span>
            </div>

            {/* Countdown Badge */}
            {timeLeft && (
              <div className="flex items-center gap-2 text-xs font-bold text-on-surface-variant">
                <span>Thời gian còn lại:</span>
                <div className="flex items-center gap-1 font-mono font-bold">
                  <span className="bg-slate-900 text-green-400 px-2 py-0.5 rounded text-xs">
                    {String(timeLeft.hours).padStart(2, '0')}h
                  </span>
                  <span>:</span>
                  <span className="bg-slate-900 text-green-400 px-2 py-0.5 rounded text-xs">
                    {String(timeLeft.minutes).padStart(2, '0')}m
                  </span>
                  <span>:</span>
                  <span className="bg-slate-900 text-green-400 px-2 py-0.5 rounded text-xs">
                    {String(timeLeft.seconds).padStart(2, '0')}s
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-base md:text-lg font-bold text-on-surface">
                {activeSale.title}
              </h3>
              {activeSale.description && (
                <p className="text-xs md:text-sm text-on-surface-variant leading-relaxed">
                  {activeSale.description}
                </p>
              )}
              {activeSale.discountedAmount && activeSale.originalAmount && (
                <div className="flex items-center gap-2 pt-1 text-xs">
                  <span className="text-on-surface-variant line-through">
                    {activeSale.originalAmount.toLocaleString('vi-VN')}đ
                  </span>
                  <span className="text-primary font-black text-sm">
                    {activeSale.discountedAmount.toLocaleString('vi-VN')}đ
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={() => handleCopyCode('FLASH30')}
              className="px-5 py-2.5 bg-primary hover:opacity-90 !text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px] !text-white">content_copy</span>
              <span className="!text-white">{copiedCode === 'FLASH30' ? 'Đã chép mã FLASH30' : 'Sao chép mã FLASH30'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ─── Clean Vouchers Section ───────────────────────────────────── */}
      {vouchers.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[18px]">confirmation_number</span>
              <h3 className="text-sm font-bold text-on-surface">Mã giảm giá đang áp dụng</h3>
            </div>
            <span className="text-xs text-on-surface-variant font-semibold">
              {vouchers.length} mã được quản lý bởi Admin
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {vouchers.map((v) => (
              <div
                key={v.id || v.code}
                className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/40 hover:border-primary/40 transition-all flex flex-col justify-between gap-3 shadow-2xs"
              >
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className="px-2 py-0.5 bg-indigo-50 text-primary border border-indigo-200 rounded text-[11px] font-extrabold uppercase tracking-wider">
                      {v.code}
                    </span>
                    <p className="text-xs font-bold text-on-surface mt-2 line-clamp-1">{v.name}</p>
                  </div>
                  <span className="text-xs font-black text-primary shrink-0">
                    {v.discountType === 'percentage'
                      ? `-${v.discountValue}%`
                      : `-${(v.discountValue / 1000).toLocaleString('vi-VN')}k`}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-outline-variant/20 text-[11px]">
                  <span className="text-on-surface-variant">
                    {v.minOrderAmount > 0
                      ? `Đơn từ ${(v.minOrderAmount / 1000).toLocaleString('vi-VN')}k`
                      : 'Không giới hạn'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyCode(v.code)}
                    className="px-2.5 py-1 bg-primary/10 hover:bg-primary/20 text-primary font-bold text-[11px] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[13px]">
                      {copiedCode === v.code ? 'check' : 'content_copy'}
                    </span>
                    <span>{copiedCode === v.code ? 'Đã chép' : 'Sao chép'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
