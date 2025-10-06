import * as React from 'react';
import { cn } from "@/lib/utils"; // shadcn/uiのユーティリティ

interface PrintableReportFrameProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const PrintableFrame = React.forwardRef<HTMLDivElement, PrintableReportFrameProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          // 画面上でのA4サイズ指定とスタイリング
          "printable-area mx-auto my-8 bg-white w-[210mm] h-[297mm] p-8 shadow-lg border",
          // ユーザーが指定したクラスをマージ
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

PrintableFrame.displayName = 'PrintableFrame';

export { PrintableFrame };