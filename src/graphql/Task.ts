import {
  differenceInCalendarDays,
  formatISO,
  isSameDay,
  startOfToday,
  sub,
} from 'date-fns'
import { builder } from '../builder'
import { prisma } from '../db'

builder.prismaObject('Task', {
  fields: (t) => ({
    id: t.exposeID('id'),
    title: t.exposeString('title'),
    createdOn: t.expose('createdOn', { type: 'DateTime' }),
    dueOn: t.expose('dueOn', { type: 'DateTime' }),
    isDueToday: t.field({
      type: 'Boolean',
      resolve: (parent) => {
        const { dueOn } = parent
        const today = new Date()

        return isSameDay(dueOn, today)
      },
    }),
    daysSinceCreated: t.field({
      type: 'Int',
      resolve: (parent) => {
        const { createdOn } = parent
        const today = new Date()

        return differenceInCalendarDays(today, createdOn)
      },
    }),
    completed: t.exposeBoolean('completed'),
    tags: t.exposeStringList('tags'),
    user: t.relation('user'),
  }),
})

builder.queryField('allUserTasks', (t) =>
  t.withAuth({ loggedIn: true }).prismaField({
    type: ['Task'],
    nullable: true,
    args: {
      activeTags: t.arg.stringList({ required: false }),
    },
    resolve: async (query, _, { activeTags }, { userId }) => {
      return prisma.task.findMany({
        ...query,
        where: {
          AND: [
            { userId: userId },
            { tags: { hasEvery: activeTags ? activeTags : [] } },
          ],
        },
      })
    },
  })
)

builder.queryField('stashedTasks', (t) =>
  t.withAuth({ loggedIn: true }).prismaField({
    type: ['Task'],
    nullable: true,
    args: {
      activeTags: t.arg.stringList({ required: false }),
    },
    resolve: async (query, _, { activeTags }, { userId }) => {
      return prisma.task.findMany({
        ...query,
        where: {
          AND: [
            { userId: userId },
            {
              dueOn: { lt: startOfToday() },
            },
            { tags: { hasEvery: activeTags ? activeTags : [] } },
          ],
        },
      })
    },
  })
)

builder.queryField('todayTasks', (t) =>
  t.withAuth({ loggedIn: true }).prismaField({
    type: ['Task'],
    nullable: true,
    args: {
      activeTags: t.arg.stringList({ required: false }),
    },
    resolve: async (query, _, { activeTags }, { userId }) => {
      return prisma.task.findMany({
        ...query,
        where: {
          AND: [
            { userId: userId },
            {
              dueOn: { gte: startOfToday() },
            },
            { tags: { hasEvery: activeTags ? activeTags : [] } },
          ],
        },
      })
    },
  })
)

builder.mutationField('createTask', (t) =>
  t.withAuth({ loggedIn: true }).prismaField({
    type: 'Task',
    nullable: true,
    args: {
      title: t.arg.string({ required: true }),
      tags: t.arg.stringList(),
      toStash: t.arg.boolean(),
    },
    resolve: async (query, _, { title, toStash, tags }, { userId }) => {
      return prisma.task.create({
        ...query,
        data: {
          title: title,
          dueOn: toStash ? sub(new Date(), { days: 1 }) : new Date(),
          tags: {
            set: tags ? tags : [],
          },
          user: {
            connect: { id: userId },
          },
        },
      })
    },
  })
)

builder.mutationField('toggleTaskCompleted', (t) =>
  t.withAuth({ loggedIn: true }).prismaField({
    type: 'Task',
    nullable: true,
    args: {
      taskId: t.arg.string({ required: true }),
      completed: t.arg.boolean({ required: true }),
    },
    resolve: async (query, _, { taskId, completed }) => {
      return await prisma.task.update({
        ...query,
        where: {
          id: taskId,
        },
        data: {
          completed,
        },
      })
    },
  })
)

builder.mutationField('changeTaskTitle', (t) =>
  t.withAuth({ loggedIn: true }).prismaField({
    type: 'Task',
    nullable: true,
    args: {
      taskId: t.arg.string({ required: true }),
      title: t.arg.string({ required: true }),
    },
    resolve: async (query, _, { taskId, title }) => {
      return await prisma.task.update({
        ...query,
        where: {
          id: taskId,
        },
        data: {
          title: title,
        },
      })
    },
  })
)

builder.mutationField('deleteTask', (t) =>
  t.withAuth({ loggedIn: true }).prismaField({
    type: ['Task'],
    description: 'Deletes task, returns remaining user tasks',
    args: {
      taskId: t.arg.string({ required: true }),
    },
    nullable: true,
    resolve: async (query, _, { taskId }, { userId }) => {
      await prisma.task.delete({
        ...query,
        where: {
          id: taskId,
        },
      })

      return prisma.user.findUnique({ where: { id: userId } }).tasks()
    },
  })
)

builder.mutationField('changeTaskDueDate', (t) =>
  t.withAuth({ loggedIn: true }).prismaField({
    type: 'Task',
    description: 'Moves task from stash to today',
    args: {
      taskId: t.arg.string({ required: true }),
      dueDate: t.arg.string({ required: true }),
    },
    nullable: true,
    resolve: async (query, _, { taskId, dueDate }) => {
      return await prisma.task.update({
        ...query,
        where: {
          id: taskId,
        },
        data: {
          dueOn: new Date(dueDate),
        },
      })
    },
  })
)

builder.mutationField('editTaskTags', (t) =>
  t.withAuth({ loggedIn: true }).prismaField({
    type: 'Task',
    description: 'Edits task tags',
    args: {
      taskId: t.arg.string({ required: true }),
      tagsToRemove: t.arg.stringList(),
      tagsToAdd: t.arg.stringList(),
    },
    resolve: async (query, _, { taskId, tagsToRemove, tagsToAdd }) => {
      const activeTaskTags = await prisma.task.findUnique({
        ...query,
        where: {
          id: taskId,
        },
        select: {
          tags: true,
        },
      })

      let newTags = activeTaskTags?.tags

      if (tagsToRemove) {
        newTags = newTags?.filter((tag) => !tagsToRemove.includes(tag))
      }

      if (tagsToAdd) {
        newTags = newTags?.concat(tagsToAdd)
      }

      return await prisma.task.update({
        ...query,
        where: {
          id: taskId,
        },
        data: {
          tags: {
            set: newTags,
          },
        },
      })
    },
  })
)
