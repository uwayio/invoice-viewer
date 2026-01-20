import React from "react";
import { formatRocDate, getInvoicePeriod } from "@/utils/rocDate";

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
  taxType: "taxable" | "zeroRate" | "taxExempt";
  lineItems: LineItem[];
  invoiceNumber: string;
  sellerStampImage?: string;
}

interface InvoicePreviewProps {
  data: InvoiceData;
}

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({ data }) => {
  const calculateAmount = (quantity: string, unitPrice: string): number => {
    const qty = parseFloat(quantity) || 0;
    const price = parseFloat(unitPrice) || 0;
    return qty * price;
  };

  const salesTotal = data.lineItems.reduce((sum, item) => {
    return sum + calculateAmount(item.quantity, item.unitPrice);
  }, 0);

  const taxAmount =
    data.taxType === "taxable" ? Math.round(salesTotal * 0.05) : 0;
  const grandTotal = salesTotal + taxAmount;

  const rocDate = formatRocDate(data.invoiceDate || new Date());
  const invoicePeriod = getInvoicePeriod(
    data.periodStartMonth,
    data.periodEndMonth,
    data.periodYear,
  );
  const taxIdDigits = data.buyerTaxId.padEnd(8, " ").split("").slice(0, 8);

  const formatNumber = (num: number): string => num.toLocaleString("zh-TW");

  // Get first 4 items only, pad to 4
  const displayItems = [...data.lineItems.slice(0, 4)];
  while (displayItems.length < 4) {
    displayItems.push({ name: "", quantity: "", unitPrice: "", notes: "" });
  }

  const getDigitAtPosition = (num: number, position: number): string => {
    const str = Math.floor(num).toString().padStart(9, " ");
    const reversed = str.split("").reverse();
    const digit = reversed[position] || "";
    return digit === " " ? "" : digit;
  };

  const cellBase = "border border-black px-1 py-0.5 text-center text-xs";
  const headerCell = `${cellBase} bg-gray-50 font-medium`;

  return (
    <div
      id="invoice-preview"
      className="bg-white w-[19cm] h-[10.9cm] text-black text-xs p-2 box-border flex flex-col"
      style={{ fontFamily: '"Noto Sans TC", "Microsoft JhengHei", sans-serif' }}
    >
      {/* Header Row - Invoice Number, Title, Date */}
      <div className="flex items-start justify-between mb-1">
        <div className="text-sm font-mono tracking-wider">
          {data.invoiceNumber}
        </div>
        <div className="text-center flex-1">
          <div className="text-base font-bold tracking-[0.3em]">
            統 一 發 票（三 聯 式）
          </div>
          <div className="text-xs">{invoicePeriod}</div>
        </div>
        <div className="text-xs text-right">
          中華民國{rocDate.year}年{rocDate.month}月{rocDate.day}日
        </div>
      </div>

      {/* Buyer Info Row - Above the table */}
      <div className="flex text-xs mb-1 gap-4">
        <div className="flex items-center">
          <span className="font-medium mr-1">買受人:</span>
          <span>{data.buyerName}</span>
        </div>
        <div className="flex items-center">
          <span className="font-medium mr-1">統一編號:</span>
          <div className="flex">
            {taxIdDigits.map((digit, i) => (
              <div
                key={i}
                className="w-4 h-4 border border-black flex items-center justify-center mx-px font-mono text-xs"
              >
                {digit !== " " ? digit : ""}
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center flex-1">
          <span className="font-medium mr-1">地址:</span>
          <span>{data.buyerAddress}</span>
          <span className="ml-auto text-gray-400 text-xs">可省略</span>
        </div>
      </div>

      {/* Main Table */}
      <table className="w-full border-collapse border border-black flex-1">
        <tbody>
          {/* Items Header */}
          <tr className="bg-gray-50">
            <td className={`${headerCell} w-[40%]`}>品　　名</td>
            <td className={`${headerCell} w-[10%]`}>數量</td>
            <td className={`${headerCell} w-[12%]`}>單價</td>
            <td className={`${headerCell} w-[15%]`}>金　　額</td>
            <td className={`${headerCell} w-[23%]`}>備　　註</td>
          </tr>

          {/* 4 Item Rows */}
          {displayItems.map((item, index) => {
            const amount = calculateAmount(item.quantity, item.unitPrice);
            return (
              <tr key={index} className="h-6">
                <td className={`${cellBase} text-left pl-2`}>
                  {item.name ||
                    (index === 0 && !item.name ? (
                      <span className="text-blue-500">請填上品項</span>
                    ) : (
                      ""
                    ))}
                </td>
                <td className={`${cellBase} text-right pr-1`}>
                  {item.quantity}
                </td>
                <td className={`${cellBase} text-right pr-1`}>
                  {item.unitPrice &&
                    formatNumber(parseFloat(item.unitPrice) || 0)}
                </td>
                <td className={`${cellBase} text-right pr-1`}>
                  {amount > 0 && formatNumber(amount)}
                </td>
                {index === 0 ? (
                  <td className={`${cellBase} relative`} rowSpan={4}>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-xs"></div>
                  </td>
                ) : null}
              </tr>
            );
          })}

          {/* Sales Total */}
          <tr>
            <td className={`${headerCell}`}>銷售額合計</td>
            <td className={`${cellBase} text-right pr-2 font-mono`} colSpan={3}>
              {formatNumber(salesTotal)}
            </td>
            <td className={`${cellBase}`} rowSpan={2}>
              <div className="text-gray-500 mb-1">營業人蓋用統一發票專用章</div>
              {data.sellerStampImage ? (
                <img
                  src={data.sellerStampImage}
                  alt="Seller Stamp"
                  className="max-w-[80px] max-h-[60px] object-contain"
                />
              ) : (
                <div className="text-blue-500 font-bold text-center opacity-60 rotate-[-5deg]">
                  記得要蓋
                  <br />
                  發票章唷
                </div>
              )}
            </td>
          </tr>

          {/* Tax Row */}
          <tr>
            <td className={`${headerCell}`}>營業稅</td>
            <td className={`${cellBase} p-0`} colSpan={2}>
              <div className="flex h-full">
                <div className="flex-1 border-r border-black">
                  <div className="text-xs border-b border-black py-px">
                    應稅
                  </div>
                  <div className="py-px font-mono">
                    {data.taxType === "taxable" && formatNumber(taxAmount)}
                  </div>
                </div>
                <div className="flex-1 border-r border-black">
                  <div className="text-xs border-b border-black py-px">
                    零稅率
                  </div>
                  <div className="py-px">
                    {data.taxType === "zeroRate" && "✓"}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-xs border-b border-black py-px">
                    免稅
                  </div>
                  <div className="py-px">
                    {data.taxType === "taxExempt" && "✓"}
                  </div>
                </div>
              </div>
            </td>
            <td className={`${cellBase} text-right pr-2 font-mono font-bold`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-normal">總計</span>
                <span>{formatNumber(grandTotal)}</span>
              </div>
            </td>
          </tr>

          {/* Chinese Numerals Row */}
          <tr>
            <td className={`${headerCell} text-xs leading-tight`}>
              總計新臺幣
              <br />
              (中文大寫)
            </td>
            <td className={`${cellBase} p-0`} colSpan={4}>
              <div className="flex">
                {["億", "仟", "佰", "拾", "萬", "仟", "佰", "拾", "元"].map(
                  (label, i) => (
                    <div
                      key={label + i}
                      className="flex-1 border-r border-black last:border-r-0"
                    >
                      <div className="text-xs border-b border-black py-px">
                        {label}
                      </div>
                      <div className="py-px font-mono">
                        {getDigitAtPosition(grandTotal, 8 - i)}
                      </div>
                    </div>
                  ),
                )}
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Footer */}
      <div className="flex justify-between text-xs text-gray-500 mt-0.5">
        <div>
          ※應稅、零稅率、免稅之銷售額應分別開立統一發票，並應於各該欄打「✓」。
        </div>
        <div>第＿聯＿＿聯</div>
      </div>
    </div>
  );
};
