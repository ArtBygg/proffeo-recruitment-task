import { Injectable } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { TimeReportType } from '@app/shared/types/models/reports/time-report';
import { TimePickerType } from '@app/shared/types/models/time-picker-type.type';
import { AbstractBaseFormBuilder } from '@app/shared/utils/abstract-base-form-builder';
import moment from 'moment';

@Injectable()
export class TimeReportFormBuilder extends AbstractBaseFormBuilder {
  public createForm(): TimeReportFormBuilder {
    this._form = this._formBuilder.group({
      date: [moment().startOf('day'), Validators.required],
      description: ['', Validators.required],
      reportType: ['WorkTime' as TimeReportType, Validators.nullValidator],
      hoursType: ['Auto'],
      files: ['', Validators.nullValidator],
      timeFrom: [this.getDateDefaultValue(), Validators.nullValidator],
      timeTo: [this.getDateDefaultValue(), Validators.nullValidator],
      duration: [this.getDurationDefaultValue(), Validators.nullValidator]
    });

    this.setRangeTimeReportForm(this._form);
    return this;
  }

  public setRangeTimeReportForm(form: FormGroup): void {
    form.controls['timeFrom'].enable();
    form.controls['timeFrom'].setValue(this.getDateDefaultValue());

    form.controls['timeTo'].enable();
    form.controls['timeTo'].setValue(this.getDateDefaultValue());

    form.controls['duration'].disable();
    form.controls['duration'].setValue(this.getDurationDefaultValue());
  }

  public setManualTimeReportFormTimeReportForm(form: FormGroup): void {
    form.controls['duration'].enable();
    form.controls['duration'].setValue(this.getDurationDefaultValue());

    form.controls['timeFrom'].disable();
    form.controls['timeFrom'].setValue(this.getDateEmptyValue());

    form.controls['timeTo'].disable();
    form.controls['timeTo'].setValue(this.getDateEmptyValue());
  }

  private getDateEmptyValue(): TimePickerType {
    return {
      hour: 0,
      minute: 0,
      second: 0
    };
  }

  private getDateDefaultValue(minuteStep = 5): TimePickerType {
    return {
      hour: moment().hours(),
      minute: Math.floor(moment().minutes() / minuteStep) * minuteStep,
      second: 0
    };
  }

  private getDurationDefaultValue(): TimePickerType {
    return {
      hour: 0,
      minute: 0,
      second: 0
    };
  }
}
