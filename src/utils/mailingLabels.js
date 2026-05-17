export const RECIPIENT_TYPE_LABELS = {
  user: 'Зарегистрированный',
  external: 'Внешний',
};

export const MAILING_TYPE_LABELS = {
  immediate: 'Разовая',
  scheduled: 'По расписанию',
  recurring: 'Повторяющаяся',
};

export const MAILING_STATUS_LABELS = {
  draft: 'Черновик',
  scheduled: 'Запланирована',
  sent: 'Отправлена',
  cancelled: 'Отменена',
};

export const WEEKDAY_LABELS = {
  monday: 'Понедельник',
  tuesday: 'Вторник',
  wednesday: 'Среда',
  thursday: 'Четверг',
  friday: 'Пятница',
  saturday: 'Суббота',
  sunday: 'Воскресенье',
};

export function formatDateTime(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
