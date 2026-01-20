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

  const cellStyle: React.CSSProperties = {
    border: '1px solid black',
    padding: '2px 4px',
    textAlign: 'center',
    fontSize: '12px',
    verticalAlign: 'middle',
  };
  const headerStyle: React.CSSProperties = {
    ...cellStyle,
    backgroundColor: '#f9fafb',
    fontWeight: 500,
  };

  return (
    <div
      id="invoice-preview"
      style={{
        backgroundColor: 'white',
        width: '19cm',
        height: '10.9cm',
        color: 'black',
        fontSize: '12px',
        padding: '8px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: '"Noto Sans TC", "Microsoft JhengHei", sans-serif',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Diagonal Watermark */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%) rotate(-30deg)',
          pointerEvents: 'none',
          userSelect: 'none',
          zIndex: 10,
          opacity: 0.08,
          whiteSpace: 'nowrap',
        }}
      >
        <div
          style={{
            color: '#dc2626',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: '72px',
              fontWeight: 900,
              letterSpacing: '0.3em',
              lineHeight: 1,
            }}
          >
            樣本
          </div>
          <div
            style={{
              fontSize: '24px',
              fontWeight: 700,
              letterSpacing: '0.5em',
              marginTop: '8px',
            }}
          >
            SAMPLE
          </div>
        </div>
      </div>

      {/* Header Row - Invoice Number, Title, Date */}
      <table style={{ width: '100%', marginBottom: '4px' }}>
        <tbody>
          <tr>
            <td style={{ width: '20%', fontSize: '14px', fontFamily: 'monospace', letterSpacing: '0.05em', textAlign: 'left', verticalAlign: 'top' }}>
              {data.invoiceNumber}
            </td>
            <td style={{ width: '60%', textAlign: 'center', verticalAlign: 'top' }}>
              <div style={{ fontSize: '16px', fontWeight: 'bold', letterSpacing: '0.3em' }}>
                統 一 發 票（三 聯 式）
              </div>
              <div style={{ fontSize: '12px' }}>{invoicePeriod}</div>
            </td>
            <td style={{ width: '20%', fontSize: '12px', textAlign: 'right', verticalAlign: 'top' }}>
              中華民國{rocDate.year}年{rocDate.month}月{rocDate.day}日
            </td>
          </tr>
        </tbody>
      </table>

      {/* Buyer Info Row - Above the table */}
      <table style={{ width: '100%', fontSize: '12px', marginBottom: '4px' }}>
        <tbody>
          <tr>
            <td style={{ textAlign: 'left', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
              <span style={{ fontWeight: 500, marginRight: '4px' }}>買受人:</span>
              <span>{data.buyerName}</span>
            </td>
            <td style={{ textAlign: 'left', paddingLeft: '16px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
              <span style={{ fontWeight: 500, marginRight: '4px' }}>統一編號:</span>
              {taxIdDigits.map((digit, i) => (
                <span
                  key={i}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '13px',
                    height: '13px',
                    border: '1px solid black',
                    marginLeft: '1px',
                    marginRight: '1px',
                    verticalAlign: 'middle',
                    fontFamily: 'monospace',
                    fontSize: '9px',
                  }}
                >
                  {digit !== " " ? digit : ""}
                </span>
              ))}
            </td>
            <td style={{ textAlign: 'left', verticalAlign: 'middle', paddingLeft: '16px' }}>
              <span style={{ fontWeight: 500, marginRight: '4px' }}>地址:</span>
              <span>{data.buyerAddress}</span>
            </td>
            <td style={{ textAlign: 'right', verticalAlign: 'middle', color: '#9ca3af', fontSize: '12px', whiteSpace: 'nowrap' }}>
              可省略
            </td>
          </tr>
        </tbody>
      </table>

      {/* Main Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid black', flex: 1 }}>
        <tbody>
          {/* Items Header */}
          <tr>
            <td style={{ ...headerStyle, width: '40%' }}>品　　名</td>
            <td style={{ ...headerStyle, width: '10%' }}>數量</td>
            <td style={{ ...headerStyle, width: '12%' }}>單價</td>
            <td style={{ ...headerStyle, width: '15%' }}>金　　額</td>
            <td style={{ ...headerStyle, width: '23%' }}>備　　註</td>
          </tr>

          {/* 4 Item Rows */}
          {displayItems.map((item, index) => {
            const amount = calculateAmount(item.quantity, item.unitPrice);
            return (
              <tr key={index} style={{ height: '24px' }}>
                <td style={{ ...cellStyle, textAlign: 'left', paddingLeft: '8px' }}>
                  {item.name ||
                    (index === 0 && !item.name ? (
                      <span style={{ color: '#3b82f6' }}>請填上品項</span>
                    ) : (
                      ""
                    ))}
                </td>
                <td style={{ ...cellStyle, textAlign: 'right', paddingRight: '4px', fontFamily: 'monospace' }}>
                  {item.quantity}
                </td>
                <td style={{ ...cellStyle, textAlign: 'right', paddingRight: '4px', fontFamily: 'monospace' }}>
                  {item.unitPrice &&
                    formatNumber(parseFloat(item.unitPrice) || 0)}
                </td>
                <td style={{ ...cellStyle, textAlign: 'right', paddingRight: '4px', fontFamily: 'monospace' }}>
                  {amount > 0 && formatNumber(amount)}
                </td>
                {index === 0 ? (
                  <td style={{ ...cellStyle }} rowSpan={4}>
                  </td>
                ) : null}
              </tr>
            );
          })}

          {/* Sales Total */}
          <tr>
            <td style={headerStyle}>銷售額合計</td>
            <td style={{ ...cellStyle, textAlign: 'right', paddingRight: '8px', fontFamily: 'monospace' }} colSpan={3}>
              {formatNumber(salesTotal)}
            </td>
            <td style={{ ...cellStyle, textAlign: 'center', verticalAlign: 'middle' }} rowSpan={2}>
              <div style={{ color: '#6b7280', marginBottom: '4px', fontSize: '10px' }}>營業人蓋用統一發票專用章</div>
              {data.sellerStampImage ? (
                <img
                  src={data.sellerStampImage}
                  alt="Seller Stamp"
                  style={{ maxWidth: '80px', maxHeight: '60px', margin: '0 auto', display: 'block' }}
                />
              ) : (
                <div style={{ color: '#3b82f6', fontWeight: 'bold', textAlign: 'center', opacity: 0.6, transform: 'rotate(-5deg)' }}>
                  記得要蓋
                  <br />
                  發票章唷
                </div>
              )}
            </td>
          </tr>

          {/* Tax Row */}
          <tr>
            <td style={headerStyle}>營業稅</td>
            <td style={{ ...cellStyle, padding: 0 }} colSpan={2}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr>
                    <td style={{ fontSize: '12px', textAlign: 'center', borderBottom: '1px solid black', borderRight: '1px solid black', padding: '2px', width: '33.3%', verticalAlign: 'middle' }}>應稅</td>
                    <td style={{ fontSize: '12px', textAlign: 'center', borderBottom: '1px solid black', borderRight: '1px solid black', padding: '2px', width: '33.3%', verticalAlign: 'middle' }}>零稅率</td>
                    <td style={{ fontSize: '12px', textAlign: 'center', borderBottom: '1px solid black', padding: '2px', width: '33.3%', verticalAlign: 'middle' }}>免稅</td>
                  </tr>
                  <tr>
                    <td style={{ textAlign: 'center', borderRight: '1px solid black', padding: '2px', fontFamily: 'monospace', verticalAlign: 'middle' }}>
                      {data.taxType === "taxable" && formatNumber(taxAmount)}
                    </td>
                    <td style={{ textAlign: 'center', borderRight: '1px solid black', padding: '2px', verticalAlign: 'middle' }}>
                      {data.taxType === "zeroRate" && "✓"}
                    </td>
                    <td style={{ textAlign: 'center', padding: '2px', verticalAlign: 'middle' }}>
                      {data.taxType === "taxExempt" && "✓"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
            <td style={{ ...cellStyle, padding: '2px 8px' }}>
              <table style={{ width: '100%' }}>
                <tbody>
                  <tr>
                    <td style={{ textAlign: 'left', fontSize: '12px', verticalAlign: 'middle' }}>總計</td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 'bold', verticalAlign: 'middle' }}>{formatNumber(grandTotal)}</td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>

          {/* Chinese Numerals Row */}
          <tr>
            <td style={{ ...headerStyle, fontSize: '12px', lineHeight: '1.2' }}>
              總計新臺幣
              <br />
              (中文大寫)
            </td>
            <td style={{ ...cellStyle, padding: 0 }} colSpan={4}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr>
                    {["億", "仟", "佰", "拾", "萬", "仟", "佰", "拾", "元"].map(
                      (label, i) => (
                        <td
                          key={label + i}
                          style={{
                            borderRight: i < 8 ? '1px solid black' : 'none',
                            textAlign: 'center',
                            fontSize: '12px',
                            borderBottom: '1px solid black',
                            padding: '2px',
                            width: '11.1%',
                            verticalAlign: 'middle',
                          }}
                        >
                          {label}
                        </td>
                      ),
                    )}
                  </tr>
                  <tr>
                    {["億", "仟", "佰", "拾", "萬", "仟", "佰", "拾", "元"].map(
                      (label, i) => (
                        <td
                          key={`digit-${i}`}
                          style={{
                            borderRight: i < 8 ? '1px solid black' : 'none',
                            textAlign: 'center',
                            padding: '2px',
                            fontFamily: 'monospace',
                            verticalAlign: 'middle',
                          }}
                        >
                          {getDigitAtPosition(grandTotal, 8 - i)}
                        </td>
                      ),
                    )}
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Footer */}
      <table style={{ width: '100%', fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
        <tbody>
          <tr>
            <td style={{ textAlign: 'left', verticalAlign: 'middle' }}>
              ※應稅、零稅率、免稅之銷售額應分別開立統一發票，並應於各該欄打「✓」。
            </td>
            <td style={{ textAlign: 'right', verticalAlign: 'middle' }}>第＿聯＿＿聯</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
