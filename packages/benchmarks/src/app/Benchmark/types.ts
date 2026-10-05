export type BenchResultsType = {
  sampleCount: number;
  mean: number;
  stdDev: number;
  meanLayout: number;
  meanScripting: number;
};

export type SampleTimingType = {
  scriptingStart: number;
  scriptingEnd?: number;
  layoutStart?: number;
  layoutEnd?: number;
};

export type FullSampleTimingType = {
  start: number;
  end: number;
  scriptingStart: number;
  scriptingEnd: number;
  layoutStart?: number;
  layoutEnd?: number;
};
