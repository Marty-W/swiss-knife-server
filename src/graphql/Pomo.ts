import { objectType } from "nexus"

export const PomodoroSession = objectType({
  name: "PomodoroSession",
  definition(t) {
    t.nonNull.string("id", { description: "Id of the pomodoro session" })
    t.nonNull.string("byUserId", {
      description: "Id of the user that created the session",
    })
    t.nonNull.date("startTime", {
      description: "When the pomodoro started, in ISO format",
    })
    t.date("endTime", {
      description: "When the session should end,  in ISO format",
    })
    t.nonNull.int("assumedDuration"), t.nonNull.int("actualDuration")
  },
})
