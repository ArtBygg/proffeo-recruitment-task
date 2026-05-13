import { UpperCasePipe } from '@angular/common';
import { Component, computed, DestroyRef, inject, input, InputSignal, Signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { TagComponent } from '@app/shared/components/tag/tag.component';
import { ActiveProjectService } from '@app/shared/services/active-project.service';
import { DeviceService } from '@app/shared/services/shared/device.service';
import { ModalService } from '@app/shared/services/shared/modal.service';
import { TagsDataService } from '@app/shared/services/tags-data.service';
import { ModalModeEnum } from '@app/shared/types/enums/modal-mode.enum';
import { Project } from '@app/shared/types/models/project/project.model';
import { Tag, TagFormModalData } from '@app/shared/types/models/tag/tag.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { filter, switchMap } from 'rxjs';

@Component({
  selector: 'proffeo-project-tags-list',
  imports: [TagComponent, TranslateModule, UpperCasePipe, MatMenuModule, MatIconModule, MatTableModule],
  templateUrl: './project-tags-list.component.html'
})
export class ProjectTagsListComponent {
  private readonly modalService: ModalService = inject(ModalService);
  private readonly translateService: TranslateService = inject(TranslateService);
  private readonly tagsService: TagsDataService = inject(TagsDataService);
  private readonly activeProjectService: ActiveProjectService = inject(ActiveProjectService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly deviceService: DeviceService = inject(DeviceService);

  protected readonly isMobile: Signal<boolean> = this.deviceService.isMobile;

  protected readonly displayedColumns = computed(() =>
    this.isMobile() ? ['name', 'actions'] : ['name', 'description', 'actions']
  );

  protected selectedProject: Signal<Project> = this.activeProjectService.activeProject;

  public tags: InputSignal<Tag[]> = input.required();

  protected openProjectTagDeleteConfirmationModal(projectTag: Tag): void {
    this.modalService
      .openConfirmationModal({
        title: this.translateService.instant('project-tags.modals.delete-title'),
        desc: this.translateService.instant('project-tags.modals.delete-description', {
          tagName: projectTag.name
        })
      })
      .afterClosed()
      .pipe(
        filter(decision => !!decision),
        switchMap(() => this.tagsService.deleteTag(this.selectedProject()?.id, projectTag)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }

  protected openEditProjectTagModal(tag: Tag): void {
    const data: TagFormModalData = { projectTagToEdit: tag, mode: ModalModeEnum.EDIT };
    this.modalService
      .openTagFormModal(data)
      .afterClosed()
      .pipe(
        filter(result => !!result),
        switchMap(result => this.tagsService.updateTag(this.selectedProject()?.id, tag.id, result)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }
}
