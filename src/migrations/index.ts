import * as migration_20260208_204032 from './20260208_204032'
import * as migration_20260209_110605 from './20260209_110605'
import * as migration_20260226_181736_add_service_groups from './20260226_181736_add_service_groups'
import * as migration_20260226_182825_add_sort_order_to_service_groups_and_services from './20260226_182825_add_sort_order_to_service_groups_and_services'
import * as migration_20260226_183343_service_groups_many_to_many_with_service_order from './20260226_183343_service_groups_many_to_many_with_service_order'
import * as migration_20260226_183956_remove_service_group_row_sort_order from './20260226_183956_remove_service_group_row_sort_order'
import * as migration_20260227_120000_add_workers_description from './20260227_120000_add_workers_description'

export const migrations = [
  {
    up: migration_20260208_204032.up,
    down: migration_20260208_204032.down,
    name: '20260208_204032',
  },
  {
    up: migration_20260209_110605.up,
    down: migration_20260209_110605.down,
    name: '20260209_110605',
  },
  {
    up: migration_20260226_181736_add_service_groups.up,
    down: migration_20260226_181736_add_service_groups.down,
    name: '20260226_181736_add_service_groups',
  },
  {
    up: migration_20260226_182825_add_sort_order_to_service_groups_and_services.up,
    down: migration_20260226_182825_add_sort_order_to_service_groups_and_services.down,
    name: '20260226_182825_add_sort_order_to_service_groups_and_services',
  },
  {
    up: migration_20260226_183343_service_groups_many_to_many_with_service_order.up,
    down: migration_20260226_183343_service_groups_many_to_many_with_service_order.down,
    name: '20260226_183343_service_groups_many_to_many_with_service_order',
  },
  {
    up: migration_20260226_183956_remove_service_group_row_sort_order.up,
    down: migration_20260226_183956_remove_service_group_row_sort_order.down,
    name: '20260226_183956_remove_service_group_row_sort_order',
  },
  {
    up: migration_20260227_120000_add_workers_description.up,
    down: migration_20260227_120000_add_workers_description.down,
    name: '20260227_120000_add_workers_description',
  },
]
