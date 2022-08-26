import { list, nonNull, objectType, queryField, stringArg } from "nexus"

export const User = objectType({
  name: "User",
  definition(t) {
    t.nonNull.string("id")
    t.nonNull.string("email")
    t.nonNull.string("password")
    t.list.nonNull.field("tasks", {
      type: "Task",
      async resolve({ id }, _, { prisma }) {
        return await prisma.user
          .findUnique({
            where: {
              id: id,
            },
          })
          .tasks()
      },
    })
    t.list.field("pomoSessions", {
      type: list("PomodoroSession"),
      async resolve({ id }, _, { prisma }) {
        return await prisma.user
          .findUnique({
            where: {
              id: id,
            },
          })
          .pomodoroSessions()
      },
    })
  },
})

export const UserQuery = queryField("user", {
  type: "User",
  args: {
    userId: nonNull(stringArg()),
  },
  resolve(_, { userId }, { prisma }) {
    return prisma.user.findUnique({
      where: {
        id: userId,
      },
    })
  },
})
