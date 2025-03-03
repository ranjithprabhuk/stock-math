// interfaces/IEarnings.ts
export interface IAnnualEarning {
  fiscalDateEnding: string;
  reportedEPS: string;
}

export interface IQuarterlyEarning {
  fiscalDateEnding: string;
  reportedDate: string;
  reportedEPS: string;
  estimatedEPS: string;
  surprise: string;
  surprisePercentage: string;
}

export interface IEarnings {
  symbol: string;
  annualEarnings: IAnnualEarning[];
  quarterlyEarnings: IQuarterlyEarning[];
}
