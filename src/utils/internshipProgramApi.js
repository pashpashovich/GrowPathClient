/** Тело POST/PUT для /api/v1/internship-programs */
export function buildInternshipProgramPayload(formData) {
  const competencyIds = Array.isArray(formData.competencyIds)
    ? formData.competencyIds.map((n) => (typeof n === 'number' ? n : parseInt(n, 10))).filter((n) => Number.isInteger(n) && n > 0)
    : [];

  const goals = (formData.goals || []).map((g) =>
    typeof g === 'string' ? g : [g.title, g.description].filter(Boolean).join('. ')
  );

  const selectionStages = (formData.selectionStages || []).map((s) =>
    typeof s === 'string' ? s : [s.name, s.description].filter(Boolean).join(': ')
  );

  return {
    title: String(formData.title || '').trim(),
    description: String(formData.description || '').trim(),
    startDate: formData.startDate,
    duration: Number(formData.duration) || 1,
    maxPlaces: Number(formData.maxPlaces) || 0,
    itDirection: String(formData.itDirection || '').trim() || '—',
    competencyIds,
    requirements: Array.isArray(formData.requirements) ? formData.requirements : [],
    goals,
    selectionStages,
    status: formData.status || 'draft',
  };
}

/** Приводит ответ API к виду, ожидаемому UI (цели/этапы как объекты). */
export function normalizeInternshipProgram(p) {
  if (!p) return null;
  const id = p.id != null ? String(p.id) : undefined;
  const requirements = Array.isArray(p.requirements) ? p.requirements : [];

  let goals = Array.isArray(p.goals) ? [...p.goals] : [];
  if (goals.length && typeof goals[0] === 'string') {
    goals = goals.map((text, i) => ({
      id: `goal-${id || 'new'}-${i}`,
      title: text,
      description: '',
    }));
  }

  let selectionStages = Array.isArray(p.selectionStages) ? [...p.selectionStages] : [];
  if (selectionStages.length && typeof selectionStages[0] === 'string') {
    selectionStages = selectionStages.map((text, i) => {
      const parts = String(text).split(':');
      const name = parts[0]?.trim() || `Этап ${i + 1}`;
      const description = parts.length > 1 ? parts.slice(1).join(':').trim() : '';
      return {
        id: `stage-${id || 'new'}-${i}`,
        name,
        description,
        isActive: true,
      };
    });
  }

  const competencyIds = Array.isArray(p.competencyIds)
    ? p.competencyIds.map((n) => (typeof n === 'number' ? n : parseInt(n, 10))).filter((n) => Number.isInteger(n))
    : [];

  const competencies = Array.isArray(p.competencies)
    ? p.competencies
    : competencyIds.map(String);

  return {
    ...p,
    id,
    requirements,
    goals,
    selectionStages,
    competencies,
    competencyIds,
    itDirection: p.itDirection || '',
  };
}
