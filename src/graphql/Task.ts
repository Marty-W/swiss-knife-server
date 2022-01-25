import { list, mutationField, nonNull, objectType, stringArg } from 'nexus';

export const Task = objectType({
	name: 'Task',
	definition(t) {
		t.nonNull.string('title', { description: 'Text of the task' }),
			t.nonNull.boolean('completed', {
				description: 'True if the task has been completed',
			}),
			t.nonNull.date('createdAt', {
				description: 'When the task was created, in ISO format',
			}),
			t.field('createdBy', {
				type: 'User',
				description: 'User that created the task',
			})
		t.nonNull.string('byUserId', {
			description: 'Id of the User that created the task',
		})
	},
})

export const CreateNewTask = mutationField('CreateNewTask', {
	type: list('Task'),
	args: {
		title: nonNull(stringArg()),
	},
	resolve: async (_, { title }, { prisma, userId }) => {
		if (!userId) {
			throw new Error(`You can't create tasks without logging in`)
		}

		await prisma.task.create({
			data: { title: title, byUser: { connect: { id: userId } } },
		})

		const allTasks = prisma.user.findUnique({ where: { id: userId } }).tasks()

		return allTasks
	},
})
