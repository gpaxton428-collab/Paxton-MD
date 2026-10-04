// The six menu "views". Each has its own title, icon and category set.
const ALL = null; // null = every category

export const SCOPES = {
  public:  { title: 'PUBLIC MENU',  icon: '🌍', categories: ['user', 'ai', 'fun', 'download', 'search', 'media', 'converter', 'tools', 'utility', 'menustyle'] },
  private: { title: 'PRIVATE MENU', icon: '🔒', categories: ALL },
  group:   { title: 'GROUP MENU',   icon: '👥', categories: ['group', 'user', 'ai', 'fun', 'download', 'search', 'media', 'converter', 'tools', 'utility'] },
  owner:   { title: 'OWNER PANEL',  icon: '👑', categories: ALL },
  admin:   { title: 'ADMIN PANEL',  icon: '🛡️', categories: ['admin', 'group', 'user', 'ai', 'fun', 'download', 'search', 'media', 'converter', 'tools', 'utility', 'menustyle'] },
  user:    { title: 'USER MENU',    icon: '👤', categories: ['user', 'ai', 'fun', 'download', 'search', 'media', 'converter', 'tools', 'utility', 'menustyle'] }
};

export const SCOPE_NAMES = Object.keys(SCOPES);
const RANK = { public: 0, user: 0, group: 1, admin: 2, private: 3, owner: 3 };

// Who is asking decides the default view; an explicit request can only
// narrow it, never widen it beyond what the person is entitled to.
export function autoScope({ isOwner, isAdmin, inGroup }) {
  if (isOwner) return 'owner';
  if (inGroup) return isAdmin ? 'admin' : 'group';
  return 'user';
}

export function resolveScope(requested, entitled) {
  const r = String(requested || '').toLowerCase();
  if (!SCOPES[r]) return entitled;
  return RANK[r] <= RANK[entitled] ? r : entitled;
}

export const scopeSeesPrivileged = (scope) => scope === 'owner' || scope === 'private';
