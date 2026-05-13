import { Component, input } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'proffeo-modal',
  imports: [RouterModule, MatIconModule, MatDialogModule],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent {
  public readonly title = input<string>('');
  public readonly hideDefaultTitle = input(false);
}
