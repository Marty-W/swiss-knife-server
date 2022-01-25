import { nonNull, objectType, queryField, stringArg } from 'nexus';

export const User = objectType({
	name: 'User',
	definition(t) {
		t.nonNull.string('id'),
			t.nonNull.string('email'),
			t.nonNull.string('password'),
			t.list.field('tasks', {
				type: 'Task',
				resolve({ id }, _, { prisma }) {
					return prisma.user
						.findUnique({
							where: {
								id: id,
							},
						})
						.tasks()
				},
			})
	},
})

export const UserQuery = queryField('user', {
	type: 'User',
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
