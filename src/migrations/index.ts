import * as migration_20260928_142443_initial from './20260928_142443_initial';
import * as migration_20260929_143121_add_pages_theme_roles from './20260929_143121_add_pages_theme_roles';
import * as migration_20260930_094212_add_structures from './20260930_094212_add_structures';
import * as migration_20260930_100719_add_page_template from './20260930_100719_add_page_template';
import * as migration_20261003_070539_add_theme_logo from './20261003_070539_add_theme_logo';
import * as migration_20261003_073413_add_theme_favicon from './20261003_073413_add_theme_favicon';
import * as migration_20261012_153224_add_posts from './20261012_153224_add_posts';
import * as migration_20261013_192611_add_media_image_sizes from './20261013_192611_add_media_image_sizes';
import * as migration_20261013_192901_extend_media_image_sizes from './20261013_192901_extend_media_image_sizes';
import * as migration_20261024_201751_add_media_source_repo from './20261024_201751_add_media_source_repo';
import * as migration_20261030_090502_add_post_slides from './20261030_090502_add_post_slides';

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
    name: '20260930_100719_add_page_template',
  },
  {
    up: migration_20261003_070539_add_theme_logo.up,
    down: migration_20261003_070539_add_theme_logo.down,
    name: '20261003_070539_add_theme_logo',
  },
  {
    up: migration_20261003_073413_add_theme_favicon.up,
    down: migration_20261003_073413_add_theme_favicon.down,
    name: '20261003_073413_add_theme_favicon',
  },
  {
    up: migration_20261012_153224_add_posts.up,
    down: migration_20261012_153224_add_posts.down,
    name: '20261012_153224_add_posts',
  },
  {
    up: migration_20261013_192611_add_media_image_sizes.up,
    down: migration_20261013_192611_add_media_image_sizes.down,
    name: '20261013_192611_add_media_image_sizes',
  },
  {
    up: migration_20261013_192901_extend_media_image_sizes.up,
    down: migration_20261013_192901_extend_media_image_sizes.down,
    name: '20261013_192901_extend_media_image_sizes',
  },
  {
    up: migration_20261024_201751_add_media_source_repo.up,
    down: migration_20261024_201751_add_media_source_repo.down,
    name: '20261024_201751_add_media_source_repo',
  },
  {
    up: migration_20261030_090502_add_post_slides.up,
    down: migration_20261030_090502_add_post_slides.down,
    name: '20261030_090502_add_post_slides'
  },
];
