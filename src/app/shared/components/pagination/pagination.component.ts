import { Component, input, InputSignal, output, ViewEncapsulation, WritableSignal } from '@angular/core';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { AvailablePageLimits } from '@app/shared/types/enums/pagination.enum';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'proffeo-pagination',
  imports: [MatPaginatorModule, TranslateModule],
  templateUrl: './pagination.component.html',
  styleUrl: 'pagination.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class PaginationComponent {
  protected availableLimits: number[] = [
    AvailablePageLimits.TWENTY_FIVE,
    AvailablePageLimits.FIFTY,
    AvailablePageLimits.SEVENTY_FIVE,
    AvailablePageLimits.HUNDRED
  ];

  public readonly paginationChanged = output<PageEvent>();
  public readonly page = input.required<WritableSignal<number>>();
  public readonly limit = input.required<WritableSignal<number>>();
  public total: InputSignal<number> = input.required<number>();

  protected paginationChange(pageEvent: PageEvent): void {
    this.paginationChanged.emit(pageEvent);
    this.page().update(() => pageEvent.pageIndex);
    this.limit().update(() => pageEvent.pageSize);
  }
}
