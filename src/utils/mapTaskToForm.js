export const resolveTaskAssigneeId = (task) => {
  if (!task) return null;
  if (Array.isArray(task.assignments) && task.assignments.length > 0) {
    const a = task.assignments[0];
    return a.internId ?? a.assigneeId ?? a.userId ?? null;
  }
  return (
    task.assigneeId ??
    task.internId ??
    task.assignee?.id ??
    task.assignee?.userId ??
    null
  );
};

export const resolveTaskStageId = (task) => {
  if (!task) return null;
  if (Array.isArray(task.assignments) && task.assignments.length > 0) {
    const a = task.assignments[0];
    return a.iprStageId ?? a.stageId ?? null;
  }
  return task.iprStageId ?? task.stageId ?? task.iprStage?.id ?? null;
};

export const resolveTaskProgramId = (task) => {
  if (!task) return '';
  const id = task.internshipId ?? task.programId ?? task.internship?.id ?? null;
  return id != null ? String(id) : '';
};

/** Находит участника программы по userId, internId или id записи */
export const matchProgramParticipant = (participants, id) => {
  if (id == null || !Array.isArray(participants)) return null;
  const n = Number(id);
  return (
    participants.find(
      (p) =>
        Number(p.userId) === n ||
        Number(p.id) === n ||
        Number(p.internId) === n
    ) ?? null
  );
};

export const participantSelectValue = (participant) =>
  String(participant?.userId ?? participant?.id ?? '');

export const findIprForParticipant = (iprs, participantId, participants = []) => {
  if (!participantId || !Array.isArray(iprs)) return null;
  const participant = matchProgramParticipant(participants, participantId);
  const ids = new Set([Number(participantId)]);
  if (participant) {
    if (participant.userId != null) ids.add(Number(participant.userId));
    if (participant.id != null) ids.add(Number(participant.id));
    if (participant.internId != null) ids.add(Number(participant.internId));
  }
  return (
    iprs.find(
      (ipr) => ids.has(Number(ipr.internId)) || ids.has(Number(ipr.userId))
    ) ?? null
  );
};

export const normalizeTaskFromApi = (raw) => {
  const task = raw?.data ?? raw;
  if (!task || typeof task !== 'object') return null;
  return task;
};

export const mapTaskToFormFields = (task) => {
  const t = normalizeTaskFromApi(task) || {};
  let dueDate = '';
  if (t.dueDate) {
    const parsed = new Date(t.dueDate);
    if (!Number.isNaN(parsed.getTime())) {
      dueDate = parsed.toISOString().split('T')[0];
    }
  }

  const priority = String(t.priority || 'medium').toLowerCase();

  return {
    title: t.title ?? '',
    description: t.description ?? '',
    priority: ['low', 'medium', 'high'].includes(priority) ? priority : 'medium',
    dueDate,
    goalId: t.goalId != null ? String(t.goalId) : '',
    internshipId: resolveTaskProgramId(t),
    assigneeId: resolveTaskAssigneeId(t),
    stageId: resolveTaskStageId(t),
    checklist: Array.isArray(t.checklist)
      ? t.checklist.map((item, index) => ({
          id: index + 1,
          text: typeof item === 'string' ? item : item.text || '',
          completed: typeof item === 'object' ? Boolean(item.completed) : false,
        }))
      : [{ id: 1, text: '', completed: false }],
    attachments: t.attachments || [],
    links: t.links || [],
  };
};
