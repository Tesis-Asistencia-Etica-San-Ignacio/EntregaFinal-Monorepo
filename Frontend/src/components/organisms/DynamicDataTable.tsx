import React from "react"
import { ColumnDef, FilterFn, VisibilityState } from "@tanstack/react-table"
import { DataTable } from "./Data-table"
import { Checkbox } from "@/components/atoms/ui/checkbox"
import { Badge } from "@/components/atoms/ui/badge"
import { DataTableRowActions } from "@/components/molecules/table/Data-table-row-actions"
import { DataTableColumnHeader } from "@/components/molecules/table/Data-table-column-header"
import { ColumnConfig } from "@/types/table"
import type { PaginationTableState } from "@/types/paginationType"

const STORAGE_KEY = "table_column_visibility"

/** Props del DynamicDataTable */
interface DynamicDataTableProps<TData extends object> {
    data: TData[]
    columnsConfig: ColumnConfig[]
    onRowClick?: (rowData: TData) => void
    selectedRowId?: string
    loading?: boolean
    paginationTableState?: PaginationTableState
}
/** 
 * Filtro local: filtra el valor de la celda según el filtro
 */
// components/organisms/DynamicDataTable.tsx  (o donde tengas tu localCellFilterFn)
function localCellFilterFn(row: any, columnId: string, filterValue: any) {
    if (!filterValue || (Array.isArray(filterValue) && filterValue.length === 0)) {
        return true
    }

    const rowValue = row.getValue(columnId)

    // normalizamos los valores del filtro a lowercase
    const filterValuesLower: string[] = Array.isArray(filterValue)
        ? filterValue.map((fv: any) => String(fv).toLowerCase())
        : []

    // si vienen múltiples opciones seleccionadas
    if (Array.isArray(filterValue)) {
        const rowValLower = String(rowValue ?? "").toLowerCase()
        return filterValuesLower.includes(rowValLower)
    }

    // caso de filtro único (substring search)
    const filterStr = String(filterValue).toLowerCase()
    const cell = rowValue
    if (Array.isArray(cell)) {
        return cell.some((item: any) =>
            String(item?.text ?? item ?? "")
                .toLowerCase()
                .includes(filterStr)
        )
    }
    return String(cell ?? "").toLowerCase().includes(filterStr)
}

/** 
 * Filtro global: recorre solo columnas marcadas "searchable" en la config.
 */
function createGlobalFilterFn(columnsConfigMap: Record<string, ColumnConfig>): FilterFn<any> {
    return (row, _colId, filterValue) => {
        if (!filterValue) return true
        const ft = String(filterValue).toLowerCase()
        for (const col of Object.values(columnsConfigMap)) {
            if (!col.searchable) continue
            const cell = row.getValue(col.id)
            if (Array.isArray(cell)) {
                if (cell.some(item => `${item?.text ?? ""} ${item?.label ?? ""}`.toLowerCase().includes(ft))) {
                    return true
                }
            } else if (String(cell ?? "").toLowerCase().includes(ft)) {
                return true
            }
        }
        return false
    }
}
/** Componente principal de la tabla dinámica */
export function DynamicDataTable<TData extends object>({
    data,
    columnsConfig,
    onRowClick,
    selectedRowId,
    loading = false,
    paginationTableState,
}: DynamicDataTableProps<TData>) {
    // 0) Cargar/guardar visibilidad
    const [columnVisibility] = React.useState<VisibilityState>(() => {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}")
        } catch {
            return {}
        }
    })
    React.useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(columnVisibility))
    }, [columnVisibility])

    // 1. Separa la columna "actions" (para que siempre quede al final)
    const actionsColumn = columnsConfig.find(c => c.type === "actions")
    const nonActionsCols = columnsConfig.filter(c => c.type !== "actions" && !c.hidden)

    // 2. "Adivina" columnas no definidas en la config
    const dataKeys = Object.keys(data[0] || {})
    const defined = nonActionsCols.map(c => c.accessorKey).filter(Boolean)
    // const missing = dataKeys.filter(k => !defined.includes(k))
    // FILTRAR las que NO quieras nunca ver:
    const missing = dataKeys.filter(
        k =>
            !defined.includes(k) &&
            // descartamos las que en config existan y tengan hidden
            !columnsConfig.some(c => c.id === k && c.hidden)
    )
    // 3. Construye ColumnDefs para las columnas definidas
    const mainDefs: ColumnDef<TData>[] = nonActionsCols.map(col => {
        if (col.type === "selection") {
            return {
                id: col.id,
                header: ({ table }) => (
                    <Checkbox
                        checked={
                            table.getIsAllPageRowsSelected() ||
                            (table.getIsSomePageRowsSelected() && "indeterminate")
                        }
                        onCheckedChange={v => table.toggleAllPageRowsSelected(!!v)}
                    />
                ),
                cell: ({ row }) => (
                    <Checkbox
                        checked={row.getIsSelected()}
                        onCheckedChange={v => row.toggleSelected(!!v)}
                    />
                ),
                enableSorting: false,
                enableHiding: false,
            }
        }
        // Columna normal: define accessor, header, filtro y cell
        const accessorKey = col.accessorKey || col.id
        return {
            id: col.id,
            accessorKey,
            items: col.items,
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={col.headerLabel || col.id} />
            ),
            filterFn: localCellFilterFn,
            cell: ({ row }) => {
                const value = row.getValue(accessorKey)
                // Render para badgeWithText
                if (col.renderType === "badgeWithText") {
                    if (Array.isArray(col.items)) {
                        const found = col.items.find(
                            it => it.value.toLowerCase() === String(value).toLowerCase()
                        )
                        if (found) {
                            const Icon = found.icon
                            const variant = found.badgeVariant || col.badgeVariant || "outline"
                            return (
                                <div className="flex items-center space-x-2">
                                    {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
                                    <Badge variant={variant as any}>{found.label}</Badge>
                                </div>
                            )
                        }
                    }
                    if (Array.isArray(value)) {
                        return (
                            <div className="flex space-x-2">
                                {value.map((item: any, i: number) => (
                                    <React.Fragment key={i}>
                                        {item[col.badgeKey || "label"] && (
                                            <Badge variant={col.badgeVariant as any}>
                                                {item[col.badgeKey || "label"]}
                                            </Badge>
                                        )}
                                        <span className="truncate">{item[col.textKey || "text"]}</span>
                                    </React.Fragment>
                                ))}
                            </div>
                        )
                    }
                    return <span>{String(value)}</span>
                }
                if (Array.isArray(col.items)) {
                    const found = col.items.find(
                        it => it.value.toLowerCase() === String(value).toLowerCase()
                    )
                    if (found) {
                        const Icon = found.icon
                        const variant = found.badgeVariant || col.badgeVariant || "outline"
                        return (
                            <div className="flex items-center space-x-2">
                                {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
                                <Badge variant={variant as any}>{found.label}</Badge>
                            </div>
                        )
                    }
                }
                return <span>{String(value)}</span>
            },
        }
    })

    // 4. Columnas adivinadas (para props no definidas)
    const guessDefs: ColumnDef<TData>[] = missing.map(k => ({
        id: k,
        accessorKey: k,
        header: ({ column }) => <DataTableColumnHeader column={column} title={k} />,
        filterFn: localCellFilterFn,
        cell: ({ row }) => <span>{String(row.getValue(k))}</span>,
    }))

    // 5. Columna de acciones, se pone al final
    let actionsDef: ColumnDef<TData> | undefined
    if (actionsColumn) {
        actionsDef = {
            id: actionsColumn.id,
            header: ({ column }) => <DataTableColumnHeader column={column} title="" />,
            cell: ({ row }) => (
                <DataTableRowActions
                    row={row}
                    actionItems={actionsColumn.actionItems || []}
                />
            ),
            enableSorting: false,
            enableHiding: false,
        }
    }

    // 6. Unir todas las columnas definidas y adivinadas
    const allDefs = [...mainDefs, ...guessDefs]
    if (actionsDef) allDefs.push(actionsDef)

    // 7. Crear diccionario de columnas para globalFilterFn
    const configMap: Record<string, ColumnConfig> = {}
    columnsConfig.forEach(cc => (configMap[cc.id] = cc))
    // 8. Crear globalFilterFn memorizado
    const globalFn = React.useMemo(() => createGlobalFilterFn(configMap), [configMap])

    return (
        <DataTable
            columns={allDefs}
            data={data}
            onRowClick={onRowClick}
            selectedRowId={selectedRowId}
            tableMeta={{ columnsConfigMap: configMap }}
            globalFilterFn={globalFn}
            loading={loading}
            paginationTableState={paginationTableState}
        />
    )
}
