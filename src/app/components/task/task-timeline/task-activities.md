# TASK ACTIVITIES

## Overview

Task Activities is a read-only audit log system that tracks and displays all changes and interactions within a task. The backend automatically generates activity records whenever task data is modified, and the frontend retrieves and displays these logs in a chronological timeline format.

## Architecture

### Data Flow

1. **Backend Responsibility**: Automatically creates activity records for all task modifications/additions
2. **Frontend Responsibility**: Fetches and displays activity data
3. **Real-time Updates**: Activities are fetched after most updates/additions made on tasks through `AppEvent` of `TaskDataChanged` type

## Activity Types Reference (`task-activities/`)

The system supports multiple activity types, each extending the base `TaskActivity` class:

| Activity Type               | Description                    | Data Payload                           |
| --------------------------- | ------------------------------ | -------------------------------------- |
| TaskCreated                 | Initial task creation          | None                                   |
| TaskStatusChanged           | Status modification            | `from`, `to` (TaskStatus)              |
| TaskPriorityChanged         | Priority update                | `from`, `to` (TaskPriority)            |
| TaskProgressChanged         | Progress percentage change     | `from`, `to` (number)                  |
| TaskBudgetEstimationChanged | Budget modification            | `from`, `to` (number)                  |
| TaskTimeEstimationChanged   | Time estimate update           | `from`, `to` (string)                  |
| TaskLocationChanged         | Location change                | `from`, `to` (Location)                |
| TaskIndustryChanged         | Industry classification update | `from`, `to` (Industry)                |
| TaskParticipantsAssigned    | Participant changes            | `participants` (TaskParticipant[])     |
| TaskFileAdded               | File attachment                | `data` (FileInfo[])                    |
| TaskMessageAdded            | Comment/message                | `message`, `files` (FileInfo[])        |
| TaskTimeReportAdded         | Time log entry                 | `duration`, `date`, `message`, `files` |
| TaskDescriptionChanged      | Description modification       | `from`, `to` (string)                  |

#### Services

**TaskActivitiesDataService**

- Manages activity data fetching and caching
- Handles real-time updates via `TaskDataChanged` events
- Provides reactive signals for component consumption

```typescript
// Fetch activities for a specific task
getTaskActivities(taskId: string): Signal<TaskActivity[]>
```

## UI Components

### TaskActivityComponent

- Main component for rendering activity groups
- Handles timeline visualization with date separators
- Groups activities by user and timestamp for message/file activities
- Displays timeline events individually

## Activity Grouping Logic

The component implements grouping:

- Date Separators: Activities are grouped by date with visual separators
- Message/File Grouping: Consecutive messages or files from the same user are grouped in a single chat bubble
- Timeline Events: Status changes, assignments, and other modifications are displayed as individual timeline items

## Visual Presentation

### Timeline Events

- Displayed with user name, action description, and timestamp
- Each activity type has its own specialized component for rendering

### Message/File Activities

- Rendered in chat-bubble style
- Grouped by user with avatar display
- Different background colors for current user vs. others
- Timestamps shown with tooltips for full date/time

## Data Structure

Each activity contains:

- `id`: Unique identifier
- `taskId`: Associated task ID
- `user`: Signal containing user information
- `date`: Timestamp of the activity
- `data`: Activity-specific payload (varies by type)

## Event Handling

The system listens for `TaskDataChanged` events to refresh activity data:

- Events trigger automatic re-fetching of activities
- Ensures timeline stays synchronized with backend state
