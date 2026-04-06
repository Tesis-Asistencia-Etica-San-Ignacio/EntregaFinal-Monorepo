import { Table } from "@tanstack/react-table"
import { X } from "lucide-react"
import { Button } from "../../atoms/ui/button"
import { Input } from "../../atoms/ui/input-form"
import { DataTableViewOptions } from "./Data-table-view-options"
import { DataTableFacetedFilter } from "./Data-table-faceted-filter"
import type { ColumnConfig } from "@/types/table"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
}

export function DataTableToolbar<TData>({ table }: DataTableToolbarProps<TData>) {
  const isFiltered =
    table.getState().columnFilters.length > 0 ||
    !!table.getState().globalFilter

  const globalFilterValue = table.getState().globalFilter

  const configMap = (table.options.meta as any)?.columnsConfigMap as Record<string, ColumnConfig>
  const facetCounts = (table.options.meta as any)?.facetCounts as
    | Record<string, Record<string, number>>
    | undefined

  const facetedColumns = table
    .getAllLeafColumns()
    .filter((col) => Array.isArray((col.columnDef as any).items))

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2">
        {/* Input => globalFilter */}
        <Input
          placeholder="Buscar..."
          value={String(globalFilterValue || "")}
          onChange={(e) => table.setGlobalFilter(e.target.value)}
          className="h-8 w-[150px] lg:w-[250px]"
        />

        <div className="flex gap-x-2">
          {facetedColumns.map((col) => {
            const items = (col.columnDef as any).items as { value: string; label: string }[]
            // Tomamos el headerLabel de la config (o col.id si no existe)
            const title = configMap?.[col.id]?.headerLabel ?? col.id
            return (
              <DataTableFacetedFilter
                key={col.id}
                column={col}
                title={title}
                options={items}
                facetCounts={facetCounts?.[col.id]}
              />
            )
          })}
        </div>

        {/* Botón reset si hay algo filtrado */}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => {
              table.resetGlobalFilter()
              table.resetColumnFilters()
            }}
            className="h-8 px-2 lg:px-3"
          >
            Borrar filtros
            <X className="ml-1" />
          </Button>
        )}
      </div>

      {/* Opcional: view options */}
      <DataTableViewOptions table={table} />
    </div>
  )
}
