import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ColumnFiltersState, SortingState } from '@tanstack/react-table';
import HistoryTemplate from '../templates/HistoryTemplate';
import useGetEvaluationsByUserHook from '@/hooks/evaluation/useGetEvaluationByUser';
import useDeleteEvaluationHook from '@/hooks/evaluation/useDeleteEvaluation';
import useUpdateEvaluationHook from '@/hooks/evaluation/useUpdateEvaluation';
import type { ColumnConfig } from '@/types/table';
import type { FormField } from '@/types/formTypes';
import { CheckCircle, Circle } from 'lucide-react';
import { useAuthContext } from "@/context/AuthContext";
import useFetchCasePdf from "@/hooks/pdf/useFetchCasesPdf";
import ModalForm from "@/components/organisms/dialogs/ModalForm";
import PdfRenderer from "@/components/organisms/PdfRenderer";

export default function EvaluationHistoryScreen() {
  const { user } = useAuthContext();
  const iaReady = !!(user?.provider && user?.modelo);
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
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

  const { files, pagination, isLoading } = useGetEvaluationsByUserHook({
    page,
    pageSize,
    search,
    filters: remoteFilters,
    sortBy: currentSort?.id,
    sortOrder: currentSort ? (currentSort.desc ? 'desc' : 'asc') : undefined,
  });
  const { deleteEvaluation } = useDeleteEvaluationHook();
  const { updateEvaluation } = useUpdateEvaluationHook();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [confirmValue, setConfirmValue] = useState('');
  const [toDeleteId, setToDeleteId] = useState<string>('');
  const [selectedRow, setSelectedRow] = useState<any | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const { pdfUrl, fetchCasePdf, loading: pdfLoading } = useFetchCasePdf();

  const tableData = useMemo(
    () =>
      files.map((f: any) => ({
        id: f.id,
        id_fundanet: f.id_fundanet,
        version: f.version,
        correo_estudiante: f.correo_estudiante,
        file: f.file.split('uploads/')[1],
        tipo_error: f.tipo_error,
        aprobado: f.aprobado ? 'approved' : 'notapproved',
        estado: f.estado,
        createdAt: new Date(f.createdAt).toISOString().split('T')[0],
        updatedAt: new Date(f.updatedAt).toISOString().split('T')[0],
      })),
    [files]
  );

  const handleRowClick = (row: any) => {
    setSelectedRow(row);
  };

  const handleEdit = (row: any) => {
    setSelectedRow(row);
    setEditModalOpen(true);
  };

  const buildBreadcrumbLabel = (row: any) => {
    if (row.id_fundanet && row.id_fundanet !== 'Información de fundanet') {
      return `${row.id} (${row.id_fundanet} - v${row.version})`;
    }

    return `${row.id} (${row.file})`;
  };

  const handleVerMas = (row: any) => {
    navigate(`/evaluacion/${row.id}`, {
      state: {
        runGenerate: row.estado === 'PENDIENTE',
        breadcrumbLabel: buildBreadcrumbLabel(row),
      },
    });
  };

  const handleReEvaluate = (row: any) => {
    navigate(`/evaluacion/${row.id}`, {
      state: {
        runReEvaluate: true,
        breadcrumbLabel: buildBreadcrumbLabel(row),
      },
    });
  };

  const handleViewPdf = async (row: any) => {
    const filename = row.file as string;
    await fetchCasePdf(filename);
    setPdfModalOpen(true);
  };

  const handleDelete = (row: any) => {
    setToDeleteId(row.id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async (): Promise<void> => {
    await deleteEvaluation(toDeleteId);
    setDeleteDialogOpen(false);
    setConfirmValue('');
  };

  const handleEditSubmit = (data: any) => {
    if (!selectedRow) return;
    const params = {
      correo_estudiante: data.correo_estudiante,
      tipo_error: data.tipo_error,
      aprobado: data.aprobado === 'true',
      estado: data.estado,
      id_fundanet: data.id_fundanet,
    };
    updateEvaluation(selectedRow.id, params);
    setEditModalOpen(false);
  };

  const editInitialData = selectedRow
    ? {
        id_fundanet: selectedRow.id_fundanet ?? '',
        correo_estudiante: selectedRow.correo_estudiante ?? '',
        tipo_error: selectedRow.tipo_error ?? '',
        aprobado: selectedRow.aprobado === 'approved' ? 'true' : 'false',
        estado: selectedRow.estado ?? '',
      }
    : {};

  const editModalFields: FormField[][] = [
    [{ type: 'document', key: 'id_fundanet', placeholder: 'ID del documento en FundaNet' }],
    [{ type: 'email', key: 'correo_estudiante', placeholder: 'Correo del estudiante' }],
    [{ type: 'textarea', key: 'tipo_error', placeholder: 'Tipo de error', autoAdjust: true }],
    [
      {
        type: 'select',
        key: 'aprobado',
        placeholder: 'Resultado de la evaluación',
        selectPlaceholder: 'Seleccione un resultado',
        options: [
          { value: 'true', label: 'Aprobado' },
          { value: 'false', label: 'Rechazado' },
        ],
      },
    ],
    [
      {
        type: 'select',
        key: 'estado',
        placeholder: 'Estado del archivo',
        selectPlaceholder: 'Seleccione un estado',
        options: [
          { value: 'PENDIENTE', label: 'Pendiente' },
          { value: 'EN CURSO', label: 'En curso' },
          { value: 'EVALUADO', label: 'Evaluado' },
        ],
      },
    ],
  ];

  const columnsConfig: ColumnConfig[] = [
    { id: 'id', accessorKey: 'id', headerLabel: 'ID', searchable: true },
    { id: 'id_fundanet', accessorKey: 'id_fundanet', headerLabel: 'ID FundaNet', searchable: true },
    { id: 'version', accessorKey: 'version', headerLabel: 'Version', searchable: true },
    {
      id: 'correo_estudiante',
      accessorKey: 'correo_estudiante',
      headerLabel: 'Correo Estudiante',
      searchable: true,
    },
    { id: 'file', accessorKey: 'file', headerLabel: 'Archivo', searchable: true },
    { id: 'tipo_error', accessorKey: 'tipo_error', headerLabel: 'Tipo de error' },
    {
      id: 'aprobado',
      accessorKey: 'aprobado',
      headerLabel: 'Aprobado',
      items: [
        { value: 'approved', label: 'Aprobado', icon: CheckCircle, badgeVariant: 'approved' },
        { value: 'notapproved', label: 'No aprobado', icon: Circle, badgeVariant: 'notapproved' },
      ],
    },
    {
      id: 'estado',
      accessorKey: 'estado',
      headerLabel: 'Estado',
      items: [
        { value: 'PENDIENTE', label: 'Pendiente' },
        { value: 'EN CURSO', label: 'En curso' },
        { value: 'EVALUADO', label: 'Evaluado' },
      ],
    },
    { id: 'createdAt', accessorKey: 'createdAt', headerLabel: 'Creado' },
    { id: 'updatedAt', accessorKey: 'updatedAt', headerLabel: 'Actualizado' },
    {
      id: 'actions',
      type: 'actions',
      actionItems: [
        { label: 'Editar', onClick: handleEdit },
        {
          label: 'Evaluar',
          onClick: handleVerMas,
          visible: row => !['EVALUADO', 'EN CURSO'].includes(row.estado),
          disabled: !iaReady,
          tooltip: "Configura proveedor y modelo en Ajustes → IA",
        },
        {
          label: 'Ver detalles',
          onClick: handleVerMas,
          visible: row => ['EVALUADO', 'EN CURSO'].includes(row.estado),
        },
        {
          label: 'Reevaluar',
          onClick: handleReEvaluate,
          visible: r => ['EVALUADO', 'EN CURSO'].includes(r.estado),
          disabled: !iaReady,
          tooltip: "Configura proveedor y modelo en Ajustes → IA",
        },
        { label: 'Ver PDF', onClick: handleViewPdf },
        { label: 'Eliminar', onClick: handleDelete },
      ],
    },
  ];

  return (
    <HistoryTemplate
      data={tableData}
      columnsConfig={columnsConfig}
      onRowClick={handleRowClick}
      selectedRowId={selectedRow?.id}
      tableLoading={isLoading}
      paginationTableState={{
        page,
        pageSize,
        totalItems: pagination?.totalItems ?? 0,
        totalPages: pagination?.totalPages ?? 1,
        facetCounts: pagination?.facets,
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
      open={editModalOpen}
      onOpenChange={open => {
        setEditModalOpen(open);
        if (!open) setSelectedRow(null);
      }}
      modalFormFields={editModalFields}
      onModalSubmit={handleEditSubmit}
      DataSelectedRow={editInitialData}
      extraModal={
        <ModalForm
          open={pdfModalOpen}
          onOpenChange={open => {
            setPdfModalOpen(open);
            if (!open) URL.revokeObjectURL(pdfUrl);
          }}
          title={{ text: "Ver Evaluación", align: "left" }}
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
