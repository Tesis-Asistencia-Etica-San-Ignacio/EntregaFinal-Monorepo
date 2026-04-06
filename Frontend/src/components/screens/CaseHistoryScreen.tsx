import { useState, useMemo } from "react";
import type { ColumnFiltersState, SortingState } from "@tanstack/react-table";
import type { ColumnConfig } from "@/types/table";
import useGetCasesByUserHook from "@/hooks/cases/useGetCasesByUser";
import useDeleteCases from "@/hooks/cases/useDeleteCases";
import ModalForm from "@/components/organisms/dialogs/ModalForm";
import PdfRenderer from "@/components/organisms/PdfRenderer";
import HistoryTemplate from "../templates/HistoryTemplate";
import useFetchCasePdf from "@/hooks/pdf/useFetchCasesPdf";

export default function CaseHistoryScreen() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const remoteFilters = useMemo<Record<string, string[]>>(
    () =>
      columnFilters.reduce<Record<string, string[]>>((acc, filter) => {
        if (Array.isArray(filter.value) && filter.value.length > 0) {
          acc[filter.id] = filter.value.map((value) => String(value));
        }
        return acc;
      }, {}),
    [columnFilters]
  );
  const currentSort = sorting[0];

  const { files, pagination, isLoading } = useGetCasesByUserHook({
    page,
    pageSize,
    search,
    filters: remoteFilters,
    sortBy: currentSort?.id,
    sortOrder: currentSort ? (currentSort.desc ? "desc" : "asc") : undefined,
  });
  const { deleteCase } = useDeleteCases();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [confirmValue, setConfirmValue] = useState("");
  const [toDeleteId, setToDeleteId] = useState<string>("");
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const { pdfUrl, fetchCasePdf, loading: pdfLoading } = useFetchCasePdf();

  const tableData = useMemo(
    () =>
      files.map((f: any) => ({
        id: f.id,
        nombre_proyecto: f.nombre_proyecto,
        version: f.version,
        pdf: f.pdf,
        codigo: f.codigo,
        createdAt: new Date(f.createdAt).toISOString().split("T")[0],
        updatedAt: new Date(f.updatedAt).toISOString().split("T")[0],
      })),
    [files]
  );

  const handleViewPdf = async (row: any) => {
    const parts = (row.pdf as string).split("/");
    const filename = parts[parts.length - 1];
    await fetchCasePdf(filename);
    setPdfModalOpen(true);
  };

  const handleDelete = (row: any) => {
    setToDeleteId(row.id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    await deleteCase(toDeleteId);
    setDeleteDialogOpen(false);
    setConfirmValue("");
  };

  const columnsConfig: ColumnConfig[] = [
    { id: "id", accessorKey: "id", headerLabel: "ID", searchable: false, hidden: true },
    { id: "pdf", accessorKey: "pdf", headerLabel: "pdf", searchable: false, hidden: true },
    { id: "nombre_proyecto", accessorKey: "nombre_proyecto", headerLabel: "Nombre Proyecto", searchable: true },
    { id: "version", accessorKey: "version", headerLabel: "Versión", searchable: true },
    { id: "codigo", accessorKey: "codigo", headerLabel: "Código", searchable: true },
    { id: "createdAt", accessorKey: "createdAt", headerLabel: "Creado" },
    { id: "updatedAt", accessorKey: "updatedAt", headerLabel: "Actualizado" },
    {
      id: "actions",
      type: "actions",
      actionItems: [
        { label: "Eliminar", onClick: handleDelete },
        { label: "Ver PDF", onClick: handleViewPdf },
      ],
    },
  ];

  return (
    <HistoryTemplate
      data={tableData}
      columnsConfig={columnsConfig}
      tableLoading={isLoading}
      paginationTableState={{
        page,
        pageSize,
        totalItems: pagination?.totalItems ?? 0,
        totalPages: pagination?.totalPages ?? 1,
        search,
        columnFilters,
        sorting,
        onPageChange: setPage,
        onPageSizeChange: (nextPageSize) => {
          setPageSize(nextPageSize);
          setPage(1);
        },
        onSearchChange: (nextSearch) => {
          setSearch(nextSearch);
          setPage(1);
        },
        onColumnFiltersChange: (nextFilters) => {
          setColumnFilters(nextFilters);
          setPage(1);
        },
        onSortingChange: (nextSorting) => {
          setSorting(nextSorting);
          setPage(1);
        },
      }}
      deleteDialogOpen={deleteDialogOpen}
      onDeleteDialogChange={setDeleteDialogOpen}
      onConfirmDelete={handleConfirmDelete}
      confirmValue={confirmValue}
      onConfirmValueChange={setConfirmValue}
      extraModal={
        <ModalForm
          open={pdfModalOpen}
          onOpenChange={open => {
            setPdfModalOpen(open);
            if (!open) URL.revokeObjectURL(pdfUrl);
          }}
          title={{ text: "Ver Consentimiento Informado", align: "left" }}
          formDataConfig={[
            [
              {
                type: "custom",
                key: "pdfPreview",
                placeholder: "Vista previa",
                component: <PdfRenderer url={pdfUrl} externalLoading={pdfLoading} />,
                required: false,
              },
            ],
          ]}
          onSubmit={() => setPdfModalOpen(false)}
          submitButtonText="Cerrar"
          width="70%"
          height="90%"
        />
      }
    />
  );
}
