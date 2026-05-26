import { internAPI } from '../services/api';

export function normalizeProgramCompetenciesResponse(body) {
  const raw = body?.data ?? body;
  if (!raw || typeof raw !== 'object') {
    return { internId: null, programId: null, programTitle: '', competencies: [] };
  }
  const competencies = (Array.isArray(raw.competencies) ? raw.competencies : [])
    .map((c) => ({
      id: c.id != null ? Number(c.id) : null,
      name: c.name || '',
    }))
    .filter((c) => c.id != null && c.name);
  return {
    internId: raw.internId != null ? Number(raw.internId) : null,
    programId: raw.programId != null ? Number(raw.programId) : null,
    programTitle: raw.programTitle || '',
    competencies,
  };
}

export async function fetchProgramCompetenciesForIntern(internId, programId) {
  const params = {};
  if (programId != null && programId !== '') {
    params.programId = Number(programId);
  }
  const response = await internAPI.getInternProgramCompetencies(internId, params);
  return normalizeProgramCompetenciesResponse(response.data);
}

export function resolveTaskCompetencyIds(task) {
  const t = task?.data ?? task;
  if (!t || typeof t !== 'object') return [];
  const refs = Array.isArray(t.competencyRefs) ? t.competencyRefs : [];
  return refs
    .map((c) => (c?.id != null ? Number(c.id) : null))
    .filter((id) => id != null && Number.isFinite(id));
}

export function resolveTaskCompetencyRefsForDisplay(task) {
  const t = task?.data ?? task;
  if (!t || typeof t !== 'object') return [];
  const refs = Array.isArray(t.competencyRefs) ? t.competencyRefs : [];
  return refs
    .map((c) => ({
      id: c.id != null ? Number(c.id) : null,
      name: c.name || c.competencyName || '',
    }))
    .filter((c) => c.id != null);
}