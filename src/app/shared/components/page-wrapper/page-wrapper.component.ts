import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  input,
  InputSignal,
  ViewChild
} from '@angular/core';
import { environment } from '@env/environment';
import { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';

@Component({
  templateUrl: './page-wrapper.component.html',
  selector: 'proffeo-page-wrapper',
  imports: [BreadcrumbComponent]
})
export class PageWrapperComponent implements AfterViewInit {
  @ViewChild('headerContent') public headerContent?: ElementRef;

  private readonly changeDetectionRef: ChangeDetectorRef = inject(ChangeDetectorRef);

  protected hasHeader: boolean = false;
  protected currentApplicationVersion = environment.appVersion;

  public readonly title = input<string>('Example Title');
  public readonly hideHeader: InputSignal<boolean> = input<boolean>(false);

  public ngAfterViewInit(): void {
    if (this.headerContent && this.headerContent.nativeElement.children.length > 0) {
      this.hasHeader = true;
      this.changeDetectionRef.detectChanges();
    }
  }
}
