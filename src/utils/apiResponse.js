export const unwrapList = (response) => {
  const payload = response?.data;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

export const getApiErrorMessage = (error, fallback = 'Произошла ошибка') =>
  error?.response?.data?.message || error?.message || fallback;
