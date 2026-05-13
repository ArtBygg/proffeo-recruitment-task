import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  Signal,
  untracked,
  WritableSignal
} from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { AvatarsGroupComponent } from '@app/shared/components/group-avatars/proffeo-group-avatars.component';
import { GroupsDataService } from '@app/shared/services/groups-data.service';
import { AvatarSize } from '@app/shared/types/enums/avatar-size.enum';
import { SelectMode } from '@app/shared/types/enums/select-mode.enum';
import { Group } from '@app/shared/types/models/group/group.model';
import { User } from '@app/shared/types/models/user/user.model';
import { TranslateModule } from '@ngx-translate/core';
import { groupMatchesSearch, subtreeMatchesSearch } from '../select-groups-tree.utils';

@Component({
  selector: 'proffeo-select-groups-tree-node',
  standalone: true,
  host: { class: 'block min-w-0 w-full max-w-full' },
  templateUrl: './select-groups-tree-node.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass, MatIconModule, MatCheckboxModule, MatRadioModule, TranslateModule, AvatarsGroupComponent]
})
export class SelectGroupsTreeNodeComponent {
  private readonly groupsData = inject(GroupsDataService);

  protected readonly SelectMode = SelectMode;
  protected readonly AvatarSize = AvatarSize;

  protected readonly isExpanded = computed(() => this.expandedIds()().has(this.group().id));

  protected readonly groupUsers = computed<User[]>(
    () =>
      (this.group()
        ?.users()
        .map(u => u.applicationUser()) ?? []) as User[]
  );

  protected readonly childGroups: Signal<Group[]> = computed(() => {
    const signals = this.groupsData.getGroupChildren(this.group().id)() ?? [];
    return signals.map(s => s()).filter((g): g is Group => g != null);
  });

  protected readonly showChevron = computed(() => {
    if (!this.allowHierarchy()) {
      return false;
    }
    return this.group().childrenCount > 0 || this.childGroups().length > 0;
  });

  protected readonly isVisible = computed(() => {
    const group = this.group();
    const query = this.searchLower();
    if (!this.allowHierarchy()) {
      return groupMatchesSearch(group, query);
    }
    return subtreeMatchesSearch(group, query, this.groupsData);
  });

  protected readonly isLocked = computed(() => this.lockedIds().has(this.group().id));

  protected readonly isSelected = computed(() => this.selectedIds()().has(this.group().id));

  protected readonly memberCount = computed(() => this.group().users?.()?.length ?? 0);

  public readonly group = input.required<Group>();
  public readonly depth = input(0);
  public readonly selectionMode = input(SelectMode.MULTIPLE);
  public readonly allowHierarchy = input(true);
  public readonly searchLower = input('');
  public readonly lockedIds = input<ReadonlySet<string>>(new Set());
  public readonly expandedIds = input.required<WritableSignal<Set<string>>>();
  public readonly selectedIds = input.required<WritableSignal<Set<string>>>();

  protected toggleExpand(): void {
    const id = this.group().id;
    const exp = this.expandedIds();
    const next = new Set(untracked(() => exp()));
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    exp.set(next);
  }

  protected onCheckboxChange(checked: boolean): void {
    if (this.isLocked()) {
      return;
    }
    const id = this.group().id;
    const sel = this.selectedIds();
    const next = new Set(untracked(() => sel()));
    if (checked) {
      next.add(id);
    } else {
      next.delete(id);
    }
    sel.set(next);
  }

  protected onRadioSelect(): void {
    if (this.isLocked()) {
      return;
    }
    const id = this.group().id;
    this.selectedIds().set(new Set([id]));
  }
}
