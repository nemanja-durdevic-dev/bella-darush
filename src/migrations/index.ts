import * as migration_20260208_204032 from './20260208_204032';
import * as migration_20260209_110605 from './20260209_110605';

export const migrations = [
  {
    up: migration_20260208_204032.up,
    down: migration_20260208_204032.down,
    name: '20260208_204032',
  },
  {
    up: migration_20260209_110605.up,
    down: migration_20260209_110605.down,
    name: '20260209_110605'
  },
];
