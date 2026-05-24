export const ROADMAP_ENTITY_STATUS_LABELS = {
  draft: 'Черновик',
  active: 'Активная',
  paused: 'Приостановлена',
  archived: 'В архиве',
  completed: 'Завершена',
};

export const TEMPLATE_STATUSES = ['draft', 'active', 'paused', 'archived'];
export const IPR_STATUSES = ['draft', 'active', 'paused', 'completed'];

export const getRoadmapEntityStatusLabel = (status) =>
  ROADMAP_ENTITY_STATUS_LABELS[status] ?? status;
