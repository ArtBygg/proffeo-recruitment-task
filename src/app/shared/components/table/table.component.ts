import { CdkTableDataSourceInput } from '@angular/cdk/table';
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  HostListener,
  inject,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
  Signal
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { DeviceService } from '@app/shared/services/shared/device.service';
import { SortDirection } from '@app/shared/types/enums/sort-direction.enum';
import { DropdownItem } from '@app/shared/types/models/shared/dropdown-item';
import { TableColumn } from '@app/shared/types/models/shared/table-column';
import { TableRowBase } from '@app/shared/types/models/shared/table-row-base';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'proffeo-table',
  imports: [MatTableModule, CommonModule, MatSortModule, MatIconModule, TranslateModule],
  templateUrl: './table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableComponent<T extends TableRowBase> {
  private translateService = inject(TranslateService);
  private touchStartX = 0;
  private touchStartY = 0;

  protected deviceService = inject(DeviceService);
  protected scrollDirection: 'horizontal' | 'vertical' | null = null;

  protected currentSort = computed(() => ({
    active: this.currentSortColumn(),
    direction: this.getMatSortDirection()
  }));

  // move identifier to the start in the list
  protected sortedColumns = computed(() => {
    const cols = this.columns();
    if (!cols || !Array.isArray(cols)) {
      return [];
    }

    const colsCopy = [...cols];
    const identifierCol = colsCopy.find(col => col.isIdentifier);

    if (identifierCol) {
      const filteredCols = colsCopy.filter(col => !col.isIdentifier);
      return [identifierCol, ...filteredCols];
    }

    return colsCopy;
  });

  // #region agent log
  protected displayedColumns = computed(() => {
    const keys = this.sortedColumns().map(col => col.key);
    const hasUndefined = keys.some(k => k === undefined);
    fetch('http://127.0.0.1:7693/ingest/feb5380b-3e16-429c-bfcb-68e8dd8b3376', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '98aa78' },
      body: JSON.stringify({
        sessionId: '98aa78',
        location: 'table.component.ts:displayedColumns',
        message: 'proffeo-table displayedColumns',
        data: { length: keys.length, hasUndefined, isArray: Array.isArray(keys), keys: keys.slice(0, 5) },
        timestamp: Date.now(),
        hypothesisId: 'A'
      })
    }).catch(() => {});
    return keys.filter((k): k is string => k != null && k !== '');
  });
  // #endregion

  protected sortedData: Signal<CdkTableDataSourceInput<unknown>> = computed(() => {
    if (this.loading()) {
      return Array(30)
        .fill({})
        .map((_, i) => ({ id: `skeleton-${i}`, skeleton: true }));
    }
    return this.data();
  });

  public data: InputSignal<T[]> = input.required<T[]>();
  public columns: InputSignal<TableColumn[]> = input.required<TableColumn[]>();
  public currentSortColumn: InputSignal<string> = input<string>('');
  public currentSortDirection: InputSignal<SortDirection> = input<SortDirection>(SortDirection.DESC);
  public loading: InputSignal<boolean> = input<boolean>(false);
  public fillHeight: InputSignal<boolean> = input<boolean>(false);
  public sortChange: OutputEmitterRef<{ column: string; direction: SortDirection }> = output<{
    column: string;
    direction: SortDirection;
  }>();
  public rowClick: OutputEmitterRef<T> = output<T>();
  public selectedRow: InputSignal<T | null> = input<T | null>(null);

  @HostListener('touchstart', ['$event'])
  public onTouchStart(event: TouchEvent): void {
    const touch = event.touches[0];
    this.touchStartX = touch.clientX;
    this.touchStartY = touch.clientY;
    this.scrollDirection = null;
  }

  @HostListener('touchmove', ['$event'])
  public onTouchMove(event: TouchEvent): void {
    if (!this.scrollDirection) {
      const touch = event.touches[0];
      const deltaX = Math.abs(touch.clientX - this.touchStartX);
      const deltaY = Math.abs(touch.clientY - this.touchStartY);

      if (deltaX > 10 || deltaY > 10) {
        this.scrollDirection = deltaX > deltaY ? 'horizontal' : 'vertical';
      }
    }
  }

  @HostListener('touchend')
  public onTouchEnd(): void {
    this.scrollDirection = null;
  }

  public sortData(sort: Sort): void {
    const direction = sort.direction === 'asc' ? SortDirection.ASC : SortDirection.DESC;
    const column = this.columns().find(col => col.key === sort.active);
    if (!column || column.sortable === false) {
      return;
    }
    this.sortChange.emit({
      column: sort.active,
      direction: direction
    });
  }

  public getCellValue(element: T, column: TableColumn): string {
    if (!element || element === null) {
      return '';
    }
    if (column.renderFn) {
      try {
        return column.renderFn(element);
      } catch {
        return '';
      }
    }
    if (column.key.includes('.')) {
      const nestedValue = this.getNestedValue(element, column.key);
      return nestedValue?.toString() || '';
    }
    return element[column.key]?.toString() || '';
  }

  public getSortableColumns(): DropdownItem<string>[] {
    return this.columns()
      .filter(col => col.sortable !== false)
      .map(col => ({
        value: col.key,
        label: col.label
      }));
  }

  public getMatSortDirection(): 'asc' | 'desc' | '' {
    const direction = this.currentSortDirection();
    if (!this.currentSortColumn()) {
      return '';
    }

    switch (direction) {
      case SortDirection.ASC:
        return 'asc';
      case SortDirection.DESC:
        return 'desc';
      default:
        return '';
    }
  }

  public getSortDirections(): DropdownItem<SortDirection>[] {
    return [
      {
        value: SortDirection.ASC,
        label: this.translateService.instant('project-tasks.list.sort.direction.asc')
      },
      {
        value: SortDirection.DESC,
        label: this.translateService.instant('project-tasks.list.sort.direction.desc')
      }
    ];
  }

  public onMobileSortChange(column: string, direction: SortDirection): void {
    this.sortChange.emit({ column, direction });
  }

  public getCurrentSortColumn(): string {
    return this.currentSort().active;
  }

  public getCurrentSortDirection(): SortDirection {
    return this.currentSortDirection();
  }

  public selectRow(row: T): void {
    this.rowClick.emit(row);
  }

  private getNestedValue(obj: T, path: string): unknown {
    return path.split('.').reduce<unknown>((current, key) => {
      if (current == null) return null;

      if (typeof current === 'function') {
        return (current as () => unknown)();
      }

      const record = current as Record<string, unknown>;
      let nextValue = record[key];

      if (typeof nextValue === 'function') {
        nextValue = (nextValue as () => unknown)();
      }

      return nextValue;
    }, obj as unknown);
  }
}
