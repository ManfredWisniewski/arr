import * as migration_20260928_142443_initial from './20260928_142443_initial';
import * as migration_20260929_143121_add_pages_theme_roles from './20260929_143121_add_pages_theme_roles';
import * as migration_20260930_094212_add_structures from './20260930_094212_add_structures';
import * as migration_20260930_100719_add_page_template from './20260930_100719_add_page_template';

export const migrations = [
  {
    up: migration_20260928_142443_initial.up,
    down: migration_20260928_142443_initial.down,
    name: '20260928_142443_initial',
  },
  {
    up: migration_20260929_143121_add_pages_theme_roles.up,
    down: migration_20260929_143121_add_pages_theme_roles.down,
    name: '20260929_143121_add_pages_theme_roles',
  },
  {
    up: migration_20260930_094212_add_structures.up,
    down: migration_20260930_094212_add_structures.down,
    name: '20260930_094212_add_structures',
  },
  {
    up: migration_20260930_100719_add_page_template.up,
    down: migration_20260930_100719_add_page_template.down,
    name: '20260930_100719_add_page_template'
  },
];
