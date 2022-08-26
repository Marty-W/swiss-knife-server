import {
  list,
  mutationField,
  nonNull,
  objectType,
  queryField,
  stringArg,
} from "nexus"

export const Task = objectType({
  name: "Task",
  definition(t) {
    t.nonNull.string("id", { description: "ID of the task" })
    t.nonNull.string("title", { description: "Text of the task" })
    t.nonNull.boolean("completed", {
      description: "True if the task has been completed",
    })
    t.list.nonNull.string("tags", { description: "Tags of the task" })
    t.nonNull.date("dueOn", {
      description: "When the task is due, in ISO format.",
    })
    t.field("createdBy", {
      type: "User",
      description: "User that created the task",
    })
    t.nonNull.string("byUserId", {
      description: "Id of the User that created the task",
    })
  },
})

export const createTask = mutationField("createTask", {
  type: "Task",
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
        byUser: { connect: { id: userId } },
      },
    })

    return newTask
  },
})

export const markTaskDone = mutationField("markTaskDone", {
  type: "Task",
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

export const undoTask = mutationField("undoTask", {
  type: "Task",
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

export const changeTaskTitle = mutationField("changeTaskTitle", {
  type: "Task",
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

export const allTasks = queryField("allTasks", {
  type: list(nonNull("Task")),
  resolve: async (_, __, { prisma, userId }) => {
    return await prisma.user.findUnique({ where: { id: userId } }).tasks()
  },
})
