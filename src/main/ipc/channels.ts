export const IPC = {
  // Tasks
  TASKS_LIST: 'tasks:list',
  TASKS_GET: 'tasks:get',
  TASKS_CREATE: 'tasks:create',
  TASKS_UPDATE: 'tasks:update',
  TASKS_DELETE: 'tasks:delete',
  TASKS_TOGGLE: 'tasks:toggle',

  // Groups
  GROUPS_LIST: 'groups:list',
  GROUPS_CREATE: 'groups:create',
  GROUPS_UPDATE: 'groups:update',
  GROUPS_DELETE: 'groups:delete',

  // Tags
  TAGS_LIST: 'tags:list',
  TAGS_CREATE: 'tags:create',
  TAGS_DELETE: 'tags:delete',
  TAGS_ASSIGN: 'tags:assign',
  TAGS_UNASSIGN: 'tags:unassign',

  // Events
  DATA_CHANGED: 'data:changed',

  // Updater
  UPDATER_CHECK: 'updater:check',
  UPDATER_DOWNLOAD: 'updater:download',
  UPDATER_INSTALL: 'updater:install',
  UPDATER_STATUS: 'updater:status',
} as const
