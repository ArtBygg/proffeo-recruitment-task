import { ComponentType } from '@angular/cdk/overlay';
import { DestroyRef, inject, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import {
  CarouselModalComponent,
  CarouselModalData
} from '@app/components/modals/carousel-modal/carousel-modal.component';
import {
  CreateTaskModalComponent,
  CreateTaskModalData,
  CreateTaskModalResultData
} from '@app/components/modals/create-task-modal/create-task-modal.component';
import {
  EstimationModalComponent,
  EstimationModalData
} from '@app/components/modals/estimation-modal/estimation-modal.component';
import { SelectGroupsModalData } from '@app/components/modals/select-groups-modal/select-groups-modal-data';
import { SelectGroupsModalComponent } from '@app/components/modals/select-groups-modal/select-groups-modal.component';
import { SelectIndustryModalComponent } from '@app/components/modals/select-industry-modal/select-industry-modal.component';
import {
  SelectMultipleLocationsModalComponent,
  SelectMultipleLocationsModalData,
  SelectMultipleLocationsModalResult
} from '@app/components/modals/select-multiple-locations-modal/select-multiple-locations-modal.component';
import {
  MultipleProjectParticipantsModalData,
  MultipleProjectParticipantsResultData,
  SelectMultipleProjectParticipantsModalComponent
} from '@app/components/modals/select-multiple-project-participants-modal/select-multiple-project-participants-modal.component';
import { SelectSingleLocationModalComponent } from '@app/components/modals/select-single-location-modal/select-single-location-modal.component';
import {
  SelectTagsModalComponent,
  SelectTagsModalData
} from '@app/components/modals/select-tags-modal/select-tags-modal.component';
import {
  UserRoleFilterModalComponent as SelectUserRoleModalComponent,
  SelectUserRoleModalData
} from '@app/components/modals/select-user-role-modal/select-user-role-modal.component';
import {
  TagFormModalComponent,
  TagFormModalResult
} from '@app/components/modals/tag-form-modal/tag-form-modal.component';
import { SelectIndustryAdminModalComponent } from '@app/components/project-industries/select-industry-admin-modal/select-industry-admin-modal.component';
import { TaskDetailsPdfModalComponent } from '@app/components/task/task-details-pdf-modal/task-details-pdf-modal.component';
import { TimeReportModalComponent } from '@app/components/time-reports/time-report-modal/time-report-modal.component';
import { ChangeUserPasswordModalComponent } from '@app/components/user/change-user-password-modal/change-user-password-modal.component';
import { ConfirmationModalComponent } from '@app/shared/components/confirmation-modal/confirmation-modal.component';
import { InformationModalComponent } from '@app/shared/components/information-modal/information-modal.component';
import { DeviceService } from '@app/shared/services/shared/device.service';
import { Group } from '@app/shared/types/models/group/group.model';
import { Industry } from '@app/shared/types/models/industry/industry.model';
import { Location, SelectSingleLocationModalData } from '@app/shared/types/models/location/location.model';
import {
  SelectIndustryAdminModalData,
  SelectIndustryAdminModalRequest,
  SelectIndustryModalData
} from '@app/shared/types/models/project-industry/project-industry.model';
import { TimeReport, TimeReportType } from '@app/shared/types/models/reports/time-report';
import { BasicModalData } from '@app/shared/types/models/shared/confirmation-modal.model';
import { Tag, TagFormModalData } from '@app/shared/types/models/tag/tag.model';
import { TaskEstimation } from '@app/shared/types/models/task/task-estimation';
import { TaskUserRoleFilter } from '@app/shared/types/models/task/task-filters.model';
import { Task } from '@app/shared/types/models/task/task.model';
import { User } from '@app/shared/types/models/user/user.model';

@Injectable({ providedIn: 'root' })
export class ModalService {
  private readonly matDialog: MatDialog = inject(MatDialog);
  private readonly deviceService: DeviceService = inject(DeviceService);
  private readonly destroyRef: DestroyRef = inject(DestroyRef);

  public openChangePasswordModal(): void {
    this.openDialog(ChangeUserPasswordModalComponent, { width: '400px' });
  }

  public openConfirmationModal(data: BasicModalData): MatDialogRef<ConfirmationModalComponent, boolean> {
    return this.openDialog(ConfirmationModalComponent, { data, autoFocus: 'dialog' });
  }

  public openInformationModal(data: BasicModalData): MatDialogRef<InformationModalComponent> {
    return this.openDialog(InformationModalComponent, { data });
  }

  public openTagFormModal(data: TagFormModalData): MatDialogRef<TagFormModalComponent, TagFormModalResult> {
    return this.openDialog(TagFormModalComponent, { data, width: '400px' });
  }

  public opensSelectIndustryAdminModal(
    preselectedUser: User
  ): MatDialogRef<SelectIndustryAdminModalComponent, SelectIndustryAdminModalRequest> {
    const data: SelectIndustryAdminModalData = {
      preselectedUser: preselectedUser
    };
    return this.openDialog(SelectIndustryAdminModalComponent, { data, width: '400px' });
  }

  public openSelectIndustryModal(
    data: SelectIndustryModalData
  ): MatDialogRef<SelectIndustryModalComponent, Industry | Industry[]> {
    return this.openDialog(SelectIndustryModalComponent, {
      data,
      width: this.deviceService.isMobile() ? '95vw' : '600px',
      maxWidth: this.deviceService.isMobile() ? '95vw' : '600px'
    });
  }
  public openTimeReportModal(
    task?: Task,
    timeReport?: TimeReport,
    correlationId?: string,
    timeReportType: TimeReportType = 'WorkTime',
    // for refreshing reports store after adding new report
    dateFrom?: Date,
    dateTo?: Date
  ): MatDialogRef<TimeReportModalComponent, Task> {
    return this.openDialog(TimeReportModalComponent, {
      panelClass: 'task-modal',
      width: this.deviceService.isMobile() ? '95vw' : '600px',
      maxWidth: this.deviceService.isMobile() ? '95vw' : '600px',
      height: 'auto',
      maxHeight: '95vh',
      data: {
        timeReport,
        task,
        project: task?.project(),
        correlationId: correlationId,
        timeReportType: timeReportType,
        dateFrom,
        dateTo
      }
    });
  }

  public openTimerModal(task: Task): MatDialogRef<TimeReportModalComponent, boolean> {
    return this.openDialog(TimeReportModalComponent, {
      panelClass: 'task-modal',
      width: this.deviceService.isMobile() ? '95vw' : '600px',
      maxWidth: this.deviceService.isMobile() ? '95vw' : '600px',
      height: 'auto',
      maxHeight: '95vh',
      data: {
        task,
        onlyTimerMode: true
      }
    });
  }

  public openGenerateTaskPdfModal(task: Task): MatDialogRef<TaskDetailsPdfModalComponent, Task> {
    return this.openDialog(TaskDetailsPdfModalComponent, {
      panelClass: 'task-modal',
      width: this.deviceService.isMobile() ? '95vw' : '800px',
      height: 'auto',
      maxHeight: '95vh',
      data: {
        task
      }
    });
  }

  public openSelectMultipleLocationsModal(
    data: SelectMultipleLocationsModalData
  ): MatDialogRef<SelectMultipleLocationsModalComponent, SelectMultipleLocationsModalResult> {
    return this.openDialog(SelectMultipleLocationsModalComponent, {
      data,
      width: '600px'
    });
  }

  public openSelectGroupsModal(
    data: SelectGroupsModalData
  ): MatDialogRef<SelectGroupsModalComponent, Group[] | undefined> {
    return this.matDialog.open(SelectGroupsModalComponent, { data, width: '800px' });
  }

  public openSelectUserRoleModal(
    data: SelectUserRoleModalData
  ): MatDialogRef<SelectUserRoleModalComponent, TaskUserRoleFilter[]> {
    return this.openDialog(SelectUserRoleModalComponent, { data, width: '400px' });
  }

  public openSelectSingleLocationModal(
    data: SelectSingleLocationModalData
  ): MatDialogRef<SelectSingleLocationModalComponent, Location | undefined> {
    return this.openDialog(SelectSingleLocationModalComponent, { data, width: '600px' });
  }

  public openEstimationModal(
    data: EstimationModalData
  ): MatDialogRef<EstimationModalComponent, TaskEstimation | undefined> {
    return this.openDialog(EstimationModalComponent, { data, width: '600px' });
  }

  public openSelectMultipleProjectParticipantsModal(
    data: MultipleProjectParticipantsModalData
  ): MatDialogRef<SelectMultipleProjectParticipantsModalComponent, MultipleProjectParticipantsResultData | undefined> {
    return this.openDialog(SelectMultipleProjectParticipantsModalComponent, {
      data,
      width: '500px'
    });
  }

  public openSelectTagsModal(data: SelectTagsModalData): MatDialogRef<SelectTagsModalComponent, Tag[]> {
    return this.openDialog(SelectTagsModalComponent, { data, width: '400px' });
  }


  public openCreateTaskModal(
    data: CreateTaskModalData
  ): MatDialogRef<CreateTaskModalComponent, CreateTaskModalResultData> {
    return this.openDialog(CreateTaskModalComponent, {
      data,
      minWidth: this.deviceService.isMobile() ? '95dvw' : '700px',
      maxHeight: this.deviceService.isMobile() ? '95dvh' : 'auto'
    });
  }

  public openCarouselModal(data: CarouselModalData): MatDialogRef<CarouselModalComponent, void> {
    const isMobile = this.deviceService.isMobile();

    return this.openDialog(CarouselModalComponent, {
      data,
      minHeight: isMobile ? '95dvh' : '90vh',
      height: isMobile ? '95dvh' : '90vh',
      minWidth: isMobile ? '95dvw' : '75vw',
      width: isMobile ? '95dvw' : '75vw'
    });
  }

  private openDialog<T, R>(component: ComponentType<T>, config?: MatDialogConfig): MatDialogRef<T, R> {
    const dialogRef = this.matDialog.open(component, config);

    dialogRef.keydownEvents().subscribe(event => {
      if (event.key === 'Escape') {
        event.stopPropagation();
      }
    });

    if (!history.state?.dialogIds) {
      history.replaceState({ dialogIds: [dialogRef.id] }, '');
    } else {
      history.state.dialogIds.push(dialogRef.id);
    }

    const onPopState = (): void => dialogRef.close();
    window.addEventListener('popstate', onPopState);
    dialogRef
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        window.removeEventListener('popstate', onPopState);

        const index = history.state.dialogIds?.indexOf(dialogRef.id);

        if (index > 0) {
          history.state.dialogIds.splice(index, 1);
        }
      });
    return dialogRef;
  }
}
