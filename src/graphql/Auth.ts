import "dotenv/config"

import * as bcrypt from "bcryptjs"
import * as jwt from "jsonwebtoken"
import { mutationField, nonNull, objectType, stringArg } from "nexus"

export const AuthPayload = objectType({
  name: "AuthPayload",
  definition(t) {
    t.nonNull.string("token"),
      t.nonNull.field("user", {
        type: "User",
      })
  },
})

export const SignUpMutation = mutationField("signup", {
  type: AuthPayload,
  args: {
    email: nonNull(stringArg()),
    password: nonNull(stringArg()),
  },
  async resolve(_, { email, password }, { prisma }) {
    console.log(email, password)
    const hashPass = await bcrypt.hash(password, 10)

    try {
      const user = await prisma.user.create({
        data: {
          email,
          password: hashPass,
        },
      })

      const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET!)

      return {
        token,
        user,
      }
    } catch (e) {
      //TODO add error typings
      throw new Error(e)
    }
  },
})

export const SignInMutation = mutationField("signin", {
  type: AuthPayload,
  args: {
    email: nonNull(stringArg()),
    password: nonNull(stringArg()),
  },
  async resolve(_, { email, password }, { prisma }) {
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    })

    if (!user) {
      throw new Error("No such user found! ")
    }

    const valid = await bcrypt.compare(password, user.password)

    if (!valid) {
      throw new Error("Incorrect password!")
    }

    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET!)

    return {
      token,
      user,
    }
  },
})
