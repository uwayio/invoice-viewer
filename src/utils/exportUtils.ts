import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export async function exportToPdf(element: HTMLElement, filename: string = 'invoice.pdf'): Promise<void> {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  const imgWidth = canvas.width;
  const imgHeight = canvas.height;

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

export async function copyToClipboard(element: HTMLElement): Promise<boolean> {
  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    return new Promise((resolve) => {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          resolve(false);
          return;
        }

        try {
          await navigator.clipboard.write([
            new ClipboardItem({
              'image/png': blob,
            }),
          ]);
          resolve(true);
        } catch (err) {
          console.error('Failed to copy to clipboard:', err);
          resolve(false);
        }
      }, 'image/png');
    });
  } catch (err) {
    console.error('Failed to render canvas:', err);
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
