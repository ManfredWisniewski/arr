import * as migration_20260928_142443_initial from './20260928_142443_initial';
import * as migration_20260929_143121_add_pages_theme_roles from './20260929_143121_add_pages_theme_roles';

export const migrations = [
  {
    up: migration_20260928_142443_initial.up,
    down: migration_20260928_142443_initial.down,
    name: '20260928_142443_initial',
  },
  {
    up: migration_20260929_143121_add_pages_theme_roles.up,
    down: migration_20260929_143121_add_pages_theme_roles.down,
    name: '20260929_143121_add_pages_theme_roles'
  },
];
