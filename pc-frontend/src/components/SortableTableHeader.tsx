import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { type Column } from "@tanstack/react-table"
import { cn } from "@/lib/utils" // shadcn/uiのユーティリティ関数

type SortableTableHeaderProps<TData, TValue> = {
  column: Column<TData, TValue>
  children: React.ReactNode
  className?: string
}

export function SortableTableHeader<TData, TValue>({
  column,
  children,
  className,
}: SortableTableHeaderProps<TData, TValue>) {
  // ソート状態に応じて表示するアイコンを決定
  const renderSortIcon = () => {
    const sortDirection = column.getIsSorted()
    if (sortDirection === "asc") {
      return <ArrowUp className="ml-2 h-4 w-4" />
    }
    if (sortDirection === "desc") {
      return <ArrowDown className="ml-2 h-4 w-4" />
    }
    // 未ソート時は、ソート可能であることを示す薄いアイコンを表示
    return <ArrowUpDown className="ml-2 h-4 w-4 opacity-30" />
  }

  return (
    // Buttonの代わりにdivを使用し、クリックイベントを設定
    // これにより、背景色なしでヘッダーセル全体がクリック可能になる
    <div
      className={cn("flex cursor-pointer items-center select-none py-4 justify-center text-accent-foreground", className)}
      onClick={column.getToggleSortingHandler()}
    >
      {children}
      {renderSortIcon()}
    </div>
  )
}