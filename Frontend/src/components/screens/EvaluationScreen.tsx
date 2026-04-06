import { useEffect, useRef, useMemo, useState } from 'react'
import { useLocation, useParams } from "react-router-dom"
import EvaluationResultTemplate from "../templates/EvaluationTemplate"
import { CheckCircle, Circle, CircleDashed } from "lucide-react"
import type { ColumnConfig } from "@/types/table"
import type { FormField } from "@/types/formTypes"
import PdfRenderer from "../organisms/PdfRenderer"
import { useSendEmail } from "@/hooks/mails/useSendEmail"
import useGetEthicalRulesByEvaluationIdHook from "@/hooks/ethicalRules/useGetEthicalRulesByEvaluationIdHook"
import useGeneratePdfByEvaluationId from "@/hooks/pdf/useGeneratePdfByEvaluationId"
import useUpdateEthicalNormHook from "@/hooks/ethicalRules/useUpdateEthicalRulesHook"
import useGenerateEvaluationHook from "@/hooks/ia/useGenerateAnalisisHook"
import useReEvaluateEvaluationHook from "@/hooks/ia/useReEvaluateEvaluation"
import { useAuthContext } from "@/context/AuthContext"

export default function EvaluationScreen() {
  const { user } = useAuthContext()
  const { evaluationId = "" } = useParams<{ evaluationId: string }>()
  const location = useLocation()
  const { runGenerate = false, runReEvaluate = false } = (location.state as { runGenerate?: boolean; runReEvaluate?: boolean } | undefined) ?? {}

  const { generate, loading: generating } = useGenerateEvaluationHook()
  const { reEvaluate, loading: generatingRe } = useReEvaluateEvaluationHook()

  const { norms, refetch: fetchNorms } =
    useGetEthicalRulesByEvaluationIdHook(evaluationId)
  const { mutateAsync: sendEmailMutation } = useSendEmail()
  const { updateEthicalNorm } = useUpdateEthicalNormHook(evaluationId)
  const { pdfUrl, fetchPdf, pdfId, loading: loadingPdf, clear } = useGeneratePdfByEvaluationId()

  const [selectedRow, setSelectedRow] = useState<any>(null)
  const [mailModalOpen, setMailModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)

  const alreadyTriggered = useRef(false)

  // ─── tabla derivada directamente de norms ───────────────────────────────
  const tableData = useMemo(
    () => norms.map(({ createdAt, updatedAt, evaluationId, ...rest }) => rest),
    [norms]
  )

  useEffect(() => {
    if (alreadyTriggered.current) {
      fetchNorms()
      return
    }

    if (runGenerate) {
      alreadyTriggered.current = true
      generate(evaluationId)
        .then(() => fetchNorms())
        .then(() => clear())
        .then(() => {
          // limpiamos el state para que no se vuelva a disparar
          window.history.replaceState({}, "", window.location.pathname)
        })
      return
    }

    if (runReEvaluate) {
      alreadyTriggered.current = true
      reEvaluate(evaluationId)
        .then(() => fetchNorms())
        .then(() => clear())
        .then(() => {
          window.history.replaceState({}, "", window.location.pathname)
        })
      return
    }

    fetchNorms()
  }, [runGenerate, runReEvaluate, generate, reEvaluate, evaluationId, fetchNorms])

  useEffect(() => {
    if (mailModalOpen) {
      fetchPdf(evaluationId)
    }
  }, [mailModalOpen, evaluationId, fetchPdf])


  const handleMailModalFormSubmit = async (data: any) => {
    if (!pdfId) {
      console.error("No hay pdfId para enviar");
      return;
    }
    await sendEmailMutation({ ...data, evaluationId, modelo: user?.modelo, pdfId });
    clear();
    setMailModalOpen(false);
  };

  const handleEditSubmit = async (data: any) => {
    if (!selectedRow) return
    console.log("data", data)
    console.log("selectedRow", selectedRow)
    const params = {
      status: data.estado,
      cita: data.cita,
      justification: data.justification,
    }
    await updateEthicalNorm(selectedRow.id, params)
    clear()
    await fetchNorms()
    setEditModalOpen(false)
  }

  const handleRowClick = (row: any) => setSelectedRow(row)
  const handleEdit = (row: any) => {
    setSelectedRow(row)
    setEditModalOpen(true)
  }

  const editInitialData = selectedRow
    ? {
      estado: selectedRow.status,
      cita: selectedRow.cita,
      justification: selectedRow.justification,
    }
    : {}

  const modalFormFields: FormField[][] = [
    [
      { type: "email", key: "to", placeholder: "Correo de destino", required: true },
      {
        type: "select",
        key: "subject",
        placeholder: "Motivo del correo",
        required: true,
        selectPlaceholder: "Selecciona un motivo",
        options: [
          { value: "Incompletitud", label: "Incompletitud" },
          { value: "Ortografía", label: "Ortografía" },
          { value: "Coherencia", label: "Coherencia" },
          { value: "Aprobación", label: "Aprobación" },
        ],
      },
    ],
    [
      {
        type: "custom",
        key: "pdfPreview",
        placeholder: "Vista previa PDF",
        component: <PdfRenderer url={pdfUrl} externalLoading={loadingPdf} />,
        required: false,
      },
      {
        type: "textarea",
        key: "mensajeAdicional",
        placeholder: "Mensaje adicional",
        required: false,
        autoAdjust: true,
      },
    ],
  ]

  const editModalFields: FormField[][] = [
    [
      {
        type: "select",
        key: "estado",
        placeholder: "Estado",
        required: false,
        selectPlaceholder: "Selecciona estado",
        options: [
          { value: "APROBADO", label: "Aprobado" },
          { value: "NO_APROBADO", label: "No aprobado" },
          { value: "NO_APLICA", label: "No aplica" },
        ],
      },
    ],
    [{ type: "textarea", key: "cita", placeholder: "Cita", required: false }],
    [
      {
        type: "textarea",
        key: "justification",
        placeholder: "Justificación",
        required: false,
        autoAdjust: true,
      },
    ],
  ]

  const columnsConfig: ColumnConfig[] = [
    { id: "id", accessorKey: "id", headerLabel: "ID" },
    { id: "codeNumber", accessorKey: "codeNumber", headerLabel: "Número de norma", searchable: true, },
    {
      id: "status",
      accessorKey: "status",
      headerLabel: "Estado",
      renderType: "badgeWithText",
      items: [
        { value: "APROBADO", label: "Aprobado", icon: CheckCircle, badgeVariant: "approved" },
        { value: "NO_APROBADO", label: "No aprobado", icon: Circle, badgeVariant: "notapproved" },
        { value: "NO_APLICA", label: "No aplica", icon: CircleDashed, badgeVariant: "unknown" },
      ],
    },
    { id: "description", accessorKey: "description", headerLabel: "Descripción", searchable: true, },
    { id: "justification", accessorKey: "justification", headerLabel: "Justificación", searchable: true, },
    { id: "cita", accessorKey: "cita", headerLabel: "Cita" },
    {
      id: "actions",
      type: "actions",
      actionItems: [{ label: "Editar", onClick: handleEdit }],
    },
  ]

  return (
    <EvaluationResultTemplate
      data={tableData}
      columnsConfig={columnsConfig}
      onRowClick={handleRowClick}
      DataSelectedRow={selectedRow}
      tableLoading={generating || generatingRe}
      modalFormFields={modalFormFields}
      onModalSubmit={handleMailModalFormSubmit}
      modalOpen={mailModalOpen}
      onMailModalOpenChange={setMailModalOpen}
      editModalFormFields={editModalFields}
      onEditModalSubmit={handleEditSubmit}
      editModalOpen={editModalOpen}
      onEditModalOpenChange={setEditModalOpen}
      editInitialData={editInitialData}
    />
  )
}
