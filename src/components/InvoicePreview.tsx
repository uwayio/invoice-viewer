import React from 'react';
import { numberToChineseCapital } from '@/utils/chineseNumerals';
import { formatRocDate, getInvoicePeriod } from '@/utils/rocDate';

export interface LineItem {
  name: string;
  quantity: string;
  unitPrice: string;
  notes: string;
}

export interface InvoiceData {
  buyerName: string;
  buyerTaxId: string;
  buyerAddress: string;
  invoiceDate: string;
  periodStartMonth: number;
  periodEndMonth: number;
  periodYear: number;
  taxType: 'taxable' | 'zeroRate' | 'taxExempt';
  lineItems: LineItem[];
  invoiceNumber: string;
}

interface InvoicePreviewProps {
  data: InvoiceData;
}

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({ data }) => {
  // Calculate totals
  const calculateAmount = (quantity: string, unitPrice: string): number => {
    const qty = parseFloat(quantity) || 0;
    const price = parseFloat(unitPrice) || 0;
    return qty * price;
  };

  const salesTotal = data.lineItems.reduce((sum, item) => {
    return sum + calculateAmount(item.quantity, item.unitPrice);
  }, 0);

  const taxAmount = data.taxType === 'taxable' ? Math.round(salesTotal * 0.05) : 0;
  const grandTotal = salesTotal + taxAmount;

  // Format date
  const rocDate = formatRocDate(data.invoiceDate || new Date());

  // Get invoice period
  const invoicePeriod = getInvoicePeriod(
    data.periodStartMonth,
    data.periodEndMonth,
    data.periodYear
  );

  // Split tax ID into individual digits
  const taxIdDigits = data.buyerTaxId.padEnd(8, ' ').split('').slice(0, 8);

  // Chinese numerals for total
  const chineseTotal = numberToChineseCapital(grandTotal);

  // Format number with thousand separators
  const formatNumber = (num: number): string => {
    return num.toLocaleString('zh-TW');
  };

  return (
    <div
      id="invoice-preview"
      className="bg-white w-[680px] p-8 text-black"
      style={{ fontFamily: '"Noto Sans TC", "Microsoft JhengHei", sans-serif' }}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <div className="text-sm font-mono tracking-wider">
          {data.invoiceNumber}
        </div>
        <div className="text-center flex-1">
          <h1 className="text-xl tracking-[0.5em] font-bold">
            統 一 發 票（三 聯 式）
          </h1>
          <div className="text-sm mt-1">{invoicePeriod}</div>
        </div>
        <div className="w-24"></div>
      </div>

      {/* Buyer Info Section */}
      <div className="border border-black mt-4">
        {/* Row 1: Buyer Name */}
        <div className="flex border-b border-black">
          <div className="w-20 p-2 border-r border-black text-center tracking-widest">
            買 受 人
          </div>
          <div className="flex-1 p-2">{data.buyerName}</div>
        </div>

        {/* Row 2: Tax ID and Date */}
        <div className="flex border-b border-black">
          <div className="w-20 p-2 border-r border-black text-center tracking-widest">
            統一編號
          </div>
          <div className="flex-1 p-2 flex items-center">
            <div className="flex">
              {taxIdDigits.map((digit, i) => (
                <div
                  key={i}
                  className="w-7 h-7 border border-black flex items-center justify-center text-center mx-0.5"
                >
                  {digit !== ' ' ? digit : ''}
                </div>
              ))}
            </div>
            <div className="ml-auto text-sm">
              中華民國 {rocDate.year} 年 {rocDate.month} 月 {rocDate.day} 日
            </div>
          </div>
        </div>

        {/* Row 3: Address */}
        <div className="flex border-b border-black">
          <div className="w-20 p-2 border-r border-black text-center tracking-widest">
            地　　址
          </div>
          <div className="flex-1 p-2">{data.buyerAddress}</div>
        </div>

        {/* Items Table */}
        <div className="flex border-b border-black">
          {/* Left side - Items */}
          <div className="flex-1 border-r border-black">
            {/* Header */}
            <div className="flex border-b border-black bg-gray-50">
              <div className="flex-1 p-2 text-center border-r border-black">品　　名</div>
              <div className="w-16 p-2 text-center border-r border-black">數 量</div>
              <div className="w-20 p-2 text-center border-r border-black">單　價</div>
              <div className="w-24 p-2 text-center">金　　額</div>
            </div>
            {/* Items */}
            {data.lineItems.map((item, index) => {
              const amount = calculateAmount(item.quantity, item.unitPrice);
              return (
                <div
                  key={index}
                  className={`flex ${index < data.lineItems.length - 1 ? 'border-b border-gray-300' : ''}`}
                  style={{ minHeight: '32px' }}
                >
                  <div className="flex-1 p-1.5 border-r border-gray-300 text-sm">
                    {item.name}
                  </div>
                  <div className="w-16 p-1.5 text-right border-r border-gray-300 text-sm">
                    {item.quantity}
                  </div>
                  <div className="w-20 p-1.5 text-right border-r border-gray-300 text-sm">
                    {item.unitPrice && formatNumber(parseFloat(item.unitPrice) || 0)}
                  </div>
                  <div className="w-24 p-1.5 text-right text-sm">
                    {amount > 0 && formatNumber(amount)}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right side - Stamp area & Notes */}
          <div className="w-40">
            {/* Header */}
            <div className="p-2 text-center border-b border-black bg-gray-50">
              備　　　　註
            </div>
            {/* Notes for each item */}
            {data.lineItems.map((item, index) => (
              <div
                key={index}
                className={`p-1.5 text-sm ${index < data.lineItems.length - 1 ? 'border-b border-gray-300' : ''}`}
                style={{ minHeight: '32px' }}
              >
                {index === 0 && (
                  <div className="text-center text-xs mt-4">
                    <div className="border border-black p-2 mx-2">
                      <div>營業人蓋用</div>
                      <div>統一發票專用章</div>
                      <div className="mt-2 font-bold">宇緯科技有限公司</div>
                      <div className="font-mono">93659887</div>
                    </div>
                  </div>
                )}
                {index > 0 && item.notes}
              </div>
            ))}
          </div>
        </div>

        {/* Totals Section */}
        <div className="flex border-b border-black">
          <div className="w-20 p-2 border-r border-black text-center tracking-widest">
            銷售額合計
          </div>
          <div className="flex-1 p-2 text-right font-mono">
            {formatNumber(salesTotal)}
          </div>
        </div>

        {/* Tax Section */}
        <div className="flex border-b border-black">
          <div className="w-20 p-2 border-r border-black text-center tracking-widest">
            營 業 稅
          </div>
          <div className="flex-1 flex">
            <div className="flex-1 border-r border-black">
              <div className="flex">
                <div className="w-1/3 p-1 text-center text-xs border-r border-gray-300">
                  應稅
                </div>
                <div className="w-1/3 p-1 text-center text-xs border-r border-gray-300">
                  零稅率
                </div>
                <div className="w-1/3 p-1 text-center text-xs">
                  免稅
                </div>
              </div>
              <div className="flex border-t border-gray-300">
                <div className="w-1/3 p-1 text-center text-sm border-r border-gray-300 font-mono">
                  {data.taxType === 'taxable' && formatNumber(taxAmount)}
                </div>
                <div className="w-1/3 p-1 text-center text-sm border-r border-gray-300">
                  {data.taxType === 'zeroRate' && '✓'}
                </div>
                <div className="w-1/3 p-1 text-center text-sm">
                  {data.taxType === 'taxExempt' && '✓'}
                </div>
              </div>
            </div>
            <div className="w-32 flex items-center justify-center">
              <span className="text-xs mr-2">總計</span>
              <span className="font-mono font-bold">{formatNumber(grandTotal)}</span>
            </div>
          </div>
        </div>

        {/* Chinese Numerals Section */}
        <div className="flex">
          <div className="p-2 border-r border-black text-xs">
            <div>總計新臺幣</div>
            <div>（中文大寫）</div>
          </div>
          <div className="flex-1 flex items-center justify-center p-2 tracking-widest">
            {chineseTotal}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-2 flex justify-between text-xs text-gray-600">
        <div>※應稅、零稅率、免稅之銷售額應分別開立統一發票，並應於各該欄打「✓」。</div>
        <div>第一聯 存根聯</div>
      </div>
    </div>
  );
};
