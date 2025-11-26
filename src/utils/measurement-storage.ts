// 측정 완료 상태를 관리하는 유틸리티 함수들

export const getMeasurementCompletions = (): string[] => {
  if (typeof window === 'undefined') return [];
  
  const completed = localStorage.getItem('completedMeasurements');
  return completed ? JSON.parse(completed) : [];
};

export const addMeasurementCompletion = (measurementId: string): void => {
  if (typeof window === 'undefined') return;
  
  const completed = getMeasurementCompletions();
  if (!completed.includes(measurementId)) {
    completed.push(measurementId);
    localStorage.setItem('completedMeasurements', JSON.stringify(completed));
  }
};

export const removeMeasurementCompletion = (measurementId: string): void => {
  if (typeof window === 'undefined') return;
  
  const completed = getMeasurementCompletions();
  const filtered = completed.filter(id => id !== measurementId);
  localStorage.setItem('completedMeasurements', JSON.stringify(filtered));
};

export const clearAllMeasurementCompletions = (): void => {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('completedMeasurements');
};

export const isMeasurementCompleted = (measurementId: string): boolean => {
  return getMeasurementCompletions().includes(measurementId);
};
