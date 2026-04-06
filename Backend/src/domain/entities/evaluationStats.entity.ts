export interface CardStats {
  value: number;
  previousValue: number;
}

export interface EvaluationStats {
  cards: {
    total: CardStats;
    aprobados: CardStats;
    rechazados: CardStats;
    tasaDevolucion: CardStats;
    tiempoPromedio: {
      value: string;
    };
  };
  lineSeries: { date: string; evaluadas: number }[];
  pieSeries: { label: string; value: number }[];
}
