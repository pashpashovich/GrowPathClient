import { getNormalizedRole } from './resolveAppRole';

const FULL_ACCESS_ROLES = new Set(['admin', 'hr']);

export const canDeleteRoadmapEntity = (entity, user, role) => {
  if (!entity || !user) return false;
  const appRole = role || getNormalizedRole(user);
  if (!appRole || appRole === 'intern') return false;
  if (FULL_ACCESS_ROLES.has(appRole)) return true;
  if (appRole === 'mentor' || appRole === 'department_head') {
    const ownerId = entity.mentorId ?? entity.mentor?.id ?? entity.createdBy;
    return ownerId != null && Number(ownerId) === Number(user.id);
  }
  return false;
};
