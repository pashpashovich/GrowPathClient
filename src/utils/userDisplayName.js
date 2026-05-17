export function getUserDisplayName(user) {
  if (!user) return '';
  if (user.name?.trim()) return user.name.trim();
  const parts = [user.lastName, user.firstName, user.patronymicName].filter(Boolean);
  return parts.length ? parts.join(' ').trim() : user.email || '';
}
