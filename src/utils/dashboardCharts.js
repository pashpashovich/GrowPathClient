const STATUS_LABELS = {
  pending: 'Ожидание',
  in_progress: 'В работе',
  submitted: 'Отправлено',
  on_review: 'На проверке',
  needs_rework: 'Доработка',
  rejected: 'Отклонено',
  completed: 'Завершено',
  cancelled: 'Отменено',
};

const PRIORITY_LABELS = {
  low: 'Низкий',
  medium: 'Средний',
  high: 'Высокий',
  critical: 'Критический',
};

const HIRING_LABELS = {
  recommended_for_hire: 'К найму',
  talent_reserve: 'Кадровый резерв',
  completed_without_hire: 'Без найма',
  additional_assessment: 'Доп. оценка',
};

const PROGRESS_BUCKET_LABELS = {
  '0-25': '0–25%',
  '26-50': '26–50%',
  '51-75': '51–75%',
  '76-100': '76–100%',
};

export const normalizeChartsPayload = (raw) => raw?.data ?? raw ?? {};

export const normalizeTrendSeries = (series) => {
  if (!Array.isArray(series)) return [];
  return series.map((point) => {
    const label =
      point?.label ||
      (point?.date
        ? new Date(point.date).toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: 'short',
          })
        : '');
    return {
      label,
      value: Number(point?.value) || 0,
      date: point?.date,
    };
  });
};

export const mapDistribution = (obj, labelMap = {}) => {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return [];
  return Object.entries(obj).map(([key, value]) => {
    const normalizedKey = String(key).toLowerCase();
    return {
      key,
      name: labelMap[normalizedKey] || labelMap[key] || key,
      value: Number(value) || 0,
    };
  });
};

export const mapTasksByStatus = (obj) => mapDistribution(obj, STATUS_LABELS);
export const mapTasksByPriority = (obj) => mapDistribution(obj, PRIORITY_LABELS);
export const mapHiringDecisions = (obj) => mapDistribution(obj, HIRING_LABELS);
export const mapProgressBuckets = (obj) => {
  if (!obj || typeof obj !== 'object') return [];
  const order = ['0-25', '26-50', '51-75', '76-100'];
  const entries = Object.entries(obj);
  entries.sort((a, b) => {
    const ai = order.indexOf(a[0]);
    const bi = order.indexOf(b[0]);
    if (ai === -1 && bi === -1) return a[0].localeCompare(b[0]);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
  return entries.map(([key, value]) => ({
    name: PROGRESS_BUCKET_LABELS[key] || key,
    value: Number(value) || 0,
    key,
  }));
};

export const mapBarItems = (items, {
  nameKey = 'programName',
  valueKey = 'count',
  fallbackNameKey = 'name',
  fallbackValueKey = 'totalInterns',
} = {}) => {
  if (!Array.isArray(items)) return [];
  return items.map((item, index) => ({
    name:
      item?.[nameKey] ||
      item?.[fallbackNameKey] ||
      item?.title ||
      item?.label ||
      `#${item?.programId ?? item?.id ?? index + 1}`,
    value: Number(item?.[valueKey] ?? item?.[fallbackValueKey] ?? item?.value) || 0,
    raw: item,
  }));
};

export const mapProgramCompletionRates = (items) =>
  mapBarItems(items, {
    nameKey: 'programName',
    valueKey: 'completionRate',
    fallbackValueKey: 'rate',
  }).map((row) => ({
    ...row,
    value: Math.round(row.value * 10) / 10,
  }));

export const mapMentorsWorkload = (items) => {
  if (!Array.isArray(items)) return [];
  return items.map((item, index) => ({
    name: item?.mentorName || item?.name || `Ментор ${index + 1}`,
    activeInterns: Number(item?.activeInterns ?? item?.totalInterns) || 0,
    activeTasks: Number(item?.activeTasks) || 0,
    workloadLevel: item?.workloadLevel || item?.workload,
    raw: item,
  }));
};

const parseGroupLabel = (groupKey, item) => {
  if (item?.label) return item.label;
  if (!groupKey) return 'Все';
  if (groupKey === 'all') return 'Все';
  if (groupKey.startsWith('program:')) return item?.programName || `Программа ${groupKey.split(':')[1]}`;
  if (groupKey.startsWith('mentor:')) return item?.mentorName || `Ментор ${groupKey.split(':')[1]}`;
  return groupKey;
};

export const mapBoxplots = (items) => {
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => ({
      label: parseGroupLabel(item?.groupKey, item),
      groupKey: item?.groupKey || 'all',
      metric: item?.metric || item?.metricName || 'progress',
      min: Number(item?.min),
      q1: Number(item?.q1),
      median: Number(item?.median),
      q3: Number(item?.q3),
      max: Number(item?.max),
      outliers: Array.isArray(item?.outliers)
        ? item.outliers.map((v) => Number(v)).filter((v) => Number.isFinite(v))
        : [],
    }))
    .filter(
      (item) =>
        Number.isFinite(item.min) &&
        Number.isFinite(item.q1) &&
        Number.isFinite(item.median) &&
        Number.isFinite(item.q3) &&
        Number.isFinite(item.max)
    );
};

export const mergeTrendSeries = (seriesA, seriesB, nameA, nameB) => {
  const a = normalizeTrendSeries(seriesA);
  const b = normalizeTrendSeries(seriesB);
  const labels = [...new Set([...a.map((p) => p.label), ...b.map((p) => p.label)])];
  return labels.map((label) => {
    const pointA = a.find((p) => p.label === label);
    const pointB = b.find((p) => p.label === label);
    return {
      label,
      [nameA]: pointA?.value ?? 0,
      [nameB]: pointB?.value ?? 0,
    };
  });
};

export const CHART_COLORS = [
  '#0052cc',
  '#36B37E',
  '#FFAB00',
  '#6554C0',
  '#00B8D9',
  '#FF8B00',
  '#BA1A1A',
  '#737685',
];
