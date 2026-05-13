import { inject, Injectable, Injector } from '@angular/core';
import { TimeReport } from '@app/shared/types/models/reports/time-report';
import { TimeReportDTO } from '../../dtos/reports/time-report.dto';
import { WorkTimeReportDTO } from '../../dtos/reports/work-time-report.dto';
import { AbstractFactory } from '../abstract.factory';
import { WorkTimeReportFactory } from './work-time-report.factory';

@Injectable({ providedIn: 'root' })
export class TimeReportFactory extends AbstractFactory<TimeReportDTO, TimeReport> {
  private readonly injector: Injector = inject(Injector);
  private readonly workTimeReportFactory = this.injector.get(WorkTimeReportFactory);

  public constructor() {
    super();
  }

  public produce(item: TimeReportDTO): TimeReport {
    switch (item.type) {
      case 'WorkTimeReport':
        return this.workTimeReportFactory.produce(item as WorkTimeReportDTO);
      default:
        throw Error('Unrecognized Report type');
    }
  }
}
