import type { Prisma, Task, PomodoroSession, User } from "@prisma/client";
export default interface PrismaTypes {
    Task: {
        Name: "Task";
        Shape: Task;
        Include: Prisma.TaskInclude;
        Select: Prisma.TaskSelect;
        OrderBy: Prisma.TaskOrderByWithRelationInput;
        WhereUnique: Prisma.TaskWhereUniqueInput;
        Where: Prisma.TaskWhereInput;
        RelationName: "user";
        ListRelations: never;
        Relations: {
            user: {
                Shape: User;
                Types: PrismaTypes["User"];
            };
        };
    };
    PomodoroSession: {
        Name: "PomodoroSession";
        Shape: PomodoroSession;
        Include: Prisma.PomodoroSessionInclude;
        Select: Prisma.PomodoroSessionSelect;
        OrderBy: Prisma.PomodoroSessionOrderByWithRelationInput;
        WhereUnique: Prisma.PomodoroSessionWhereUniqueInput;
        Where: Prisma.PomodoroSessionWhereInput;
        RelationName: "user";
        ListRelations: never;
        Relations: {
            user: {
                Shape: User;
                Types: PrismaTypes["User"];
            };
        };
    };
    User: {
        Name: "User";
        Shape: User;
        Include: Prisma.UserInclude;
        Select: Prisma.UserSelect;
        OrderBy: Prisma.UserOrderByWithRelationInput;
        WhereUnique: Prisma.UserWhereUniqueInput;
        Where: Prisma.UserWhereInput;
        RelationName: "tasks" | "pomodoroSessions";
        ListRelations: "tasks" | "pomodoroSessions";
        Relations: {
            tasks: {
                Shape: Task[];
                Types: PrismaTypes["Task"];
            };
            pomodoroSessions: {
                Shape: PomodoroSession[];
                Types: PrismaTypes["PomodoroSession"];
            };
        };
    };
}