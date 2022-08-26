import {
  list,
  mutationField,
  nonNull,
  objectType,
  queryField,
  stringArg,
} from 'nexus'

import SchemaBuilder from '@pothos/core'

/*
 QUERIES
 [ ] 1. Get all tasks (without date restriction)
 [ ] 2. Get all tasks for today 
 [ ] 3. Get all overdue tasks
 [ ] 4. Get all tasks for a specific tag 

 MUTATIONS
 [ ] 1. Change task title
 [ ] 2. Delete task
 [ ] 3. Add tags to task
 [ ] 4. Remove tags from task
 [ ] 5. Change task date
 [ ] 6. Remove tag if there are no tasks with it
   

 MISC 
 [x] create TAG object type 
  - title
  - id
 [ ] migrate to Pothos
   

 NOTES
 - filtrovani podle tagu si nech na konec, bude pouzito skoro pri kazde mutaci/query
 - Nexus je uz trochu obsolete, jdu to premigrovat cely do Pothos Graphql (plugins vypadaji dobre a usnadni mi praci)

*/

// export const Task = objectType({
//   name: 'Task',
//   definition(t) {
//     t.nonNull.string('id', { description: 'ID of the task' })
//     t.nonNull.string('title', { description: 'Text of the task' })
//     t.nonNull.date('createdOn', {
//       description: 'When the task is due, in ISO format.',
//     })
//     t.nonNull.boolean('completed', {
//       description: 'True if the task has been completed',
//     })
//     t.list.field('tags', {
//       type: 'Tag',
//     })
//     t.field('createdBy', {
//       type: 'User',
//       description: 'User that created the task',
//     })
//     t.nonNull.string('byUserId', {
//       description: 'Id of the User that created the task',
//     })
//   },
// })

export const Tag = objectType({
  name: 'Tag',
  definition(t) {
    t.nonNull.string('id')
    t.nonNull.string('title')
  },
})

export const createTask = mutationField('createTask', {
  type: 'Task',
  args: {
    title: nonNull(stringArg()),
    tags: list(nonNull(stringArg())),
  },
  resolve: async (_, { title, tags }, { prisma, userId }) => {
    if (!userId) {
      throw new Error(`You can't create tasks without logging in`)
    }

    //TODO add task
    const newTask = await prisma.task.create({
      data: {
        title: title,
        user: { connect: { id: userId } },
      },
    })

    return newTask
  },
})

export const markTaskDone = mutationField('markTaskDone', {
  type: 'Task',
  args: {
    taskId: nonNull(stringArg()),
  },
  resolve: async (_, { taskId }, { prisma, userId }) => {
    if (!userId) {
      throw new Error(`You can't modify tasks without logging in`)
    }

    const taskToUpdate = await prisma.task.update({
      where: { id: taskId },
      data: { completed: true },
    })

    return taskToUpdate
  },
})

export const undoTask = mutationField('undoTask', {
  type: 'Task',
  args: {
    taskId: nonNull(stringArg()),
  },
  resolve: async (_, { taskId }, { prisma, userId }) => {
    if (!userId) {
      throw new Error(`You can't modify tasks without logging in`)
    }

    const taskToUpdate = await prisma.task.update({
      where: { id: taskId },
      data: { completed: false },
    })

    return taskToUpdate
  },
})

export const changeTaskTitle = mutationField('changeTaskTitle', {
  type: 'Task',
  args: {
    taskId: nonNull(stringArg()),
    newTitle: nonNull(stringArg()),
  },
  resolve: async (_, { taskId, newTitle }, { prisma, userId }) => {
    if (!userId) {
      throw new Error(`You can't modify tasks without logging in.`)
    }

    const taskToUpdate = await prisma.task.update({
      where: { id: taskId },
      data: { title: newTitle },
    })

    return taskToUpdate
  },
})

// export const moveTaskToToday = mutationField('moveTaskToToday', {
//   type: 'Task',
//   args: {
//     taskId: nonNull(stringArg()),
//   },
//   resolve: async (_, { taskId }, { prisma, userId }) => {
//     if (!userId) {
//       throw new Error(`You can't modify tasks without logging in`)
//     }

//     const taskToUpdate = await prisma.task.update({ where: { id: taskId }, data: { dueOn: new Date() } })

//     return taskToUpdate
//   },
// })

// export const todayTasks = queryField('todayTasks', {
//   type: list(nonNull('Task')),
//   resolve: async (_, __, { prisma, userId }) => {
//     const userTasks = await prisma.user.findUnique({ where: { id: userId } }).tasks()

//     const todayTasks = userTasks
//       .filter((task) => isToday(task.dueOn))
//       .sort((a, b) => {
//         const { dueOn: aDueOn, completed: aCompleted } = a
//         const { dueOn: bDueOn, completed: bCompleted } = b

//         if (aCompleted === b.completed) {
//           return new Date(aDueOn) < new Date(bDueOn) ? 1 : -1
//         } else if (aCompleted) {
//           return 1
//         } else if (bCompleted) {
//           return -1
//         }
//       })

//     return todayTasks
//   },
// })

// export const overdueTasks = queryField('overdueTasks', {
//   type: list(nonNull('Task')),
//   resolve: async (_, __, { prisma, userId }) => {
//     const userTasks = await prisma.user.findUnique({ where: { id: userId } }).tasks()

//     const overdueTasks = userTasks.filter((task) => !isToday(task.dueOn))

//     return overdueTasks
//   },
// })

export const allTasks = queryField('allTasks', {
  type: list(nonNull('Task')),
  resolve: async (_, __, { prisma, userId }) => {
    return await prisma.user.findUnique({ where: { id: userId } }).tasks()
  },
})
