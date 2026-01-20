import React from "react";
import { InvoicePreview, InvoiceData } from "./InvoicePreview";

interface PreviewPaneProps {
  data: InvoiceData;
}

export const PreviewPane: React.FC<PreviewPaneProps> = ({ data }) => {
  return (
    <div
      className="bg-white relative transition-all duration-300 print:shadow-none print:m-0 print:rounded-none
        shadow-[0_24px_48px_-12px_rgba(0,0,0,0.1),0_0_2px_0_rgba(0,0,0,0.05)] rounded-[1px]
    "
    >
      <InvoicePreview data={data} />
    </div>
  );
};
