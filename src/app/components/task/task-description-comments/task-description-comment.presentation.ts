import { TaskDescriptionCommentAction } from '@app/shared/types/enums/task-description-comment-action.enum';
import type { Locale } from 'date-fns';
import { formatDistanceToNow } from 'date-fns';
import { da } from 'date-fns/locale/da';
import { enUS } from 'date-fns/locale/en-US';
import { hu } from 'date-fns/locale/hu';
import { lt } from 'date-fns/locale/lt';
import { lv } from 'date-fns/locale/lv';
import { nb } from 'date-fns/locale/nb';
import { pl } from 'date-fns/locale/pl';
import { ru } from 'date-fns/locale/ru';
import { sv } from 'date-fns/locale/sv';
import { tr } from 'date-fns/locale/tr';
import { uk } from 'date-fns/locale/uk';
import type { TaskDescriptionCommentRow } from './task-description-comment-row.types';

export function localeForLang(lang: string): Locale {
  const map: Record<string, Locale> = {
    'en-US': enUS,
    'da-DK': da,
    'nb-NO': nb,
    'sv-SE': sv,
    'pl-PL': pl,
    'lt-LT': lt,
    'lv-LV': lv,
    'hu-HU': hu,
    'uk-UA': uk,
    'ru-RU': ru,
    tr: tr
  };
  return map[lang] ?? enUS;
}

export function formatTaskDescriptionCommentRelativeTime(date: Date | undefined, lang: string): string {
  if (!date) {
    return '';
  }
  const locale = localeForLang(lang);
  return formatDistanceToNow(date, { addSuffix: true, locale });
}

export function presentationForTaskDescriptionCommentAction(
  action: TaskDescriptionCommentAction
): Omit<TaskDescriptionCommentRow, 'comment' | 'user' | 'relativeTime'> {
  switch (action) {
    case TaskDescriptionCommentAction.Accept:
      return {
        badgeKey: 'task-description-comments.action.accept',
        cardClass: 'bg-emerald-50 border border-emerald-200/80',
        badgeClass: 'bg-emerald-600 text-white',
        badgeIcon: 'check',
        contentClass: 'text-emerald-950'
      };
    case TaskDescriptionCommentAction.Reject:
      return {
        badgeKey: 'task-description-comments.action.reject',
        cardClass: 'bg-rose-50 border border-rose-200/80',
        badgeClass: 'bg-rose-600 text-white',
        badgeIcon: 'close',
        contentClass: 'text-rose-950'
      };
    case TaskDescriptionCommentAction.RequestChanges:
      return {
        badgeKey: 'task-description-comments.action.request-changes',
        cardClass: 'bg-amber-50 border border-amber-200/80',
        badgeClass: 'bg-amber-500 text-white',
        badgeIcon: 'edit_note',
        contentClass: 'text-amber-950'
      };
    case TaskDescriptionCommentAction.ReadyForReview:
      return {
        badgeKey: 'task-description-comments.action.ready-for-review',
        cardClass: 'bg-slate-50 border border-slate-200/80',
        badgeClass: 'bg-slate-600 text-white',
        badgeIcon: 'done_all',
        contentClass: 'text-slate-900'
      };
    case TaskDescriptionCommentAction.Save:
    default:
      return {
        badgeKey: 'task-description-comments.action.save',
        cardClass: 'bg-sky-50 border border-sky-200/80',
        badgeClass: 'bg-sky-700 text-white',
        badgeIcon: 'chat',
        contentClass: 'text-sky-950'
      };
  }
}
