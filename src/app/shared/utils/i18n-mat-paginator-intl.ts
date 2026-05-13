import { DestroyRef, inject, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Injectable()
export class I18nMatPaginatorIntl extends MatPaginatorIntl {
  private readonly destroyRef = inject(DestroyRef);
  private readonly translate = inject(TranslateService);
  private sub = new Subscription();

  public constructor() {
    super();
    this.rebind();
    this.translate.onLangChange.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.rebind());
    this.translate
      .get('placeholders.items-per-page')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.rebind());
  }

  private rebind(): void {
    this.itemsPerPageLabel = this.translate.instant('placeholders.items-per-page');
    this.nextPageLabel = this.translate.instant('placeholders.pagination-next') || 'Next page';
    this.previousPageLabel = this.translate.instant('placeholders.pagination-prev') || 'Previous page';
    this.firstPageLabel = this.translate.instant('placeholders.pagination-first') || 'First page';
    this.lastPageLabel = this.translate.instant('placeholders.pagination-last') || 'Last page';

    this.getRangeLabel = (page: number, pageSize: number, length: number): string => {
      if (length === 0 || pageSize === 0) {
        return this.translate.instant('placeholders.pagination-range-empty', { value: length });
      }
      const start = page * pageSize;
      const end = Math.min(start + pageSize, length);

      return this.translate.instant('placeholders.pagination-range', {
        start: start + 1,
        end,
        length
      });
    };

    this.changes.next();
  }
}
