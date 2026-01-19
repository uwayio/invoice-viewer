// Convert numbers to Chinese capital numerals (國字大寫)
// Used for official documents like invoices in Taiwan

const DIGITS = ['零', '壹', '貳', '參', '肆', '伍', '陸', '柒', '捌', '玖'];
const UNITS = ['', '拾', '佰', '仟'];
const BIG_UNITS = ['', '萬', '億'];

export function numberToChineseCapital(num: number): string {
  if (num === 0) return '零元';
  if (num < 0) return '負' + numberToChineseCapital(-num);

  // Round to integer
  num = Math.round(num);

  const numStr = num.toString();
  const len = numStr.length;

  let result = '';
  let zeroFlag = false;

  for (let i = 0; i < len; i++) {
    const digit = parseInt(numStr[i]);
    const position = len - i - 1; // Position from right (0-indexed)
    const unitIndex = position % 4;
    const bigUnitIndex = Math.floor(position / 4);

    if (digit === 0) {
      zeroFlag = true;
      // Add big unit at boundaries (萬, 億)
      if (unitIndex === 0 && bigUnitIndex > 0) {
        // Check if the entire section is not all zeros
        const sectionStart = i - (4 - unitIndex) + 1;
        const sectionEnd = Math.min(i + 1, len);
        let hasNonZero = false;
        for (let j = Math.max(0, sectionStart); j < sectionEnd; j++) {
          if (parseInt(numStr[j]) !== 0) {
            hasNonZero = true;
            break;
          }
        }
        if (hasNonZero || result.length > 0) {
          result += BIG_UNITS[bigUnitIndex];
        }
      }
    } else {
      if (zeroFlag && result.length > 0) {
        result += '零';
      }
      zeroFlag = false;
      result += DIGITS[digit] + UNITS[unitIndex];

      // Add big unit at boundaries (萬, 億)
      if (unitIndex === 0 && bigUnitIndex > 0) {
        result += BIG_UNITS[bigUnitIndex];
      }
    }
  }

  return result + '元';
}

// Format number with position markers for the invoice form
// Returns an object with each digit position for display in the grid
export function numberToPositionedDigits(num: number): {
  yi: string;      // 億
  qianWan: string; // 仟(萬位)
  baiWan: string;  // 佰(萬位)
  shiWan: string;  // 拾(萬位)
  wan: string;     // 萬
  qian: string;    // 仟
  bai: string;     // 佰
  shi: string;     // 拾
  yuan: string;    // 元
} {
  num = Math.round(num);
  const padded = num.toString().padStart(9, '0');

  return {
    yi: num >= 100000000 ? DIGITS[parseInt(padded[0])] : '',
    qianWan: num >= 10000000 ? DIGITS[parseInt(padded[1])] : '',
    baiWan: num >= 1000000 ? DIGITS[parseInt(padded[2])] : '',
    shiWan: num >= 100000 ? DIGITS[parseInt(padded[3])] : '',
    wan: num >= 10000 ? DIGITS[parseInt(padded[4])] : '',
    qian: num >= 1000 ? DIGITS[parseInt(padded[5])] : '',
    bai: num >= 100 ? DIGITS[parseInt(padded[6])] : '',
    shi: num >= 10 ? DIGITS[parseInt(padded[7])] : '',
    yuan: DIGITS[parseInt(padded[8])],
  };
}
