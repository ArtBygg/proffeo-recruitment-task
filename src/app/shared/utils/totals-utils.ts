import moment from 'moment';

export const getHoursPercent = (task): number =>
  task.hourBudget > 0 ? Math.trunc((task.registeredHours / task.hourBudget) * 100) : 0;
export const getAmountPercent = (task): number =>
  task.amountBudget > 0 ? Math.trunc((task.registeredAmount / task.amountBudget) * 100) : 0;
export const getRemainigDays = (task): number =>
  task.dueDate ? Math.trunc(moment.duration(moment(task.dueDate).diff(Date())).asDays()) : 0;
export const getRemainigDaysPercent = (task): number =>
  getTaskDays(task) !== 0 ? Math.trunc((getRemainigDays(task) / getTaskDays(task)) * 100) : 0;
export const getTaskDays = (task): number =>
  task.dueDate ? Math.trunc(moment.duration(moment(task.dueDate).diff(task.activatedAt)).asDays()) : 0;
