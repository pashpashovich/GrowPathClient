/** Профиль рейтинга стажёра: GET /ratings/profile */
export const unwrapRatingProfile = (body) => {
  if (body == null || typeof body !== 'object') return null;

  const looksLikeProfile = (obj) =>
    obj &&
    typeof obj === 'object' &&
    !Array.isArray(obj) &&
    (obj.internId != null ||
      obj.internshipId != null ||
      obj.tasks != null ||
      Array.isArray(obj.recentRatedTasks) ||
      Array.isArray(obj.recent_rated_tasks) ||
      obj.hasAssessment !== undefined);

  if (looksLikeProfile(body)) return body;

  for (const key of ['data', 'payload', 'result', 'content', 'profile']) {
    const nested = body[key];
    if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
      const unwrapped = unwrapRatingProfile(nested);
      if (looksLikeProfile(unwrapped)) return unwrapped;
    }
  }

  return looksLikeProfile(body) ? body : null;
};

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
