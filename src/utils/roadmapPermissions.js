import { getNormalizedRole } from './resolveAppRole';
import { getAuthUserId } from './authUser';

export { getAuthUserId };

const FULL_ACCESS_ROLES = new Set(['admin', 'hr']);

export const getRoadmapEntityOwnerId = (entity) => {
  if (!entity) return null;
  const raw =
    entity.mentorId ??
    entity.mentorUserId ??
    entity.createdBy ??
    entity.mentor?.id ??
    entity.mentor?.userId;
  return raw != null ? Number(raw) : null;
};

export const canDeleteRoadmapEntity = (entity, user, role, options = {}) => {
  if (!entity || !user) return false;
  const appRole = role || getNormalizedRole(user);
  if (!appRole || appRole === 'intern') return false;
  if (FULL_ACCESS_ROLES.has(appRole)) return true;

  if (appRole === 'mentor' && options.trustListOwnership) return true;

  const userId = getAuthUserId(user);
  if (!Number.isFinite(userId)) return false;

  const ownerId = getRoadmapEntityOwnerId(entity);
  if (ownerId != null) return ownerId === userId;

  return false;
};
