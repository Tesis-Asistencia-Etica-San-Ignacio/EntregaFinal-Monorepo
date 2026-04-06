
import * as React from "react"
import { Column } from "@tanstack/react-table"
import { Check, PlusCircle } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "../../atoms/ui/badge"
import { Button } from "../../atoms/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "../../atoms/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../atoms/ui/popover"
import { Separator } from "../../atoms/ui/separator"

interface DataTableFacetedFilterProps<TData, TValue> {
  column: Column<TData, TValue>
  title?: string
  facetCounts?: Record<string, number>
  options: {
    label: string
    value: string
    icon?: React.ComponentType<{ className?: string }>
  }[]
}

export function DataTableFacetedFilter<TData, TValue>({
  column,
  title,
  facetCounts,
  options,
}: DataTableFacetedFilterProps<TData, TValue>) {
  const facets = column.getFacetedUniqueValues()
  const selectedValues = new Set(column.getFilterValue() as string[])

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 border-dashed">
          <PlusCircle />
          {title}
          {selectedValues.size > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge variant="secondary" className="rounded-sm px-1 font-normal lg:hidden">
                {selectedValues.size}
              </Badge>
              <div className="hidden space-x-1 lg:flex">
                {selectedValues.size > 2 ? (
                  <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                    {selectedValues.size} seleccionados
                  </Badge>
                ) : (
                  options
                    .filter((option) => selectedValues.has(option.value))
                    .map((option) => (
                      <Badge
                        variant="secondary"
                        key={option.value}
                        className="rounded-sm px-1 font-normal"
                      >
                        {option.label}
                      </Badge>
                    ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder={title} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selectedValues.has(option.value)
                const optionCount = facetCounts?.[option.value] ?? facets.get(option.value) ?? 0
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => {
                      if (isSelected) {
                        selectedValues.delete(option.value)
                      } else {
                        selectedValues.add(option.value)
                      }
                      const filterValues = Array.from(selectedValues)
                      column.setFilterValue(filterValues.length ? filterValues : undefined)
                    }}
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-[var(--sidebar-primary)] transition-colors",
                        isSelected
                          ? "bg-[var(--sidebar-primary)] text-[var(--sidebar-primary-foreground)]"
                          : "bg-[var(--selected-item-table)] text-[var(--sidebar-primary)] [&_svg]:invisible"
                      )}
                    >
                      <Check className={cn("h-4 w-4", isSelected && "text-white")} />
                    </div>
                    {option.icon && (
                      <option.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                    )}
                    <span>{option.label}</span>
                    {typeof optionCount === "number" && (
                      <span className="ml-auto flex h-4 w-4 items-center justify-center font-mono text-xs">
                        {optionCount}
                      </span>
                    )}
                  </CommandItem>
                )
              })}
            </CommandGroup>

            {selectedValues.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => column.setFilterValue(undefined)}
                    className="justify-center text-center"
                  >
                    Borrar filtros
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
