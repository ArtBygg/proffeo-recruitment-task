import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ModalComponent } from '@app/shared/components/modal/modal.component';
import { GroupsDataService } from '@app/shared/services/groups-data.service';
import { SelectMode } from '@app/shared/types/enums/select-mode.enum';
import { Group } from '@app/shared/types/models/group/group.model';
import { TranslateModule } from '@ngx-translate/core';
import { map, startWith } from 'rxjs/operators';
import { SelectGroupsModalData } from './select-groups-modal-data';
import { SelectGroupsTreeNodeComponent } from './select-groups-tree-node/select-groups-tree-node.component';

@Component({
  selector: 'proffeo-select-groups-modal',
  standalone: true,
  templateUrl: './select-groups-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ModalComponent,
    TranslateModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    SelectGroupsTreeNodeComponent
  ]
})
export class SelectGroupsModalComponent implements OnInit {
  private readonly dialogRef = inject(MatDialogRef<SelectGroupsModalComponent, Group[] | undefined>);
  private readonly groupsData = inject(GroupsDataService);

  private readonly rootGroups = computed(() => {
    const list = (this.dialogData.groups() ?? []).filter((g): g is Group => g != null);
    if (list.length === 0) {
      return [];
    }
    const ids = new Set(list.map(g => g.id));
    return list.filter(g => !g.parentGroupId || !ids.has(g.parentGroupId));
  });

  protected readonly dialogData: SelectGroupsModalData = inject(MAT_DIALOG_DATA);
  protected readonly searchControl = new FormControl('', { nonNullable: true });
  protected readonly searchLower = toSignal(
    this.searchControl.valueChanges.pipe(
      startWith(this.searchControl.value),
      map(v => v.trim().toLowerCase())
    ),
    { initialValue: '' }
  );

  protected readonly expandedIds: WritableSignal<Set<string>> = signal(new Set());
  protected readonly selectedIds: WritableSignal<Set<string>> = signal(new Set());

  protected readonly selectionMode: SelectMode = this.dialogData.selectionMode ?? SelectMode.MULTIPLE;

  protected readonly allowHierarchy: boolean = this.dialogData.allowHierarchy ?? true;

  protected readonly lockedIds = computed(() => new Set(this.dialogData.lockedGroups.map(g => g.id)));

  protected readonly displayGroups = computed(() => {
    if (this.allowHierarchy) {
      return this.rootGroups();
    }
    return (this.dialogData.groups() ?? []).filter((g): g is Group => g != null);
  });

  protected readonly selectedCount = computed(() => this.selectedIds().size);

  protected readonly firstSelectedGroupName = computed(() => {
    const firstId = this.selectedIds().values().next().value as string | undefined;
    if (!firstId) {
      return '';
    }
    return this.groupsData.getById(firstId)()?.name ?? '';
  });

  protected readonly SelectMode = SelectMode;

  public ngOnInit(): void {
    const initial = new Set<string>();
    for (const g of this.dialogData.lockedGroups ?? []) {
      initial.add(g.id);
    }
    for (const g of this.dialogData.selectedGroups ?? []) {
      initial.add(g.id);
    }
    this.selectedIds.set(initial);
  }

  protected confirm(): void {
    const result: Group[] = [];
    for (const id of this.selectedIds()) {
      const g = this.groupsData.getById(id)();
      if (g) {
        result.push(g);
      }
    }
    this.dialogRef.close(result);
  }
}
