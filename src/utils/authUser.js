/** ID пользователя из профиля (/auth/user), только числовой. */
export const getAuthUserId = (user) => {
  if (!user) return null;

  const raw =
    user.id ??
    user.userId ??
    user.data?.id ??
    user.data?.userId ??
    user.profile?.id;

  if (raw == null || raw === '') return null;

  const num = Number(raw);
  return Number.isFinite(num) ? num : null;
};

export const normalizeAuthUser = (payload) => {
  if (!payload) return null;
  if (payload.id != null || payload.userId != null) return payload;
  if (payload.data && typeof payload.data === 'object') return payload.data;
  return payload;
};
