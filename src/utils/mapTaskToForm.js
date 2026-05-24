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

export const resolveTaskGoalId = (task) => {
  const t = normalizeTaskFromApi(task) || task || {};
  if (t.goalId != null) return String(t.goalId);
  if (t.programGoalId != null) return String(t.programGoalId);
  if (t.goal?.id != null) return String(t.goal.id);
  if (t.programGoal?.id != null) return String(t.programGoal.id);
  return '';
};

export const resolveTaskGoalLabel = (task) => {
  const t = normalizeTaskFromApi(task) || task || {};
  return (
    t.goalTitle ??
    t.goal?.title ??
    t.programGoal?.title ??
    t.programGoalTitle ??
    ''
  );
};

export const resolveTaskChecklist = (task) => {
  const t = normalizeTaskFromApi(task) || task || {};
  const raw =
    t.checklist ??
    t.acceptanceChecklist ??
    t.checkList ??
    t.checklistItems ??
    t.acceptanceCriteria;

  if (!Array.isArray(raw) || raw.length === 0) {
    return [{ id: 1, text: '', completed: false }];
  }

  return raw.map((item, index) => ({
    id: item?.id ?? index + 1,
    text:
      typeof item === 'string'
        ? item
        : item?.text ?? item?.title ?? item?.description ?? item?.label ?? '',
    completed: typeof item === 'object' ? Boolean(item.completed) : false,
  }));
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
    goalId: resolveTaskGoalId(t),
    goalLabel: resolveTaskGoalLabel(t),
    internshipId: resolveTaskProgramId(t),
    assigneeId: resolveTaskAssigneeId(t),
    stageId: resolveTaskStageId(t),
    checklist: resolveTaskChecklist(t),
    attachments: resolveTaskFileAttachments(t),
    links: t.links || t.submissionLinks || [],
  };
};

/** Файлы задачи (не ссылки стажёра при сдаче). */
export const resolveTaskFileAttachments = (task) => {
  const t = normalizeTaskFromApi(task) || task || {};
  if (Array.isArray(t.attachments) && t.attachments.length > 0) {
    return t.attachments;
  }
  if (Array.isArray(t.artifacts)) {
    return t.artifacts
      .filter((a) => String(a.type || a.artifactType || '').toUpperCase() !== 'LINK')
      .map((a) => ({
        id: a.id,
        name: a.name || a.fileName || 'Файл',
        url: a.url,
        size: a.sizeBytes ?? a.size,
      }));
  }
  return [];
};
