# Invoice Draft Generator Design

## Overview

Convert the bridge-letter-app into a Taiwanese 統一發票 (Uniform Invoice) draft generator. The app will allow users to input invoice details and preview a draft invoice that closely matches the official three-part format (三聯式).

## Requirements

- React-rendered invoice preview matching the paper form
- Issuing company: 宇緯科技有限公司 (Tax #93659887)
- All fields user-editable
- PDF and clipboard export
- Clear "樣本" (sample) watermark to indicate draft status
- Random invoice number generation

## Design

### Layout

Two-column layout:
- **Left sidebar (400px):** Input form with grouped fields
- **Right panel:** Live invoice preview

### Invoice Preview Structure

```
┌─────────────────────────────────────────────────────┐
│  [Random#]    統 一 發 票（三 聯 式）              │
│               [期別]                                │
├─────────────────────────────────────────────────────┤
│  買 受 人：[buyer name]                             │
│  統一編號：[8 boxes]              中華民國___年__月__日│
│  地    址：[address]                                │
├─────────────────────────────────────────────────────┤
│  品名 │ 數量 │ 單價 │ 金額 │ 備註                  │
│───────┼──────┼──────┼──────┼───────────────────────│
│       │      │      │      │   營業人蓋用          │
│  (5 fixed rows)              │   統一發票專用章      │
│                             │   宇緯科技有限公司    │
│                             │   93659887            │
├─────────────────────────────────────────────────────┤
│  銷售額合計：              營業稅：    總計：       │
│  總計新臺幣（中文大寫）：億仟佰拾萬仟佰拾元        │
└─────────────────────────────────────────────────────┘
        ↑ Diagonal "樣本" watermark overlay
```

### Input Form Fields

**Card 1 - 買受人資料 (Buyer Info):**
- 買受人 (Buyer name) - text input
- 統一編號 (Tax ID) - 8-digit input with validation
- 地址 (Address) - single text input

**Card 2 - 發票資訊 (Invoice Info):**
- 發票期別 (Invoice period) - dual month selector
- 發票日期 (Date) - date picker (displays as ROC year)
- 稅別 (Tax type) - radio: 應稅 / 零稅率 / 免稅

**Card 3 - 品項明細 (Line Items):**
- 5 fixed rows with: 品名, 數量, 單價, 備註
- 金額 auto-calculated (數量 × 單價)

**Card 4 - 匯出 (Export):**
- PDF export button
- Clipboard copy button

### Auto-calculations

- 金額 = 數量 × 單價 (per row)
- 銷售額合計 = sum of all 金額
- 營業稅 = 銷售額合計 × 5% (if 應稅), 0 otherwise
- 總計 = 銷售額合計 + 營業稅
- 中文大寫 auto-converts total to Chinese numerals

### Technical Implementation

**Export:**
- `html2canvas` + `jsPDF` for PDF export
- `html2canvas` + Clipboard API for image copy

**Utilities:**
- Chinese numeral conversion (up to 億)
- ROC date formatting (AD - 1911)
- Random invoice number generation

### File Changes

**Modify:**
- `src/App.tsx` - New invoice state
- `src/components/InputForm.tsx` - Invoice input fields
- `src/components/PreviewPane.tsx` - Invoice preview container
- `src/components/Watermark.tsx` - "樣本" text

**Create:**
- `src/components/InvoicePreview.tsx` - Styled invoice
- `src/utils/chineseNumerals.ts` - Number conversion
- `src/utils/rocDate.ts` - Date formatting
- `src/utils/exportUtils.ts` - Export functions

**Dependencies:**
- `html2canvas`
- `jspdf`
