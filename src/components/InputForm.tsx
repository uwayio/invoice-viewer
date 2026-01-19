import React from 'react';
import { RefreshCw, FileDown, Copy } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { InvoiceData, LineItem } from './InvoicePreview';
import { getInvoicePeriodPairs, getCurrentRocYear } from '@/utils/rocDate';

interface InputFormProps {
  data: InvoiceData;
  onChange: <K extends keyof InvoiceData>(field: K, value: InvoiceData[K]) => void;
  onLineItemChange: (index: number, field: keyof LineItem, value: string) => void;
  onExportPdf: () => void;
  onCopyToClipboard: () => void;
  onRegenerateInvoiceNumber: () => void;
  isExporting: boolean;
}

export const InputForm: React.FC<InputFormProps> = ({
  data,
  onChange,
  onLineItemChange,
  onExportPdf,
  onCopyToClipboard,
  onRegenerateInvoiceNumber,
  isExporting,
}) => {
  const periodPairs = getInvoicePeriodPairs();
  const currentRocYear = getCurrentRocYear();

  // Generate year options (current year and 2 years back)
  const yearOptions = [currentRocYear, currentRocYear - 1, currentRocYear - 2];

  const handlePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [start, end] = e.target.value.split('-').map(Number);
    onChange('periodStartMonth', start);
    onChange('periodEndMonth', end);
  };

  return (
    <div className="flex flex-col h-full space-y-5">
      <div className="space-y-5 flex-1 overflow-y-auto pr-1">
        {/* Buyer Info */}
        <Card className="border-none shadow-none p-0 bg-transparent">
          <CardHeader className="px-0 pt-0 pb-3">
            <CardTitle className="text-base">買受人資料</CardTitle>
            <CardDescription>發票抬頭及統一編號</CardDescription>
          </CardHeader>
          <CardContent className="px-0 space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="buyerName">買受人</Label>
              <Input
                id="buyerName"
                value={data.buyerName}
                onChange={(e) => onChange('buyerName', e.target.value)}
                placeholder="公司名稱"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="buyerTaxId">統一編號</Label>
              <Input
                id="buyerTaxId"
                value={data.buyerTaxId}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 8);
                  onChange('buyerTaxId', value);
                }}
                placeholder="8位數字"
                maxLength={8}
                className="font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="buyerAddress">地址</Label>
              <Input
                id="buyerAddress"
                value={data.buyerAddress}
                onChange={(e) => onChange('buyerAddress', e.target.value)}
                placeholder="完整地址"
              />
            </div>
          </CardContent>
        </Card>

        {/* Invoice Info */}
        <Card className="border-none shadow-none p-0 bg-transparent">
          <CardHeader className="px-0 pt-0 pb-3">
            <CardTitle className="text-base">發票資訊</CardTitle>
          </CardHeader>
          <CardContent className="px-0 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="periodYear">年度</Label>
                <select
                  id="periodYear"
                  value={data.periodYear}
                  onChange={(e) => onChange('periodYear', Number(e.target.value))}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {yearOptions.map(year => (
                    <option key={year} value={year}>民國 {year} 年</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="period">期別</Label>
                <select
                  id="period"
                  value={`${data.periodStartMonth}-${data.periodEndMonth}`}
                  onChange={handlePeriodChange}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {periodPairs.map(p => (
                    <option key={`${p.start}-${p.end}`} value={`${p.start}-${p.end}`}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="invoiceDate">發票日期</Label>
              <Input
                id="invoiceDate"
                type="date"
                value={data.invoiceDate}
                onChange={(e) => onChange('invoiceDate', e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label>稅別</Label>
              <div className="flex gap-4">
                {[
                  { value: 'taxable', label: '應稅' },
                  { value: 'zeroRate', label: '零稅率' },
                  { value: 'taxExempt', label: '免稅' },
                ].map(option => (
                  <label key={option.value} className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="taxType"
                      value={option.value}
                      checked={data.taxType === option.value}
                      onChange={(e) => onChange('taxType', e.target.value as InvoiceData['taxType'])}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>發票號碼（樣本）</Label>
              <div className="flex gap-2">
                <Input
                  value={data.invoiceNumber}
                  readOnly
                  className="font-mono bg-muted"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={onRegenerateInvoiceNumber}
                  title="重新產生號碼"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Line Items */}
        <Card className="border-none shadow-none p-0 bg-transparent">
          <CardHeader className="px-0 pt-0 pb-3">
            <CardTitle className="text-base">品項明細</CardTitle>
            <CardDescription>金額將自動計算</CardDescription>
          </CardHeader>
          <CardContent className="px-0 space-y-3">
            {data.lineItems.map((item, index) => (
              <div key={index} className="p-3 bg-muted/30 rounded-lg space-y-2">
                <div className="text-xs text-muted-foreground font-medium">
                  品項 {index + 1}
                </div>
                <div className="space-y-2">
                  <Input
                    value={item.name}
                    onChange={(e) => onLineItemChange(index, 'name', e.target.value)}
                    placeholder="品名"
                    className="h-8 text-sm"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      value={item.quantity}
                      onChange={(e) => onLineItemChange(index, 'quantity', e.target.value)}
                      placeholder="數量"
                      type="number"
                      className="h-8 text-sm"
                    />
                    <Input
                      value={item.unitPrice}
                      onChange={(e) => onLineItemChange(index, 'unitPrice', e.target.value)}
                      placeholder="單價"
                      type="number"
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Export Buttons */}
      <div className="pt-4 border-t border-border space-y-2">
        <Button
          onClick={onExportPdf}
          disabled={isExporting}
          className="w-full"
        >
          <FileDown className="h-4 w-4 mr-2" />
          匯出 PDF
        </Button>
        <Button
          onClick={onCopyToClipboard}
          disabled={isExporting}
          variant="outline"
          className="w-full"
        >
          <Copy className="h-4 w-4 mr-2" />
          複製到剪貼簿
        </Button>
      </div>
    </div>
  );
};
