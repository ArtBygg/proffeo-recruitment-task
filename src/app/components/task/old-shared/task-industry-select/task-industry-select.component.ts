import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Industry } from '@app/shared/types/models/industry/industry.model';
import { TranslateModule } from '@ngx-translate/core';

export type TaskIndustrySelectMode = 'row' | 'column';

@Component({
  selector: 'proffeo-task-industry-select',
  templateUrl: './task-industry-select.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule, MatIconModule],
  host: {
    class: 'flex items-center gap-1 min-w-0'
  }
})
export class TaskIndustrySelectComponent {
  public readonly projectIndustry = input.required<Industry>();
  public readonly isReadonly = input<boolean>(false);
  public readonly minimalMode = input<boolean>(false);
  public readonly showIcon = input<boolean>(true);
  public readonly isSmallText = input<boolean>(false);

  public readonly industryClicked = output<void>();

  protected clicked(): void {
    if (this.isReadonly()) return;
    this.industryClicked.emit();
  }
}
