import { Signal } from '@angular/core';
import { SelectMode } from '@app/shared/types/enums/select-mode.enum';
import { Group } from '@app/shared/types/models/group/group.model';

/**
 * Modal input for picking groups. When `allowHierarchy` is false, only the passed
 * `groups` list is shown as a flat list (no expansion into store children); default is tree mode.
 */
export interface SelectGroupsModalData {
  groups: Signal<Group[]>;
  lockedGroups: Group[];
  selectedGroups?: Group[];
  selectionMode?: SelectMode;
  /** When false, show `groups` only as a flat list with no expand/chevron. Default: true (tree). */
  allowHierarchy?: boolean;
}
