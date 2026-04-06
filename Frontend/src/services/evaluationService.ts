import { requestsApi } from "@/lib/api/requestsApi";
import type { FileItem } from "@/types/fileType";
import type { UpdateEvaluationParams } from "@/types/evaluationType";
import type { PaginatedResponse, TableQueryParams } from "@/types/paginationType";
import { AxiosProgressEvent } from "axios";


export const getEvaluationsByUser = async (
  params: TableQueryParams
): Promise<PaginatedResponse<FileItem>> => {
  const response = await requestsApi.get("/evaluacion/my", {
    params: {
      page: params.page,
      pageSize: params.pageSize,
      search: params.search,
      sortBy: params.sortBy,
      sortOrder: params.sortOrder,
      filters: params.filters ? JSON.stringify(params.filters) : undefined,
    },
  });
  return response.data;
};

export const deleteEvaluation = async (evaluationId: string): Promise<void> => {
  await requestsApi.delete(`/evaluacion/${evaluationId}`);
};

export const getEvaluationById = async <T = any>(evaluationId: string): Promise<T> => {
  const response = await requestsApi.get(`/evaluacion/${evaluationId}`);
  return response.data;
};


export const uploadFile = async (
  formData: FormData,
  onProgress?: (event: AxiosProgressEvent) => void
): Promise<void> => {
  await requestsApi.post("/files/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: onProgress,
  })
}

export const updateEvaluation = async (
  evaluationId: string,
  updateData: UpdateEvaluationParams
): Promise<void> => {
  console.log("Updating evaluation with data:", updateData);
  await requestsApi.patch(`/evaluacion/${evaluationId}`, updateData, {
    headers: { "Content-Type": "application/json" },
  });
};
