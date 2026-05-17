const pad2 = (n) => String(n).padStart(2, '0');

/** datetime-local: YYYY-MM-DDTHH:mm without UTC shift */
export function toDatetimeLocalValue(value) {
  if (value == null || value === '') return '';

  if (Array.isArray(value) && value.length >= 3) {
    const [y, mo, d, h = 0, mi = 0] = value;
    return `${y}-${pad2(mo)}-${pad2(d)}T${pad2(h)}:${pad2(mi)}`;
  }

  const str = String(value).trim();
  const localMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/);
  if (localMatch) {
    return `${localMatch[1]}-${localMatch[2]}-${localMatch[3]}T${localMatch[4]}:${localMatch[5]}`;
  }

  const d = new Date(str);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

/** time input: HH:mm */
export function toTimeInputValue(value) {
  if (value == null || value === '') return '';
  const str = String(value).trim();
  const match = str.match(/^(\d{2}):(\d{2})/);
  if (match) return `${match[1]}:${match[2]}`;
  return '';
}

export function normalizeWeekDay(value) {
  if (!value) return 'monday';
  const key = String(value).trim().toLowerCase();
  return key;
}

export function normalizeMailing(raw) {
  if (!raw) return null;
  const data = raw.data ?? raw;

  const schedule = data.schedule ?? data.recurringSchedule ?? null;
  const groupIds =
    data.distributionGroupIds ??
    (Array.isArray(data.distributionGroups)
      ? data.distributionGroups.map((g) => g.id ?? g.groupId).filter((id) => id != null)
      : []);

  return {
    ...data,
    executeAt: data.executeAt ?? data.scheduledAt ?? data.execute_at ?? null,
    distributionGroupIds: groupIds,
    schedule: schedule
      ? {
          weekDay: normalizeWeekDay(schedule.weekDay ?? schedule.weekday ?? schedule.dayOfWeek),
          executeTime: schedule.executeTime ?? schedule.time ?? schedule.execute_time,
        }
      : null,
  };
}

export function mailingToForm(mailing) {
  const m = normalizeMailing(mailing) || {};
  return {
    name: m.name || '',
    type: m.type || 'immediate',
    emailTemplateId: m.emailTemplateId != null ? String(m.emailTemplateId) : '',
    executeAt: toDatetimeLocalValue(m.executeAt),
    distributionGroupIds: (m.distributionGroupIds || []).map(String),
    weekDay: m.schedule?.weekDay || 'monday',
    executeTime: toTimeInputValue(m.schedule?.executeTime) || '09:00',
  };
}

/** Local wall-clock for API (LocalDateTime-friendly) */
export function datetimeLocalToApiValue(localValue) {
  if (!localValue) return null;
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(localValue)) {
    return `${localValue}:00`;
  }
  return localValue;
}

export function timeToApiValue(timeValue) {
  if (!timeValue) return null;
  if (/^\d{2}:\d{2}$/.test(timeValue)) return `${timeValue}:00`;
  return timeValue;
}
