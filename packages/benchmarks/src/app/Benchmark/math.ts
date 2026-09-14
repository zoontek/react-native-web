type ValuesType = Array<number>;

export const getStdDev = (values: ValuesType): number => {
  const avg = getMean(values);

  const squareDiffs = values.map((value: number) => {
    const diff = value - avg;
    return diff * diff;
  });

  return Math.sqrt(getMean(squareDiffs));
};

export const getMean = (values: ValuesType): number => {
  const sum = values.reduce((sum: number, value: number) => sum + value, 0);
  return sum / values.length;
};
