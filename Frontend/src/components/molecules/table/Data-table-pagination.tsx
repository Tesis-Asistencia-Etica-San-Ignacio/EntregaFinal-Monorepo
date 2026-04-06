import { Table } from "@tanstack/react-table"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"

import { Button } from "../../atoms/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../atoms/ui/select"
import type { PaginationTableState } from "@/types/paginationType"

interface DataTablePaginationProps<TData> {
  table: Table<TData>
  paginationTableState?: PaginationTableState
}

export function DataTablePagination<TData>({
  table,
  paginationTableState,
}: DataTablePaginationProps<TData>) {
  const pageSize = paginationTableState?.pageSize ?? table.getState().pagination.pageSize
  const currentPage = paginationTableState?.page ?? table.getState().pagination.pageIndex + 1
  const pageCount = paginationTableState?.totalPages ?? table.getPageCount()
  const totalItems = paginationTableState?.totalItems ?? table.getFilteredRowModel().rows.length
  const canPreviousPage = paginationTableState ? paginationTableState.page > 1 : table.getCanPreviousPage()
  const canNextPage = paginationTableState
    ? paginationTableState.page < paginationTableState.totalPages
    : table.getCanNextPage()

  return (
    <div className="flex items-center justify-between px-2" style={{ overflowClipMargin: 1 }}>
      <div className="hidden flex-1 text-sm text-muted-foreground sm:block">
        {table.getFilteredSelectedRowModel().rows.length} de{" "}
        {totalItems} fila(s) seleccionada(s).
      </div>
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="hidden text-sm font-medium sm:block">Filas por página</p>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => {
              if (paginationTableState) {
                paginationTableState.onPageSizeChange(Number(value))
                return
              }
              table.setPageSize(Number(value))
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50].map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          Página {currentPage} de {pageCount}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => {
              if (paginationTableState) {
                paginationTableState.onPageChange(1)
                return
              }
              table.setPageIndex(0)
            }}
            disabled={!canPreviousPage}
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => {
              if (paginationTableState) {
                paginationTableState.onPageChange(paginationTableState.page - 1)
                return
              }
              table.previousPage()
            }}
            disabled={!canPreviousPage}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => {
              if (paginationTableState) {
                paginationTableState.onPageChange(paginationTableState.page + 1)
                return
              }
              table.nextPage()
            }}
            disabled={!canNextPage}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => {
              if (paginationTableState) {
                paginationTableState.onPageChange(paginationTableState.totalPages)
                return
              }
              table.setPageIndex(table.getPageCount() - 1)
            }}
            disabled={!canNextPage}
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRight />
          </Button>
        </div>
      </div>
    </div>
  )
}
