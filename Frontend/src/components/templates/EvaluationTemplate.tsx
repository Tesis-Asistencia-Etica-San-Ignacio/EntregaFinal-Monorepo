import { DynamicDataTable } from "../organisms/DynamicDataTable";
import EthicalEvaluationBox from "../organisms/EthicalEvaluationBox";
import type { ColumnConfig } from "@/types/table";
import type { FormField } from "@/types/formTypes";
import ModalForm from "../organisms/dialogs/ModalForm";

interface EvaluationResultTemplateProps {
  // Tabla
  readonly data: any[];
  readonly columnsConfig: ColumnConfig[];
  onRowClick?: (row: any) => void;
  DataSelectedRow?: { [key: string]: any };
  tableLoading?: boolean;


  //Modal CORREO
  modalFormFields: FormField[][];
  onModalSubmit?: (data: any) => Promise<void> | void;
  readonly modalOpen: boolean;
  readonly onMailModalOpenChange: (open: boolean) => void;

  //EDITAR
  editModalFormFields: FormField[][];
  onEditModalSubmit?: (data: any) => Promise<void> | void;
  editModalOpen: boolean;
  onEditModalOpenChange: (open: boolean) => void;
  editInitialData?: { [key: string]: any };
}

export default function EvaluationResultTemplate({

  // Tabla
  data,
  columnsConfig,
  onRowClick,
  DataSelectedRow,
  tableLoading = false,
  // CORREO
  modalFormFields,
  onModalSubmit,
  modalOpen,
  onMailModalOpenChange,
  // EDITAR
  editModalFormFields,
  onEditModalSubmit,
  editModalOpen,
  onEditModalOpenChange,
  editInitialData

}: Readonly<EvaluationResultTemplateProps>) {

  return (
    <section className="pb-16">
      <div className="mb-4 flex flex-col">
        <h2 className="text-2xl font-bold tracking-tight">Resultado de la evaluación</h2>
        <p className="text-muted-foreground">
          Aquí está una lista de todas las normas éticas evaluadas previamente
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 h-full xl:grid-cols-3">
        <div className="relative xl:col-span-2">
          <DynamicDataTable
            data={data}
            columnsConfig={columnsConfig}
            selectedRowId={DataSelectedRow?.id}
            onRowClick={onRowClick}
            loading={tableLoading}
          />
        </div>
        <EthicalEvaluationBox
          open={modalOpen}
          onOpenChange={onMailModalOpenChange}
          selectedTask={DataSelectedRow || null}
          modalFormFields={modalFormFields}
          onModalSubmit={onModalSubmit}
        />
      </div>
      {modalFormFields && onEditModalSubmit && (
        <ModalForm
          open={editModalOpen}
          onOpenChange={onEditModalOpenChange}
          title={{ text: "Editar norma ética" + " - " + DataSelectedRow?.codeNumber, align: "left" }}
          formDataConfig={editModalFormFields}
          onSubmit={onEditModalSubmit}
          submitButtonText="Guardar cambios"
          width="40%"
          height="60%"
          initialData={editInitialData}
        />
      )}
    </section>
  );
}
