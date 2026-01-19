import React from 'react';
import { FileText } from 'lucide-react';

interface LayoutProps {
    sidebar: React.ReactNode;
    preview: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ sidebar, preview }) => {
    return (
        <div className="flex h-screen w-screen bg-background overflow-hidden font-sans text-foreground">
            {/* Sidebar */}
            <div className="w-[400px] flex-shrink-0 bg-card border-r border-border flex flex-col h-full z-20 print:hidden p-6 shadow-sm">

                {/* Header */}
                <div className="mb-6 flex items-center space-x-2">
                    <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
                        <FileText className="h-5 w-5" />
                    </div>
                    <span className="font-bold text-lg tracking-tight">發票草稿產生器</span>
                </div>

                {/* Form Content */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden pr-2 -mr-2">
                    {sidebar}
                </div>

                {/* Footer info */}
                <div className="mt-4 pt-4 border-t border-border text-[10px] text-muted-foreground text-center">
                    宇緯科技有限公司 · 統編 93659887
                </div>
            </div>

            {/* Preview Area */}
            <div className="flex-1 bg-muted/30 p-8 overflow-auto relative flex flex-col items-center">
                <div className="w-full max-w-[750px] z-10 flex-1 flex flex-col min-h-0">
                    {/* Header Bar */}
                    <div className="mb-6 flex justify-between items-center px-1">
                        <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-muted-foreground">預覽</span>
                        </div>
                        <div className="px-3 py-1 bg-red-100/50 text-red-700 text-[10px] font-bold uppercase tracking-wider rounded-md border border-red-200/50">
                            樣本
                        </div>
                    </div>

                    {/* Document Container */}
                    <div className="flex-1 flex justify-center pb-20">
                        {preview}
                    </div>
                </div>
            </div>
        </div>
    );
};
