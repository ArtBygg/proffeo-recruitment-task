# TASK PARTICIPANTS ASSIGNMENTS

`TaskParticipant` is a model for every `ProjectParticipant` assigned to a task.

There are three levels on which Tasks in the app can have users assigned:

1. Industry Admin
2. Group Admin
3. Project Participants from assigned group

Whenever we're assigning a `ProjectParticipant` to a Task, new instance of `TaskParticipant` object is created, that consists of a signal with the chosen `ProjectParticipant` inside.

Assigning an industry or a group to a task basically means assigning the **admin** of that industry/group as a new `TaskParticipant` of that task, responsible for specific area (industry or a group).

## INDUSTRY ADMIN

We can choose tasks's industry through either `task-industry-select` component in the task or through `task-user-assignees` component, by clicking on the industry admin avatar icon. Both of these components open `SelectIndustryModalComponent`. So, through selecting an industry for a task (industry from task's `Project`, that has an admin already assigned to it), we're selecting a `ProjectParticipant` responsible for it.

Industry and group selection for a task is independent, meaning that changing group doesn't influence chosen industry. Though, the idea for the future is that only assigned industry admin will have a permission to change task's assigned group.

## GROUP ADMIN

When task has Industry Admin assigned, only then it is possible to choose a `Group` for a task. Groups that can be selected come from task's `Project`.

## PROJECT PARTICIPANTS

When the `Group` for a task is selected, we can add/remove `Project Participants` that belong to that group.
