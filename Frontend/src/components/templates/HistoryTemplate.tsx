import { ColumnConfig } from "@/types/table";
import { DynamicDataTable } from "../organisms/DynamicDataTable";
import ConfirmDialog from "@/components/organisms/dialogs/ConfirmDialog";
import { TriangleAlert } from "lucide-react";
import { Label } from "@/components/atoms/ui/label";
import { Input } from "@/components/atoms/ui/input";
import { Alert, AlertTitle, AlertDescription } from "@/components/atoms/ui/alert";
import type { FormField } from "@/types/formTypes";
import ModalForm from "../organisms/dialogs/ModalForm";
import { ReactNode } from "react";
import type { PaginationTableState } from "@/types/paginationType";

interface HistoryTemplateProps {
  /* ---------- Tabla ---------- */
  data: any[];
  columnsConfig: ColumnConfig[];
  selectedRowId?: string;
  onRowClick?: (row: any) => void;
  tableLoading?: boolean;
  paginationTableState?: PaginationTableState;

  /* -------- Eliminación ------ */
  deleteDialogOpen: boolean;
  onDeleteDialogChange: (open: boolean) => void;
  onConfirmDelete: () => Promise<void>;
  confirmValue: string;
  onConfirmValueChange: (val: string) => void;

  /* --------- Edición --------- */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  modalFormFields?: FormField[][];
  onModalSubmit?: (data: any) => Promise<void> | void;
  DataSelectedRow?: { [key: string]: any };

  /*-----PDF-----*/
  extraModal?: ReactNode;

}

export default function HistoryTemplate({
  /* ---------- Tabla ---------- */
  data,
  columnsConfig,
  selectedRowId,
  onRowClick,
  tableLoading = false,
  paginationTableState,

  /* -------- Eliminación ------ */
  deleteDialogOpen,
  onDeleteDialogChange,
  onConfirmDelete,
  confirmValue,
  onConfirmValueChange,

  /* --------- Edición --------- */
  open,
  onOpenChange,
  modalFormFields,
  onModalSubmit,

  /*-----PDF-----*/
  extraModal,

  DataSelectedRow,
}: Readonly<HistoryTemplateProps>) {
  return (

    <section className="pb-8 space-y-4">
      {/* Tabla */}
      <div className="mb-4 flex flex-col">
        <h2 className="text-2xl font-bold tracking-tight">Historial de Archivos</h2>
        <p className="text-muted-foreground">
          Aquí está una lista de todos los archivos
        </p>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-3">
          <DynamicDataTable
            data={data}
            columnsConfig={columnsConfig}
            selectedRowId={selectedRowId}
            onRowClick={onRowClick}
            loading={tableLoading}
            paginationTableState={paginationTableState}
          />
        </div>
      </div>

      {/* -------- Eliminación ------ */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={onDeleteDialogChange}
        handleConfirm={async () => {
          await onConfirmDelete();
          onDeleteDialogChange(false);
        }}
        disabled={confirmValue.trim() !== "ELIMINAR"}
        destructive
        title={
          <span className="text-destructive flex items-center space-x-1">
            <TriangleAlert size={18} className="inline-block mr-1" />
            Eliminar Evaluación
          </span>
        }
        description={
          <div className="space-y-4">
            <p>
              Para confirmar, escribe <code>ELIMINAR</code>:
            </p>
            <Label>
              <Input
                value={confirmValue}
                onChange={e => onConfirmValueChange(e.target.value)}
                placeholder="ELIMINAR"
              />
            </Label>
            <Alert variant="destructive">
              <AlertTitle>¡Atención!</AlertTitle>
              <AlertDescription>Esta acción no se puede deshacer.</AlertDescription>
            </Alert>
          </div>
        }
        confirmText="ELIMINAR"
      />

      {/* --------- Edición --------- */}
      {modalFormFields && onModalSubmit && (
        <ModalForm
          open={open ?? false}
          onOpenChange={onOpenChange ?? (() => {})}
          title={{ text: "Editar evaluación" + " - " + DataSelectedRow?.id_fundanet, align: "left" }}
          formDataConfig={modalFormFields}
          onSubmit={onModalSubmit}
          submitButtonText="Guardar cambios"
          width="40%"
          height="64%"

          initialData={DataSelectedRow}
        />
      )}

      {extraModal}
    </section>
  );
}
