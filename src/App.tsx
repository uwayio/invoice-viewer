import { useState, useRef, useCallback } from "react";
import { Layout } from "./components/Layout";
import { InputForm } from "./components/InputForm";
import { PreviewPane } from "./components/PreviewPane";
import { Watermark } from "./components/Watermark";
import { InvoiceData, LineItem } from "./components/InvoicePreview";
import {
  exportToPdf,
  copyToClipboard,
  generateRandomInvoiceNumber,
} from "./utils/exportUtils";
import { getCurrentRocYear } from "./utils/rocDate";

// Get current bi-monthly period
function getCurrentPeriod(): { start: number; end: number } {
  const month = new Date().getMonth() + 1;
  const periodIndex = Math.floor((month - 1) / 2);
  const periods = [
    { start: 1, end: 2 },
    { start: 3, end: 4 },
    { start: 5, end: 6 },
    { start: 7, end: 8 },
    { start: 9, end: 10 },
    { start: 11, end: 12 },
  ];
  return periods[periodIndex];
}

const emptyLineItems: LineItem[] = Array(5)
  .fill(null)
  .map(() => ({
    name: "",
    quantity: "",
    unitPrice: "",
    notes: "",
  }));

function App() {
  const currentPeriod = getCurrentPeriod();

  const [formData, setFormData] = useState<InvoiceData>({
    buyerName: "",
    buyerTaxId: "",
    buyerAddress: "",
    invoiceDate: new Date().toISOString().split("T")[0],
    periodStartMonth: currentPeriod.start,
    periodEndMonth: currentPeriod.end,
    periodYear: getCurrentRocYear(),
    taxType: "taxable",
    lineItems: emptyLineItems,
    invoiceNumber: generateRandomInvoiceNumber(),
    sellerStampImage: "/stamp.png", // Placeholder, user needs to place image in public folder
  });

  const [isExporting, setIsExporting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const invoiceRef = useRef<HTMLDivElement>(null);

  const handleInputChange = useCallback(
    <K extends keyof InvoiceData>(field: K, value: InvoiceData[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const handleLineItemChange = useCallback(
    (index: number, field: keyof LineItem, value: string) => {
      setFormData((prev) => {
        const newItems = [...prev.lineItems];
        newItems[index] = { ...newItems[index], [field]: value };
        return { ...prev, lineItems: newItems };
      });
    },
    [],
  );

  const handleExportPdf = async () => {
    if (!invoiceRef.current) return;
    setIsExporting(true);
    try {
      const invoiceElement = document.getElementById("invoice-preview");
      if (invoiceElement) {
        await exportToPdf(
          invoiceElement,
          `invoice-${formData.invoiceNumber.replace(" ", "-")}.pdf`,
        );
        showToast("PDF 已下載");
      }
    } catch (err) {
      console.error("Export failed:", err);
      showToast("匯出失敗");
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyToClipboard = async () => {
    if (!invoiceRef.current) return;
    setIsExporting(true);
    try {
      const invoiceElement = document.getElementById("invoice-preview");
      if (invoiceElement) {
        const success = await copyToClipboard(invoiceElement);
        showToast(success ? "已複製到剪貼簿" : "複製失敗");
      }
    } catch (err) {
      console.error("Copy failed:", err);
      showToast("複製失敗");
    } finally {
      setIsExporting(false);
    }
  };

  const handleRegenerateInvoiceNumber = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      invoiceNumber: generateRandomInvoiceNumber(),
    }));
  }, []);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2000);
  };

  return (
    <Layout
      sidebar={
        <InputForm
          data={formData}
          onChange={handleInputChange}
          onLineItemChange={handleLineItemChange}
          onExportPdf={handleExportPdf}
          onCopyToClipboard={handleCopyToClipboard}
          onRegenerateInvoiceNumber={handleRegenerateInvoiceNumber}
          isExporting={isExporting}
        />
      }
      preview={
        <div
          className="relative group w-full h-full flex justify-center"
          ref={invoiceRef}
        >
          {/* Toast Notification */}
          {toast && (
            <div className="absolute top-6 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-gray-900 text-white rounded-lg shadow-lg z-50 animate-fade-in">
              {toast}
            </div>
          )}

          <PreviewPane data={formData} />

          <Watermark />
        </div>
      }
    />
  );
}

export default App;
