export const buildTaskFormExtras = ({ goalId, checklist } = {}) => {
  const extras = {};
  if (goalId) {
    extras.goalId = Number(goalId);
  }
  const items = (checklist || [])
    .filter((item) => String(item.text || '').trim())
    .map((item) => ({
      text: String(item.text).trim(),
      completed: Boolean(item.completed),
    }));
  if (items.length > 0) {
    extras.checklist = items;
  }
  return extras;
};

export const buildCreateTaskPayload = ({
  title,
  description,
  priority,
  internshipId,
  dueDate,
  assignments,
  goalId,
  checklist,
}) => {
  const payload = {
    title: title.trim(),
    description: description.trim(),
    priority,
    internshipId: Number(internshipId),
    assignments: assignments.map(({ internId, stageId }) => ({
      internId: Number(internId),
      iprStageId: Number(stageId),
    })),
    ...buildTaskFormExtras({ goalId, checklist }),
  };

  if (dueDate) {
    const hasTime = dueDate.includes('T');
    payload.dueDate = hasTime ? dueDate : `${dueDate}T18:00:00`;
  }

  return payload;
};

export const validateTaskAssignments = (rows) => {
  const errors = {};
  const filled = rows.filter((r) => r.internId && r.stageId);

  if (filled.length === 0) {
    errors.assignments = 'Добавьте хотя бы одно назначение (стажёр + этап ИПР)';
    return errors;
  }

  const internIds = filled.map((r) => String(r.internId));
  const unique = new Set(internIds);
  if (unique.size !== internIds.length) {
    errors.assignments = 'Один стажёр может быть указан только один раз';
  }

  const incomplete = rows.some((r) => (r.internId && !r.stageId) || (!r.internId && r.stageId));
  if (incomplete) {
    errors.assignments = 'Для каждой строки укажите стажёра и этап';
  }

  return errors;
};
