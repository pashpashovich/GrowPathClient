export function extractDataArray(responseBody) {
  if (!responseBody) return [];
  if (Array.isArray(responseBody)) return responseBody;
  if (Array.isArray(responseBody.data)) return responseBody.data;
  return [];
}

function cleanPositiveIntIds(arr) {
  if (!Array.isArray(arr)) return [];
  return arr
    .map((n) => (typeof n === 'number' ? n : parseInt(n, 10)))
    .filter((n) => Number.isInteger(n) && n > 0);
}

function clampDuration(n) {
  const d = Number(n);
  if (!Number.isFinite(d)) return 1;
  return Math.min(12, Math.max(1, Math.round(d)));
}

export function normalizeInternshipProgram(p) {
  if (!p) return null;
  const id = p.id != null ? String(p.id) : undefined;

  const itDirectionRef = p.itDirectionRef || null;
  const itDirectionId =
    itDirectionRef?.id != null ? Number(itDirectionRef.id) : p.itDirectionId != null ? Number(p.itDirectionId) : null;
  const itDirection =
    itDirectionRef?.displayName || itDirectionRef?.code || (typeof p.itDirection === 'string' ? p.itDirection : '') || '';

  const requirementRefs = Array.isArray(p.requirementRefs) ? p.requirementRefs : [];
  const requirements = requirementRefs.map((r) => r.requirementText || '').filter(Boolean);
  const requirementIds = cleanPositiveIntIds(requirementRefs.map((r) => r.id));

  const competencyRefs = Array.isArray(p.competencyRefs) ? p.competencyRefs : [];
  const competencyIds = cleanPositiveIntIds(
    competencyRefs.length ? competencyRefs.map((c) => c.id) : p.competencyIds
  );
  const competencies = competencyRefs.length
    ? competencyRefs.map((c) => c.name).filter(Boolean)
    : competencyIds.map(String);

  let goals = Array.isArray(p.goals) ? [...p.goals] : [];
  if (goals.length && typeof goals[0] === 'string') {
    goals = goals.map((text, i) => ({
      id: `goal-${id || 'new'}-${i}`,
      title: String(text),
      description: '',
    }));
  } else {
    goals = goals.map((g) => ({
      id: g.id != null ? g.id : undefined,
      title: g.title || '',
      description: g.description || '',
    }));
  }

  let selectionStages = Array.isArray(p.selectionStages) ? [...p.selectionStages] : [];
  if (selectionStages.length && typeof selectionStages[0] === 'string') {
    selectionStages = selectionStages.map((text, i) => ({
      id: `stage-${id || 'new'}-${i}`,
      name: String(text),
      description: '',
      order: i + 1,
      isActive: true,
    }));
  } else {
    selectionStages = selectionStages.map((s, i) => ({
      id: s.id != null ? s.id : undefined,
      name: s.name || '',
      description: s.description || '',
      order: typeof s.order === 'number' ? s.order : i + 1,
      isActive: s.isActive !== false,
    }));
    selectionStages.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }

  const goalIds = cleanPositiveIntIds(goals.map((g) => g.id));
  const selectionStageIds = cleanPositiveIntIds(selectionStages.map((s) => s.id));

  return {
    ...p,
    id,
    itDirectionRef,
    itDirectionId: Number.isInteger(itDirectionId) ? itDirectionId : null,
    itDirection,
    requirementRefs,
    requirements,
    requirementIds,
    competencyRefs,
    competencies,
    competencyIds,
    goals,
    selectionStages,
    goalIds,
    selectionStageIds,
  };
}

export function buildCreateInternshipProgramPayload(formData) {
  const duration = clampDuration(formData.duration);
  const maxPlaces = Number.isFinite(Number(formData.maxPlaces)) ? Number(formData.maxPlaces) : 0;

  const payload = {
    title: String(formData.title || '').trim(),
    description: String(formData.description || '').trim(),
    startDate: formData.startDate,
    duration,
    maxPlaces,
    competencyIds: cleanPositiveIntIds(formData.competencyIds),
    requirementIds: cleanPositiveIntIds(formData.requirementIds),
    goalIds: cleanPositiveIntIds(formData.goalIds),
    selectionStageIds: cleanPositiveIntIds(formData.selectionStageIds),
    status: formData.status === 'active' ? 'active' : 'draft',
  };

  if (formData.itDirectionId != null && Number.isInteger(Number(formData.itDirectionId))) {
    payload.itDirectionId = Number(formData.itDirectionId);
  }

  return payload;
}

export function buildUpdateInternshipProgramPayload(formData) {
  const duration = clampDuration(formData.duration);
  const maxPlaces = Number.isFinite(Number(formData.maxPlaces)) ? Number(formData.maxPlaces) : 0;

  const payload = {
    title: String(formData.title || '').trim(),
    description: String(formData.description || '').trim(),
    startDate: formData.startDate,
    duration,
    maxPlaces,
    competencyIds: cleanPositiveIntIds(formData.competencyIds),
    requirementIds: cleanPositiveIntIds(formData.requirementIds),
    goalIds: cleanPositiveIntIds(formData.goalIds),
    selectionStageIds: cleanPositiveIntIds(formData.selectionStageIds),
    status: formData.status || 'draft',
  };

  if (formData.itDirectionId != null && Number.isInteger(Number(formData.itDirectionId))) {
    payload.itDirectionId = Number(formData.itDirectionId);
  }

  return payload;
}
