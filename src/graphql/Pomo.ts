import { objectType } from 'nexus';

export const Pomo = objectType({
  name: 'Pomo',
  definition(t) {
    t.nonNull.id('id'),
      t.nonNull.int('startTime'),
      t.int('endTime'),
      t.nonNull.int('assumedDuration'),
      t.nonNull.int('actualDuration');
  },
});
