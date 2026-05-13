import { DatePipe } from '@angular/common';
import { Component, computed, inject, input, output } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { IntlDurationPipe } from '@app/shared/pipes/intl-duration.pipe';
import { AuthService } from '@app/shared/services/auth.service';
import { TimeReport } from '@app/shared/types/models/reports/time-report';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'task-time-report-card',
  imports: [IntlDurationPipe, DatePipe, MatMenu, MatMenuItem, TranslatePipe, MatIcon, MatMenuTrigger],
  templateUrl: './task-time-report-card.component.html'
})
export class TaskTimeReportCardComponent {
  private readonly authService = inject(AuthService);

  protected readonly isLoggedInUserReport = computed(() => {
    return this.authService.currentUser() && this.authService.currentUser().id === this.report().user()?.id;
  });
  protected editReport = output<TimeReport>();
  protected deleteReport = output<TimeReport>();

  public readonly report = input.required<TimeReport>();

  public onEditTimeReportCardClick(report: TimeReport): void {
    this.editReport.emit(report);
  }

  public onDeleteTimeReportCardClick(report: TimeReport): void {
    this.deleteReport.emit(report);
  }
}
