import { CdkMenu } from '@angular/cdk/menu';
import { UpperCasePipe } from '@angular/common';
import { Component, input, InputSignal, output, OutputEmitterRef } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { Industry } from '@app/shared/types/models/industry/industry.model';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'proffeo-industries-list',
  imports: [MatIconModule, TranslateModule, UpperCasePipe, MatMenuModule, CdkMenu],
  templateUrl: './industries-list.component.html'
})
export class IndustriesListComponent {
  public industries: InputSignal<Industry[]> = input.required<Industry[]>();

  public editIndustry: OutputEmitterRef<Industry> = output<Industry>();
  public deleteIndustry: OutputEmitterRef<Industry> = output<Industry>();
}
