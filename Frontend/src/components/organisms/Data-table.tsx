import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  functionalUpdate,
  PaginationState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  useReactTable,
  TableOptions,
  FilterFn,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../atoms/ui/table"

import { DataTablePagination } from "../molecules/table/Data-table-pagination"
import { DataTableToolbar } from "../molecules/table/Data-table-toolbar"
import { Spinner } from "../atoms/spinner"
import type { PaginationTableState } from "@/types/paginationType"

const STORAGE_KEY = "table_column_visibility"

/**
 * Props de la tabla.
 * columns: definición de columnas.
 * data: arreglo de filas.
 * tableMeta, globalFilterFn: props opcionales para personalizar.
 * onRowClick: callback cuando se hace click en una fila.
 * selectedRowId: (opcional) id de la fila seleccionada.
 */
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  tableMeta?: TableOptions<TData>["meta"]
  globalFilterFn?: FilterFn<TData>
  onRowClick?: (rowData: TData) => void
  selectedRowId?: string

  loading?: boolean
  /** Si quieres algo distinto al spinner por defecto. */
  loadingContent?: React.ReactNode
  paginationTableState?: PaginationTableState
}

export function DataTable<TData, TValue>({
  columns,
  data,
  tableMeta,
  globalFilterFn,
  onRowClick,
  loading = false,
  loadingContent,
  paginationTableState,
}: DataTableProps<TData, TValue>) {
  // 1) Estados internos para la tabla.
  const [rowSelection, setRowSelection] = React.useState({})
  const [clientColumnFilters, setClientColumnFilters] = React.useState<ColumnFiltersState>([])
  const [clientSorting, setClientSorting] = React.useState<SortingState>([])
  const [clientGlobalFilter, setClientGlobalFilter] = React.useState("")
  const [clientPagination, setClientPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  const columnFilters = paginationTableState?.columnFilters ?? clientColumnFilters
  const sorting = paginationTableState?.sorting ?? clientSorting
  const globalFilter = paginationTableState?.search ?? clientGlobalFilter
  const pagination = React.useMemo<PaginationState>(
    () => ({
      pageIndex: paginationTableState ? paginationTableState.page - 1 : clientPagination.pageIndex,
      pageSize: paginationTableState ? paginationTableState.pageSize : clientPagination.pageSize,
    }),
    [clientPagination.pageIndex, clientPagination.pageSize, paginationTableState]
  )

  const handleColumnFiltersChange = React.useCallback(
    (updater: React.SetStateAction<ColumnFiltersState>) => {
      if (paginationTableState?.onColumnFiltersChange) {
        const nextValue = functionalUpdate(updater, columnFilters)
        paginationTableState.onColumnFiltersChange(nextValue)
        return
      }

      setClientColumnFilters(updater)
    },
    [columnFilters, paginationTableState]
  )

  const handleSortingChange = React.useCallback(
    (updater: React.SetStateAction<SortingState>) => {
      if (paginationTableState?.onSortingChange) {
        const nextValue = functionalUpdate(updater, sorting)
        paginationTableState.onSortingChange(nextValue)
        return
      }

      setClientSorting(updater)
    },
    [paginationTableState, sorting]
  )

  const handleGlobalFilterChange = React.useCallback(
    (updater: React.SetStateAction<string>) => {
      const nextValue = typeof updater === "function" ? updater(globalFilter) : updater

      if (paginationTableState?.onSearchChange) {
        paginationTableState.onSearchChange(nextValue)
        return
      }

      setClientGlobalFilter(nextValue)
    },
    [globalFilter, paginationTableState]
  )

  // 2) Persistencia de visibilidad
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : {}
    } catch {
      return {}
    }
  })
  React.useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(columnVisibility))
  }, [columnVisibility])

  // 3) Crear la instancia de la tabla con useReactTable.
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      globalFilter,
      pagination,
    },
    onRowSelectionChange: setRowSelection,
    onSortingChange: handleSortingChange,
    onColumnFiltersChange: handleColumnFiltersChange,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: handleGlobalFilterChange,
    onPaginationChange: paginationTableState ? undefined : setClientPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: paginationTableState ? undefined : getFilteredRowModel(),
    getPaginationRowModel: paginationTableState ? undefined : getPaginationRowModel(),
    getSortedRowModel: paginationTableState ? undefined : getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    enableRowSelection: true,
    globalFilterFn: globalFilterFn,
    meta: {
      ...(tableMeta ?? {}),
      facetCounts: paginationTableState?.facetCounts,
    },
    autoResetPageIndex: false,
    manualPagination: !!paginationTableState,
    manualFiltering: !!paginationTableState,
    manualSorting: !!paginationTableState,
    pageCount: paginationTableState ? paginationTableState.totalPages : undefined,
  })

  // 4) Verificar si existe la columna "select".
  const hasSelectionColumn = columns.some(col => col.id === "select")

  // 5) Render: Toolbar, tabla y paginación.
  return (
    <div className="space-y-4">
      <DataTableToolbar table={table} />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {loading ? (
              /* fila de carga */
              <TableRow>
                <TableCell colSpan={columns.length} className="h-60 text-center">
                  {loadingContent ?? <Spinner size="md" variant="primary" />}
                  Estamos evaluando los documentos. Esto puede tardar unos segundos...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length ? (
              /* filas normales */
              table.getRowModel().rows.map(row => {
                const isSelected = row.getIsSelected()
                return (
                  <TableRow
                    key={row.id}
                    onClick={() => {
                      if (hasSelectionColumn) {
                        row.toggleSelected(!isSelected)
                      } else {
                        table.setRowSelection({ [row.id]: true })
                      }
                      onRowClick?.(row.original)
                    }}
                    className={`cursor-pointer transition-colors duration-200 hover:bg-muted ${isSelected ? "bg-blue-50" : ""
                      }`}
                    data-state={isSelected && "selected"}
                  >
                    {row.getVisibleCells().map(cell => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-60 text-center">
                  No se encontraron resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {/* paginación */}
      <DataTablePagination table={table} paginationTableState={paginationTableState} />
    </div>
  )
}
