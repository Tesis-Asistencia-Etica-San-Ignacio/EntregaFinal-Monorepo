import { getEthicalNormsByEvaluationId } from "@/services/ethicalNormService";
import { getEvaluationById } from "@/services/evaluationService";

type EvaluationLite = {
  estado?: string;
};

const SUCCESS_STATES = new Set(["EN CURSO", "EVALUADO"]);

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function wasEvaluationProcessedAfterError(
  evaluationId: string
): Promise<boolean> {
  const delays = [1200, 2500, 4000];

  for (const delay of delays) {
    await sleep(delay);

    try {
      const [evaluation, norms] = await Promise.all([
        getEvaluationById<EvaluationLite>(evaluationId),
        getEthicalNormsByEvaluationId(evaluationId),
      ]);

      if (evaluation?.estado && SUCCESS_STATES.has(evaluation.estado)) {
        return true;
      }

      if (Array.isArray(norms) && norms.length > 0) {
        return true;
      }
    } catch {
      // Intentamos otra vez en el siguiente delay.
    }
  }

  return false;
}
