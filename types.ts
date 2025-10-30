
export interface AttractivenessFactor {
  name: string;
  score: number;
  description: string;
}

export interface AttractivenessReport {
  overallScore: number;
  factors: AttractivenessFactor[];
  summary: string;
}