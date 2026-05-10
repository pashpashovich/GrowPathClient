function mapKeycloakFragmentToAppRole(fragment) {
  const table = {
    admin: 'admin',
    super_admin: 'admin',
    administrator: 'admin',
    hr: 'hr',
    hr_manager: 'hr',
    mentor: 'mentor',
    intern: 'intern',
    department_head: 'department_head',
  };
  if (table[fragment]) return table[fragment];
  if (fragment.startsWith('hr')) return 'hr';
  if (fragment.includes('admin')) return 'admin';
  if (fragment.startsWith('department')) return 'department_head';
  if (fragment.startsWith('mentor')) return 'mentor';
  if (fragment.startsWith('intern')) return 'intern';
  return fragment;
}


export function getNormalizedRole(user) {
  const roles = user?.roles;
  if (roles && Array.isArray(roles) && roles.length > 0) {
    const appRoles = roles
      .filter((r) => typeof r === 'string')
      .map((r) => mapKeycloakFragmentToAppRole(r.replace(/^ROLE_/, '').toLowerCase()));
    const unique = [...new Set(appRoles)];
    const priority = ['admin', 'hr', 'department_head', 'mentor', 'intern'];
    for (const p of priority) {
      if (unique.includes(p)) return p;
    }
    return unique[0] ?? null;
  }
  if (user?.role) {
    const key = String(user.role).replace(/^ROLE_/, '').toLowerCase();
    return mapKeycloakFragmentToAppRole(key);
  }
  return null;
}
