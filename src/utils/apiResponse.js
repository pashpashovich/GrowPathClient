export const unwrapList = (response) => {
  const payload = response?.data;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

export const getApiErrorMessage = (error, fallback = 'Произошла ошибка') =>
  error?.response?.data?.message || error?.message || fallback;

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
