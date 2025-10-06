import {
  type Table as TanstackTable, // 型名が重複するためエイリアスを付けます
  flexRender,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { twMerge } from "tailwind-merge"

// Props の型定義を修正
interface DataTableProps<TData> {
  table: TanstackTable<TData> // tableインスタンスを直接受け取る
  getCellClassName?: (data: TData) => string
}

export function DataTable<TData>({
  table,
  getCellClassName: getCellClassName = () => "",
}: DataTableProps<TData>) {
  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="">
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}
                    className="border-r text-center last:border-r-0 bg-gray-300"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className={cn("odd:bg-blue-100/30")}

              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}
                    className={twMerge("border-r text-center last:border-r-0", getCellClassName(row.original))}
                  >
                    <span >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </span>
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                // カラム数を table インスタンスから取得
                colSpan={table.getAllColumns().length}
                className="h-24 text-center"
              >
                結果0件
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
