export function getUserDisplayName(user) {
  if (!user) return '';
  if (user.name?.trim()) return user.name.trim();
  const parts = [user.lastName, user.firstName, user.patronymicName].filter(Boolean);
  return parts.length ? parts.join(' ').trim() : user.email || '';
}

/** Подпись в поле Autocomplete после выбора */
export function getUserOptionLabel(user) {
  const name = getUserDisplayName(user);
  const email = user?.email?.trim();
  if (email && name && name.toLowerCase() !== email.toLowerCase()) {
    return `${name} · ${email}`;
  }
  return name || email || '';
}
