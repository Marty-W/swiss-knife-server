import { compare, genSalt, hash } from 'bcryptjs'
import * as jwt from 'jsonwebtoken'
import { builder } from '../builder'
import { prisma } from '../db'

builder.prismaObject('User', {
  fields: (t) => ({
    id: t.exposeID('id', {
      description: 'The id of the user',
    }),
    email: t.exposeString('email', {
      description: 'The email of the user',
    }),
    allTasks: t.relation('tasks'),
    allTaskCount: t.relationCount('tasks'),
  }),
})

builder.queryField('user', (t) =>
  t.withAuth({ loggedIn: true }).prismaField({
    type: 'User',
    nullable: true,
    resolve: async (query, _, args, { userId }) => {
      return prisma.user.findUniqueOrThrow({
        ...query,
        where: {
          id: userId,
        },
      })
    },
  })
)

const AuthInput = builder.inputType('AuthInput', {
  fields: (t) => ({
    email: t.string({ required: true }),
    password: t.string({ required: true }),
  }),
})

const AuthPayload = builder.simpleObject('AuthPayload', {
  fields: (t) => ({
    email: t.string(),
    id: t.string(),
    token: t.string(),
  }),
})

builder.mutationFields((t) => ({
  signUp: t.field({
    type: AuthPayload,
    args: {
      input: t.arg({ type: AuthInput, required: true }),
    },
    resolve: async (_, { input }) => {
      const { password, email } = input

      const saltRounds = 5

      const salt = await genSalt(saltRounds)
      const hashPass = await hash(password, salt)

      const user = await prisma.user.create({
        data: {
          email,
          password: hashPass,
        },
      })

      const token = jwt.sign({ id: user.id }, process.env.APP_SECRET!, {
        expiresIn: '1y',
      })

      return {
        ...user,
        token,
      }
    },
  }),
  signIn: t.field({
    type: AuthPayload,
    args: {
      input: t.arg({ type: AuthInput, required: true }),
    },
    resolve: async (_, { input }) => {
      const { password, email } = input

      const user = await prisma.user.findUnique({
        where: {
          email: email,
        },
      })

      if (!user) {
        throw new Error('No such user found')
      }

      const valid = await compare(password, user.password)

      if (!valid) {
        throw new Error('Invalid credentials')
      }

      const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET!, {
        expiresIn: '1y',
      })

      return {
        ...user,
        token,
      }
    },
  }),
}))
