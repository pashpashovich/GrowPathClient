export const unwrapList = (response) => {
  const payload = response?.data;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const KNOWN_API_ERROR_MESSAGES = {
  'At least one stage is required for activation':
    'Нельзя активировать шаблон без этапов. Добавьте хотя бы один этап.',
  Forbidden: 'Недостаточно прав для этого действия',
  'Access denied': 'Недостаточно прав для этого действия',
};

const extractRawApiError = (error) => {
  if (typeof error === 'string') return error;
  const data = error?.response?.data;
  if (typeof data === 'string') return data;
  return data?.message || data?.error || error?.message || '';
};

export const getApiErrorMessage = (error, fallback = 'Произошла ошибка') => {
  const raw = extractRawApiError(error);
  if (!raw) return fallback;
  return KNOWN_API_ERROR_MESSAGES[raw] || raw;
};

export const buildDepartmentMap = (departments) => {
  const map = {};
  (departments || []).forEach((d) => {
    if (d?.id != null) map[String(d.id)] = d.name;
  });
  return map;
};

export const resolveDepartmentName = (entity, departmentMap = {}) => {
  if (!entity) return '—';
  if (entity.departmentName) return entity.departmentName;
  if (entity.department) return entity.department;
  const id = entity.departmentId;
  if (id != null && departmentMap[String(id)]) return departmentMap[String(id)];
  return '—';
};
