import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

export async function exportToPdf(element: HTMLElement, filename: string = 'invoice.pdf'): Promise<void> {
  console.log('exportToPdf: starting...');
  const imgData = await toPng(element, {
    pixelRatio: 2,
    backgroundColor: '#ffffff',
  });
  console.log('exportToPdf: image created');

  // Load image to get dimensions
  const img = new Image();
  await new Promise<void>((resolve) => {
    img.onload = () => resolve();
    img.src = imgData;
  });

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  const imgWidth = img.width;
  const imgHeight = img.height;

  // Calculate scaling to fit the page while maintaining aspect ratio
  const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
  const scaledWidth = imgWidth * ratio;
  const scaledHeight = imgHeight * ratio;

  // Center the image on the page
  const x = (pdfWidth - scaledWidth) / 2;
  const y = (pdfHeight - scaledHeight) / 2;

  pdf.addImage(imgData, 'PNG', x, y, scaledWidth, scaledHeight);
  pdf.save(filename);
}

export async function copyToClipboard(element: HTMLElement): Promise<'copied' | 'downloaded' | false> {
  try {
    console.log('copyToClipboard: starting...');
    const dataUrl = await toPng(element, {
      pixelRatio: 2,
      backgroundColor: '#ffffff',
    });
    console.log('copyToClipboard: image created');

    // Convert data URL to blob
    const response = await fetch(dataUrl);
    const blob = await response.blob();

    // Try modern Clipboard API first
    if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
      try {
        await navigator.clipboard.write([
          new ClipboardItem({
            'image/png': blob,
          }),
        ]);
        return 'copied';
      } catch (err) {
        console.warn('Clipboard API failed, trying fallback:', err);
      }
    }

    // Fallback: Download as PNG file
    try {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return 'downloaded';
    } catch (err) {
      console.warn('Download fallback failed:', err);
    }

    return false;
  } catch (err) {
    console.error('Failed to render image:', err);
    return false;
  }
}

// Generate a random invoice number in Taiwan format (2 letters + 8 digits)
export function generateRandomInvoiceNumber(): string {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // Excluding I and O to avoid confusion
  const prefix = letters[Math.floor(Math.random() * letters.length)] +
                 letters[Math.floor(Math.random() * letters.length)];
  const number = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
  return `${prefix} ${number}`;
}
