export const HIRING_DECISIONS = [
  'recommended_for_hire',
  'talent_reserve',
  'completed_without_hire',
  'additional_assessment',
];

export const HIRING_DECISION_LABELS = {
  recommended_for_hire: 'Рекомендован к найму',
  talent_reserve: 'Зачисление в кадровый резерв',
  completed_without_hire: 'Завершение стажировки без найма',
  additional_assessment: 'Дополнительная оценка',
  hire: 'Рекомендован к найму',
  reject: 'Завершение стажировки без найма',
};

export const INTERN_STATUS_LABELS = {
  active: 'Активен',
  additional_assessment: 'Дополнительная оценка',
  completed: 'Стажировка завершена',
  paused: 'На паузе',
};

const COMPLETED_PROGRAM_STATUSES = new Set(['completed', 'archived', 'cancelled']);

export const isProgramEligibleForHiring = (program) => {
  if (!program) return false;
  const status = String(program.status || '').toLowerCase();
  return COMPLETED_PROGRAM_STATUSES.has(status);
};

export const canRecordHiringDecision = (role) =>
  ['department_head', 'hr', 'admin'].includes(role);

export const normalizeHiringDecision = (raw) => {
  const body = raw?.data ?? raw;
  if (!body || typeof body !== 'object') return null;
  return body;
};

export const hiringDecisionLabel = (decision) =>
  HIRING_DECISION_LABELS[decision] || decision || '—';
