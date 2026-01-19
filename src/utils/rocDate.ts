// ROC (Republic of China) date utilities
// Taiwan uses the Minguo calendar: ROC year = AD year - 1911

export function adToRoc(adYear: number): number {
  return adYear - 1911;
}

export function rocToAd(rocYear: number): number {
  return rocYear + 1911;
}

export function formatRocDate(date: Date | string): {
  year: number;
  month: number;
  day: number;
  formatted: string;
} {
  const d = typeof date === 'string' ? new Date(date) : date;
  const rocYear = adToRoc(d.getFullYear());
  const month = d.getMonth() + 1;
  const day = d.getDate();

  return {
    year: rocYear,
    month,
    day,
    formatted: `中華民國 ${rocYear} 年 ${month} 月 ${day} 日`,
  };
}

// Get the invoice period string (e.g., "一一四年一、二月份")
export function getInvoicePeriod(startMonth: number, endMonth: number, rocYear: number): string {
  const yearDigits = rocYear.toString().split('').map(d => {
    const digits = ['○', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
    return digits[parseInt(d)];
  }).join('');

  const monthNames = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'];

  return `${yearDigits}年${monthNames[startMonth - 1]}、${monthNames[endMonth - 1]}月份`;
}

// Get current ROC year
export function getCurrentRocYear(): number {
  return adToRoc(new Date().getFullYear());
}

// Get month pairs for invoice periods (Taiwan invoices use bi-monthly periods)
export function getInvoicePeriodPairs(): { start: number; end: number; label: string }[] {
  return [
    { start: 1, end: 2, label: '一、二月份' },
    { start: 3, end: 4, label: '三、四月份' },
    { start: 5, end: 6, label: '五、六月份' },
    { start: 7, end: 8, label: '七、八月份' },
    { start: 9, end: 10, label: '九、十月份' },
    { start: 11, end: 12, label: '十一、十二月份' },
  ];
}
