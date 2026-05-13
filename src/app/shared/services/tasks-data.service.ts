import { computed, inject, Injectable, Signal, signal, untracked } from '@angular/core';
import { TaskCreateData } from '@app/components/task/task-create/task-create.component';
import { TasksHttpService } from '@app/shared/services/http/tasks-http.service';
import { TaskSortField } from '@app/shared/types/enums/task-sort-field';
import { DataStore } from '@app/store/data-store';
import { IdsCollection } from '@app/store/ids-collection';
import { catchError, EMPTY, Observable, throwError } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { ProjectTaskDTO } from './dtos/project-tasks/project-task.dto';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MOCK_TASK_DTOS: any[] = [
  { id: '6a65b8bf-e9ed-42a9-98cf-85456d6b0344', name: 'Rozwijanie zadań na liście splitview', taskNumber: '118-176', status: 'REJECTED', priority: 'NORMAL', projectId: '656e918f-6b5e-463e-ad4f-1146e86617e5', taskTypeId: 'c5b7877c-f2cb-477b-b9b1-1b7268aa203f', industryId: '4b9eb51a-6471-4894-84d1-d92512520cf6', groupId: '25b1096c-8570-444f-98d0-2e8a9c5b6c73', subtasksCount: 0, percentageOfProgress: 0, isLocked: false, taskTotalTrackedSeconds: 0, timeReportWithLocation: false, description: '<ol><li><p>Podzadania powinny się rozwijać tak jak na liście głównej i mobile</p></li></ol><p></p><p>Zrobione w RE-118-194</p>', createdAt: '2026-04-08T08:36:53.329423Z', createdById: '632ceed0-5251-42a6-b5ba-f509c3afdbca', lastActivityAt: '2026-04-27T17:15:50.664286Z', lastActivityById: '019cf825-85a8-7080-b9ba-be71c290931b', descriptionUpdatedOn: '0001-01-01T00:00:00Z', projectTaskDescriptionStatus: 'Accepted' },
  { id: 'd40b0efe-7fd7-4d76-b495-9f631494cc7d', name: 'Użytkownicy - wklejenie adresu email na urządzeniu mobilnym nie sprawia że można zapisać użytkownika', taskNumber: '118-131', status: 'IN_REVIEW', priority: 'NORMAL', projectId: '656e918f-6b5e-463e-ad4f-1146e86617e5', taskTypeId: 'c5b7877c-f2cb-477b-b9b1-1b7268aa203f', industryId: 'deb3789e-f3cc-4dca-99cb-32a72ab8a683', subtasksCount: 0, percentageOfProgress: 0, isLocked: false, taskTotalTrackedSeconds: 2517, timeReportWithLocation: false, statistics: { time: 'PT41M57.599303S', summaryTime: 'PT41M57.599303S' }, description: '<p>Na urządzeniu mobilnym(IPhone) wklejenie adresu email...</p>', createdAt: '2026-03-18T19:43:40.337835Z', createdById: 'ec1b7e30-194c-466a-a7c6-0c34de58a7ba', lastActivityAt: '2026-04-27T17:02:58.331946Z', lastActivityById: '019cf825-85a8-7080-b9ba-be71c290931b', descriptionUpdatedOn: '0001-01-01T00:00:00Z', projectTaskDescriptionStatus: 'Accepted' },
  { id: '07c4a3ea-98b7-4a59-9367-eacf954c4988', name: 'Czat w opisie', taskNumber: '118-173', status: 'IN_PLANNING', priority: 'NORMAL', projectId: '656e918f-6b5e-463e-ad4f-1146e86617e5', taskTypeId: 'c5b7877c-f2cb-477b-b9b1-1b7268aa203f', industryId: '4b9eb51a-6471-4894-84d1-d92512520cf6', subtasksCount: 0, percentageOfProgress: 0, isLocked: false, taskTotalTrackedSeconds: 35284, timeReportWithLocation: false, acceptanceRequested: true, avatarId: '627a0490ae724ea39a8ab0bad6537ba8', statistics: { time: 'PT9H48M9.99313S', summaryTime: 'PT9H48M9.99313S' }, createdAt: '2026-04-08T08:34:33.606919Z', createdById: '632ceed0-5251-42a6-b5ba-f509c3afdbca', lastActivityAt: '2026-04-27T15:50:22.173102Z', lastActivityById: '632ceed0-5251-42a6-b5ba-f509c3afdbca', descriptionUpdatedOn: '0001-01-01T00:00:00Z', projectTaskDescriptionStatus: 'Accepted' },
  { id: '895940c3-3a0b-421f-ae46-19ea4e9c21a5', name: 'Usunąć puste miejsce Pod opisem ', taskNumber: '118-195', status: 'ACCEPTED', priority: 'NORMAL', projectId: '656e918f-6b5e-463e-ad4f-1146e86617e5', taskTypeId: 'c5b7877c-f2cb-477b-b9b1-1b7268aa203f', industryId: '05d757a5-9ec2-441e-ab44-c060eec1936b', groupId: '8d4084d6-175f-4b7b-8e11-f6e565e5e93c', subtasksCount: 0, percentageOfProgress: 0, isLocked: false, taskTotalTrackedSeconds: 1280, timeReportWithLocation: false, acceptanceRequested: true, statistics: { time: 'PT21M20.975316S', summaryTime: 'PT21M20.975316S' }, description: '<p>Jeżeli nie ma opisu to Na mobile nie widać ikony dodawania pliku.</p>', createdAt: '2026-04-20T17:09:51.087775Z', createdById: '932b811d-0af0-423d-a673-29d513edc039', lastActivityAt: '2026-04-27T15:44:42.763755Z', lastActivityById: '019cf825-85a8-7080-b9ba-be71c290931b', descriptionUpdatedOn: '0001-01-01T00:00:00Z', projectTaskDescriptionStatus: 'Accepted' },
  { id: '1bef599f-cac4-4749-82fa-58bbe1afc630', name: 'Na liście mobile brak ikony podzadań w podzadaniu. ', taskNumber: '118-194', status: 'ACCEPTED', priority: 'NORMAL', projectId: '656e918f-6b5e-463e-ad4f-1146e86617e5', taskTypeId: '3be24941-7c9a-48cc-b071-8cdcf046786b', industryId: 'deb3789e-f3cc-4dca-99cb-32a72ab8a683', locationId: '609f86fb-7753-4173-8b92-ff29591e9c79', subtasksCount: 0, percentageOfProgress: 0, isLocked: false, taskTotalTrackedSeconds: 1105, timeReportWithLocation: false, avatarId: '5998deb7e9674edb9c191cdc21cab406', statistics: { time: 'PT18M25.248864S', summaryTime: 'PT18M25.248864S' }, description: 'Na liście mobile brak ikony podzadań w podzadaniu. ', createdAt: '2026-04-20T17:01:02.769166Z', createdById: '932b811d-0af0-423d-a673-29d513edc039', lastActivityAt: '2026-04-27T15:43:45.481656Z', lastActivityById: '019cf825-85a8-7080-b9ba-be71c290931b', descriptionUpdatedOn: '0001-01-01T00:00:00Z', projectTaskDescriptionStatus: 'Accepted' },
  { id: 'b2b33529-658e-4646-8507-3ae4ca87902c', name: 'Brak progresu uploadu plików. ', taskNumber: '118-214', status: 'TO_DO', priority: 'NORMAL', projectId: '656e918f-6b5e-463e-ad4f-1146e86617e5', taskTypeId: '3be24941-7c9a-48cc-b071-8cdcf046786b', industryId: 'deb3789e-f3cc-4dca-99cb-32a72ab8a683', groupId: '56893482-de74-4a95-9116-5a6a414e8003', locationId: 'e544beca-33e6-4840-b45d-b9475ecfcebf', subtasksCount: 0, percentageOfProgress: 0, isLocked: false, taskTotalTrackedSeconds: 0, timeReportWithLocation: false, createdAt: '2026-04-26T20:21:38.68219Z', createdById: '932b811d-0af0-423d-a673-29d513edc039', lastActivityAt: '2026-04-26T20:22:31.905482Z', lastActivityById: '932b811d-0af0-423d-a673-29d513edc039', descriptionUpdatedOn: '0001-01-01T00:00:00Z', projectTaskDescriptionStatus: 'Accepted' },
  { id: '205b5bba-fcdf-4afd-975d-dcd00b173345', name: 'Mozliwosc dodawania raportow dla innego uzytkownika', taskNumber: '118-200', status: 'TO_DO', priority: 'NORMAL', projectId: '656e918f-6b5e-463e-ad4f-1146e86617e5', taskTypeId: 'c5b7877c-f2cb-477b-b9b1-1b7268aa203f', industryId: 'deb3789e-f3cc-4dca-99cb-32a72ab8a683', groupId: '344cb348-d8ec-4a60-905d-22306e1ab423', subtasksCount: 0, percentageOfProgress: 0, isLocked: false, taskTotalTrackedSeconds: 0, timeReportWithLocation: false, acceptanceRequested: false, description: '<p>1. To musi byc zrobione dla adminów...</p>', createdAt: '2026-04-26T08:01:52.920213Z', createdById: 'ddef1ffc-ecb3-4224-ae77-2621fcf1f3f2', lastActivityAt: '2026-04-26T17:23:02.891208Z', lastActivityById: '932b811d-0af0-423d-a673-29d513edc039', descriptionUpdatedOn: '0001-01-01T00:00:00Z', projectTaskDescriptionStatus: 'Accepted' },
  { id: 'd765da83-6a48-4c7b-a45a-465bdc413b38', name: 'Dodanie sortowania w grupach od najnowszych', taskNumber: '118-201', status: 'TO_DO', priority: 'HIGH', projectId: '656e918f-6b5e-463e-ad4f-1146e86617e5', taskTypeId: 'c5b7877c-f2cb-477b-b9b1-1b7268aa203f', industryId: 'deb3789e-f3cc-4dca-99cb-32a72ab8a683', groupId: '56893482-de74-4a95-9116-5a6a414e8003', subtasksCount: 0, percentageOfProgress: 0, isLocked: false, taskTotalTrackedSeconds: 0, timeReportWithLocation: false, description: '<p>W raportach to domyślne sortowanie.</p>', createdAt: '2026-04-26T08:03:46.415287Z', createdById: 'ddef1ffc-ecb3-4224-ae77-2621fcf1f3f2', lastActivityAt: '2026-04-26T17:20:10.406438Z', lastActivityById: '932b811d-0af0-423d-a673-29d513edc039', descriptionUpdatedOn: '0001-01-01T00:00:00Z', projectTaskDescriptionStatus: 'Accepted' },
  { id: '43e650dd-8491-45dd-ab33-a797d9fbbe38', name: 'Zawieszanie się tworzenia zadania ', taskNumber: '118-208', status: 'TO_DO', priority: 'NORMAL', projectId: '656e918f-6b5e-463e-ad4f-1146e86617e5', taskTypeId: '3be24941-7c9a-48cc-b071-8cdcf046786b', industryId: 'deb3789e-f3cc-4dca-99cb-32a72ab8a683', locationId: 'e544beca-33e6-4840-b45d-b9475ecfcebf', subtasksCount: 0, percentageOfProgress: 0, isLocked: false, taskTotalTrackedSeconds: 0, timeReportWithLocation: false, acceptanceRequested: true, avatarId: 'fea1f441284145a6a016a1cf9dcc08fb', createdAt: '2026-04-26T16:55:25.867443Z', createdById: '932b811d-0af0-423d-a673-29d513edc039', lastActivityAt: '2026-04-26T17:14:43.33915Z', lastActivityById: '932b811d-0af0-423d-a673-29d513edc039', descriptionUpdatedOn: '0001-01-01T00:00:00Z', projectTaskDescriptionStatus: 'Accepted' },
  { id: '45f40b97-e4ac-470b-9dfc-81c96a13d0d8', name: 'Menu podglądu video nie minimalizuje się. ', taskNumber: '118-207', status: 'TO_DO', priority: 'NORMAL', projectId: '656e918f-6b5e-463e-ad4f-1146e86617e5', taskTypeId: '3be24941-7c9a-48cc-b071-8cdcf046786b', industryId: 'deb3789e-f3cc-4dca-99cb-32a72ab8a683', locationId: 'e544beca-33e6-4840-b45d-b9475ecfcebf', subtasksCount: 0, percentageOfProgress: 0, isLocked: false, taskTotalTrackedSeconds: 0, timeReportWithLocation: false, createdAt: '2026-04-26T16:14:12.684733Z', createdById: '932b811d-0af0-423d-a673-29d513edc039', lastActivityAt: '2026-04-26T16:14:11.356626Z', lastActivityById: '932b811d-0af0-423d-a673-29d513edc039', descriptionUpdatedOn: '0001-01-01T00:00:00Z', projectTaskDescriptionStatus: 'Accepted' },
  { id: '924075b3-abdb-4521-a99c-63fd700eb97f', name: 'Brak spinera. ', taskNumber: '118-206', status: 'TO_DO', priority: 'NORMAL', projectId: '656e918f-6b5e-463e-ad4f-1146e86617e5', taskTypeId: '3be24941-7c9a-48cc-b071-8cdcf046786b', industryId: 'deb3789e-f3cc-4dca-99cb-32a72ab8a683', locationId: '799ba718-2a98-4846-bb16-3da3eb653a83', subtasksCount: 0, percentageOfProgress: 0, isLocked: false, taskTotalTrackedSeconds: 0, timeReportWithLocation: false, description: 'Zapis nowego  taska z plikami potrafi zająć sporo czasu...', createdAt: '2026-04-26T16:12:17.5573Z', createdById: '932b811d-0af0-423d-a673-29d513edc039', lastActivityAt: '2026-04-26T16:12:17.51261Z', lastActivityById: '932b811d-0af0-423d-a673-29d513edc039', descriptionUpdatedOn: '0001-01-01T00:00:00Z', projectTaskDescriptionStatus: 'Accepted' },
  { id: 'f46aa14b-f1ae-4438-8215-2e817e4aad60', name: 'Domyślna pozycja skrola w momencie otwierania detali taska. ', taskNumber: '118-205', status: 'TO_DO', priority: 'MEDIUM', projectId: '656e918f-6b5e-463e-ad4f-1146e86617e5', taskTypeId: '3be24941-7c9a-48cc-b071-8cdcf046786b', subtasksCount: 0, percentageOfProgress: 0, isLocked: false, taskTotalTrackedSeconds: 0, timeReportWithLocation: false, description: '<p>Czy jest jakiś mechaniz decydujący o pozycji scrolla...</p>', createdAt: '2026-04-26T16:07:15.482965Z', createdById: '932b811d-0af0-423d-a673-29d513edc039', lastActivityAt: '2026-04-26T16:09:35.990682Z', lastActivityById: '932b811d-0af0-423d-a673-29d513edc039', descriptionUpdatedOn: '0001-01-01T00:00:00Z', projectTaskDescriptionStatus: 'Accepted' },
  { id: 'a13acf29-9bd3-45b3-8142-aa10d05ec995', name: 'Lokacje. 1. Brak root 2. Szybki zapisz ', taskNumber: '118-204', status: 'TO_DO', priority: 'HIGH', projectId: '656e918f-6b5e-463e-ad4f-1146e86617e5', taskTypeId: 'c5b7877c-f2cb-477b-b9b1-1b7268aa203f', industryId: 'deb3789e-f3cc-4dca-99cb-32a72ab8a683', locationId: 'cc40d26f-de24-4fb4-8618-fbbeb6879d3b', subtasksCount: 0, percentageOfProgress: 0, isLocked: false, taskTotalTrackedSeconds: 0, timeReportWithLocation: false, avatarId: 'f7caaee8ce1941fb9c90941870f1c0c8', createdAt: '2026-04-26T15:37:06.838817Z', createdById: '932b811d-0af0-423d-a673-29d513edc039', lastActivityAt: '2026-04-26T16:00:27.547908Z', lastActivityById: '932b811d-0af0-423d-a673-29d513edc039', descriptionUpdatedOn: '0001-01-01T00:00:00Z', projectTaskDescriptionStatus: 'Accepted' },
  { id: '9ee3eaa2-106f-4659-a8ba-234674a7e2c7', name: 'Raporty. Zmiana kontekstu po akcji ', taskNumber: '118-202', status: 'TO_DO', priority: 'HIGH', projectId: '656e918f-6b5e-463e-ad4f-1146e86617e5', taskTypeId: '3be24941-7c9a-48cc-b071-8cdcf046786b', industryId: 'deb3789e-f3cc-4dca-99cb-32a72ab8a683', locationId: '68d2d717-0713-49f6-b1b8-58b0850d0200', subtasksCount: 0, percentageOfProgress: 0, isLocked: false, taskTotalTrackedSeconds: 0, timeReportWithLocation: false, createdAt: '2026-04-26T14:47:06.884962Z', createdById: '932b811d-0af0-423d-a673-29d513edc039', lastActivityAt: '2026-04-26T15:57:05.807823Z', lastActivityById: '932b811d-0af0-423d-a673-29d513edc039', descriptionUpdatedOn: '0001-01-01T00:00:00Z', projectTaskDescriptionStatus: 'Accepted' },
  { id: '96611ee3-1a98-433f-b1c8-7abf3b3d7307', name: 'Checboxy w raportach. ', taskNumber: '118-203', status: 'TO_DO', priority: 'NORMAL', projectId: '656e918f-6b5e-463e-ad4f-1146e86617e5', taskTypeId: 'c5b7877c-f2cb-477b-b9b1-1b7268aa203f', subtasksCount: 0, percentageOfProgress: 0, isLocked: false, taskTotalTrackedSeconds: 0, timeReportWithLocation: false, description: 'Checboxy miały być usunięte z nagłówków grup...', createdAt: '2026-04-26T14:50:49.927464Z', createdById: '932b811d-0af0-423d-a673-29d513edc039', lastActivityAt: '2026-04-26T14:50:49.925939Z', lastActivityById: '932b811d-0af0-423d-a673-29d513edc039', descriptionUpdatedOn: '0001-01-01T00:00:00Z', projectTaskDescriptionStatus: 'Accepted' },
  { id: '4cf26c50-be6d-4a8c-881b-d25599850b65', name: 'Grouped edycja po nacisnieciu row', taskNumber: '118-199', status: 'TO_DO', priority: 'NORMAL', projectId: '656e918f-6b5e-463e-ad4f-1146e86617e5', taskTypeId: 'c5b7877c-f2cb-477b-b9b1-1b7268aa203f', subtasksCount: 0, percentageOfProgress: 0, isLocked: false, taskTotalTrackedSeconds: 0, timeReportWithLocation: false, createdAt: '2026-04-26T08:01:08.807074Z', createdById: 'ddef1ffc-ecb3-4224-ae77-2621fcf1f3f2', lastActivityAt: '2026-04-26T14:43:11.876041Z', lastActivityById: '932b811d-0af0-423d-a673-29d513edc039', descriptionUpdatedOn: '0001-01-01T00:00:00Z', projectTaskDescriptionStatus: 'Accepted' },
  { id: '3bc6d1fe-b0f0-4c7a-a74d-e969608cafcf', name: 'Organizacja i dodanie statusow', taskNumber: '118-182', status: 'IN_REVIEW', priority: 'NORMAL', projectId: '656e918f-6b5e-463e-ad4f-1146e86617e5', taskTypeId: 'c5b7877c-f2cb-477b-b9b1-1b7268aa203f', subtasksCount: 1, percentageOfProgress: 0, isLocked: false, taskTotalTrackedSeconds: 2728, timeReportWithLocation: false, statistics: { time: 'PT45M30.388234S', summaryTime: 'PT45M30.388234S' }, createdAt: '2026-04-11T23:40:36.50439Z', createdById: '932b811d-0af0-423d-a673-29d513edc039', lastActivityAt: '2026-04-26T12:41:21.433Z', lastActivityById: '019cf825-85a8-7080-b9ba-be71c290931b', descriptionUpdatedOn: '0001-01-01T00:00:00Z', projectTaskDescriptionStatus: 'Accepted' },
  { id: '61340fa6-fe6c-4308-988d-ff5cb87fa769', name: '[FE] Usprawnienia UX/UI widoku splitview tasków', taskNumber: '118-033', status: 'DONE', priority: 'NORMAL', projectId: '656e918f-6b5e-463e-ad4f-1146e86617e5', taskTypeId: 'c5b7877c-f2cb-477b-b9b1-1b7268aa203f', subtasksCount: 1, percentageOfProgress: 0, isLocked: false, taskTotalTrackedSeconds: 13609, timeReportWithLocation: false, avatarId: 'df9c64fca80d4ff99117dd9a15f29c45', statistics: { time: 'PT3H46M50.331116S', summaryTime: 'PT3H46M50.331116S' }, createdAt: '2025-11-07T11:38:22.835342Z', createdById: '24ab23c2-69cb-4a20-b7ef-84c65dfff80e', lastActivityAt: '2026-04-25T15:10:08.541988Z', lastActivityById: 'ddef1ffc-ecb3-4224-ae77-2621fcf1f3f2', descriptionUpdatedOn: '0001-01-01T00:00:00Z', projectTaskDescriptionStatus: 'Accepted' },
  { id: 'ca413325-05d5-4754-bec1-8befe10b0d2d', name: 'Poprawić wyglądu plików opisu i zakładki plików ', taskNumber: '118-186', status: 'ACCEPTED', priority: 'NORMAL', projectId: '656e918f-6b5e-463e-ad4f-1146e86617e5', taskTypeId: 'c5b7877c-f2cb-477b-b9b1-1b7268aa203f', industryId: 'deb3789e-f3cc-4dca-99cb-32a72ab8a683', groupId: '25b1096c-8570-444f-98d0-2e8a9c5b6c73', subtasksCount: 1, percentageOfProgress: 0, isLocked: false, taskTotalTrackedSeconds: 35545, timeReportWithLocation: false, avatarId: '0111eadfa791492ba76ee1e48a5123d4', statistics: { time: 'PT5H8M33.377118S', summaryTime: 'PT5H8M33.377118S' }, createdAt: '2026-04-12T17:42:59.614503Z', createdById: '932b811d-0af0-423d-a673-29d513edc039', lastActivityAt: '2026-04-24T18:23:31.722782Z', lastActivityById: 'ec1b7e30-194c-466a-a7c6-0c34de58a7ba', descriptionUpdatedOn: '0001-01-01T00:00:00Z', projectTaskDescriptionStatus: 'Accepted' },
  { id: '367b09b2-cd43-4008-8dcf-e27e34024e0a', name: 'Rozszerzenie modelu tworzenia użytkownika', taskNumber: '118-177', status: 'DONE', priority: 'NORMAL', projectId: '656e918f-6b5e-463e-ad4f-1146e86617e5', taskTypeId: 'c638acf1-ccae-4a22-82df-2e6c58d3831b', industryId: '4b9eb51a-6471-4894-84d1-d92512520cf6', subtasksCount: 0, percentageOfProgress: 0, isLocked: false, taskTotalTrackedSeconds: 420, timeReportWithLocation: false, statistics: { time: 'PT7M0.864636S', summaryTime: 'PT7M0.864636S' }, description: 'Rozszerzenie modelu do tworzenia użytkownika o dodatkowe pola...', createdAt: '2026-04-08T15:59:22.095661Z', createdById: '019cf825-85a8-7080-b9ba-be71c290931b', lastActivityAt: '2026-04-23T20:06:39.732519Z', lastActivityById: '019cf825-85a8-7080-b9ba-be71c290931b', descriptionUpdatedOn: '0001-01-01T00:00:00Z', projectTaskDescriptionStatus: 'Accepted' },
  { id: 'bc2b764c-abc9-4129-8bd7-885721b45204', name: 'Opis zadania zostaje pry braku zadań ', taskNumber: '118-197', status: 'REJECTED', priority: 'HIGH', projectId: '656e918f-6b5e-463e-ad4f-1146e86617e5', taskTypeId: '3be24941-7c9a-48cc-b071-8cdcf046786b', industryId: 'deb3789e-f3cc-4dca-99cb-32a72ab8a683', subtasksCount: 0, percentageOfProgress: 0, isLocked: false, taskTotalTrackedSeconds: 0, timeReportWithLocation: false, description: 'Brak zadań a opis został', createdAt: '2026-04-21T14:28:08.973987Z', createdById: '932b811d-0af0-423d-a673-29d513edc039', lastActivityAt: '2026-04-23T19:59:03.9189Z', lastActivityById: 'ec1b7e30-194c-466a-a7c6-0c34de58a7ba', descriptionUpdatedOn: '0001-01-01T00:00:00Z', projectTaskDescriptionStatus: 'Accepted' },
  { id: 'e983e06f-4b13-4ce8-a853-8c017ecc5abb', name: 'Tytuł zadania  zwija sie przy edycji ', taskNumber: '118-171', status: 'ACCEPTED', priority: 'MEDIUM', projectId: '656e918f-6b5e-463e-ad4f-1146e86617e5', taskTypeId: '3be24941-7c9a-48cc-b071-8cdcf046786b', industryId: 'deb3789e-f3cc-4dca-99cb-32a72ab8a683', locationId: '0542483f-a61d-4de9-94d2-22e9bbafcf78', subtasksCount: 0, percentageOfProgress: 0, isLocked: false, taskTotalTrackedSeconds: 4845, timeReportWithLocation: false, statistics: { time: 'PT1H20M45.893927S', summaryTime: 'PT1H20M45.893927S' }, createdAt: '2026-04-08T05:32:18.610474Z', createdById: '932b811d-0af0-423d-a673-29d513edc039', lastActivityAt: '2026-04-23T16:27:03.360639Z', lastActivityById: '019cf825-85a8-7080-b9ba-be71c290931b', descriptionUpdatedOn: '0001-01-01T00:00:00Z', projectTaskDescriptionStatus: 'Accepted' },
  { id: 'e315b39f-adc7-434b-913c-dbad66b490f0', name: 'Użytkownicy - uproszczenie formularza tworzenia użytkownika', taskNumber: '118-132', status: 'ACCEPTED', priority: 'NORMAL', projectId: '656e918f-6b5e-463e-ad4f-1146e86617e5', taskTypeId: 'c5b7877c-f2cb-477b-b9b1-1b7268aa203f', locationId: '3196349a-9532-4b55-a964-ef6c29882187', subtasksCount: 0, percentageOfProgress: 0, isLocked: false, taskTotalTrackedSeconds: 6155, timeReportWithLocation: false, statistics: { time: 'PT1H42M38.511691S', summaryTime: 'PT1H42M38.511691S' }, createdAt: '2026-03-18T19:44:19.032697Z', createdById: 'ec1b7e30-194c-466a-a7c6-0c34de58a7ba', lastActivityAt: '2026-04-23T16:26:05.200153Z', lastActivityById: '019cf825-85a8-7080-b9ba-be71c290931b', descriptionUpdatedOn: '0001-01-01T00:00:00Z', projectTaskDescriptionStatus: 'Accepted' },
  { id: '5b5160cb-eda5-4bf1-b884-c59125049dbb', name: 'Subtaski. Marginesy / padingi ', taskNumber: '118-115', status: 'ACCEPTED', priority: 'NORMAL', projectId: '656e918f-6b5e-463e-ad4f-1146e86617e5', taskTypeId: 'c5b7877c-f2cb-477b-b9b1-1b7268aa203f', industryId: 'deb3789e-f3cc-4dca-99cb-32a72ab8a683', subtasksCount: 0, percentageOfProgress: 0, isLocked: false, taskTotalTrackedSeconds: 7015, timeReportWithLocation: false, estimation: { time: 'PT1H' }, statistics: { time: 'PT1H56M57.208712S', summaryTime: 'PT1H56M57.208712S' }, createdAt: '2026-03-17T03:18:39.53183Z', createdById: '932b811d-0af0-423d-a673-29d513edc039', lastActivityAt: '2026-04-23T16:25:31.680035Z', lastActivityById: '019cf825-85a8-7080-b9ba-be71c290931b', descriptionUpdatedOn: '0001-01-01T00:00:00Z', projectTaskDescriptionStatus: 'Accepted' },
  { id: '35acaf42-46bb-4d47-9803-5802144c5154', name: 'Kopiowanie zadań / zmiana parenta, save as draft', taskNumber: '118-112', status: 'IN_PROGRESS', priority: 'NORMAL', projectId: '656e918f-6b5e-463e-ad4f-1146e86617e5', taskTypeId: 'c5b7877c-f2cb-477b-b9b1-1b7268aa203f', subtasksCount: 7, percentageOfProgress: 0, isLocked: false, taskTotalTrackedSeconds: 11378, timeReportWithLocation: false, statistics: { time: 'PT3H9M2.632786S', summaryTime: 'PT3H9M2.632786S' }, createdAt: '2026-03-17T02:42:29.510092Z', createdById: '932b811d-0af0-423d-a673-29d513edc039', lastActivityAt: '2026-04-22T18:54:26.107016Z', lastActivityById: 'ec1b7e30-194c-466a-a7c6-0c34de58a7ba', descriptionUpdatedOn: '0001-01-01T00:00:00Z', projectTaskDescriptionStatus: 'Accepted' }
];

const MOCK_SUBTASK_PARENT_ID = '07c4a3ea-98b7-4a59-9367-eacf954c4988';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MOCK_SUBTASK_DTOS: any[] = [
  {
    createdAt: '2026-04-28T13:52:01.640958Z',
    createdById: '632ceed0-5251-42a6-b5ba-f509c3afdbca',
    descriptionUpdatedOn: '0001-01-01T00:00:00Z',
    id: '63351e10-3d87-4938-9adb-3d7cea1babf2',
    industryId: '4b9eb51a-6471-4894-84d1-d92512520cf6',
    isLocked: false,
    lastActivityAt: '2026-04-28T13:52:13.884294Z',
    lastActivityById: '632ceed0-5251-42a6-b5ba-f509c3afdbca',
    name: 'Ver3 - komentarze jako akcje ',
    parentTaskId: MOCK_SUBTASK_PARENT_ID,
    percentageOfProgress: 0,
    projectId: '656e918f-6b5e-463e-ad4f-1146e86617e5',
    priority: 'NORMAL',
    status: 'IN_PROGRESS',
    subtasksCount: 0,
    taskNumber: '118-173-1',
    taskTotalTrackedSeconds: 0,
    taskTotalEstimatedTime: '00:00:00',
    taskTypeId: 'c5b7877c-f2cb-477b-b9b1-1b7268aa203f',
    timeReportWithLocation: false,
    projectTaskDescriptionStatus: 'Accepted'
  }
];
import { AppEventType } from '../types/enums/app-event-type';
import { SortDirection } from '../types/enums/sort-direction.enum';
import { Location } from '../types/models/location/location.model';
import { AppEvent } from '../types/models/notifications/app-event';
import { TaskDescriptionComment } from '../types/models/task/task-description-comment.model';
import { TaskEstimation } from '../types/models/task/task-estimation';
import { TaskFilters } from '../types/models/task/task-filters.model';
import { TaskType } from '../types/models/task/task-type.model';
import { Task } from '../types/models/task/task.model';
import { TasksPageData } from '../types/models/tasks-page-data';
import { CompaniesDataService } from './companies-data.service';
import { CompanyIndustriesDataService } from './company-industries-data.service';
import { DataService } from './data-service';
import { ContextDataDTO } from './dtos/context-data.dto';
import { SetTaskAcceptanceRequestedDTO } from './dtos/project-tasks/set-task-acceptance-requested.dto';
import { ProjectTaskFactory } from './factories/project-task.factory';
import { GroupsDataService } from './groups-data.service';
import { LocationsDataService } from './locations-data.service';
import { ProjectIndustriesDataService } from './project-industries-data.service';
import { ProjectParticipantsDataService } from './project-participants-data.service';
import { ProjectsDataService } from './projects-data.service';
import { TaskParticipantsDataService } from './task-participants-data.service';
import { TaskTypesDataService } from './task-types-data.service';
import { UsersDataService } from './users-data.service';

export interface PageKey {
  projectId: string;
  page: number;
  limit: number;
  sortField: string;
  sortDir: string;
  filtersId: string;
  searchText?: string;
  filters?: TaskFilters;
}

export const getPageKey = (key: PageKey): string =>
  `${key.projectId}-${key.page}-${key.limit}-${convertToKeyString(key.sortField)}-${convertToKeyString(key.sortDir)}-${convertToKeyString(key.filtersId)}-${convertToKeyString(key.searchText || '')}`;

export const convertToKeyString = (value: string): string => (value ? value.trim().toLowerCase() : '');

/**
 * TasksDataService - Data access layer for tasks.
 *
 * This service manages task data, queries, store operations and provides getters for task state.
 *
 * Usage: Used by {@link TasksActionsService} and components to access and manage task data.
 *
 * Architecture:
 * - {@link TasksActionsService}: User actions, mutations, side effects (toasts, modals)
 * - {@link TasksDataService}: Data access, queries, getters, store management
 * - {@link TasksHttpService}: HTTP API calls
 */
@Injectable({ providedIn: 'root' })
export class TasksDataService extends DataService<ProjectTaskDTO, Task> {
  private readonly tasks: DataStore<Task> = new DataStore<Task>();
  private readonly projectTaskPages: DataStore<TasksPageData> = new DataStore<TasksPageData>();
  private readonly tasksByParent: DataStore<IdsCollection> = new DataStore<IdsCollection>();
  private readonly taskFactory: ProjectTaskFactory = inject(ProjectTaskFactory);
  private readonly companiesService: CompaniesDataService = inject(CompaniesDataService);
  private readonly groupsService: GroupsDataService = inject(GroupsDataService);
  private readonly industriesService: CompanyIndustriesDataService = inject(CompanyIndustriesDataService);
  private readonly locationsService: LocationsDataService = inject(LocationsDataService);
  private readonly projectsService: ProjectsDataService = inject(ProjectsDataService);
  private readonly projectIndustriesService: ProjectIndustriesDataService = inject(ProjectIndustriesDataService);
  private readonly projectParticipantsService: ProjectParticipantsDataService = inject(ProjectParticipantsDataService);
  private readonly tasksHttpService: TasksHttpService = inject(TasksHttpService);
  private readonly taskTypesService: TaskTypesDataService = inject(TaskTypesDataService);
  private readonly usersService: UsersDataService = inject(UsersDataService);
  private readonly taskParticipantsService: TaskParticipantsDataService = inject(TaskParticipantsDataService);
  private currentPageKey: PageKey;
  private inflight = new Set<string>();
  private lastListKey: string | null = null;

  public getById(taskId: string): Signal<Task | undefined> {
    untracked(() => {
      if (!this.tasks.hasDataForId(taskId)) {
        const dto = [...MOCK_TASK_DTOS, ...MOCK_SUBTASK_DTOS].find(d => d.id === taskId);
        if (dto) {
          const task = this.taskFactory.produce(dto);
          if (task) this.tasks.upsert(task);
        }
      }
    });
    return computed(() => this.tasks.get(taskId)());
  }

  public getProjectTasks(
    projectId: string,
    page: number,
    limit: number,
    sortField: TaskSortField,
    sortDir: SortDirection,
    filtersId?: string,
    filters?: TaskFilters
  ): Signal<TasksPageData | undefined> {
    if (!projectId) return signal(undefined);

    const normalized: TaskFilters = { ...((filters ?? {}) as TaskFilters) };
    delete (normalized as Record<string, unknown>)['direction'];
    delete (normalized as Record<string, unknown>)['limit'];
    delete (normalized as Record<string, unknown>)['page'];

    const effectiveFilters = this.isObjectEmpty(normalized) ? null : normalized;

    const key: PageKey = {
      projectId,
      page,
      limit,
      sortField,
      sortDir,
      filtersId: filtersId ?? '',
      searchText: effectiveFilters?.text ?? '',
      filters: effectiveFilters
    };

    this.currentPageKey = key;

    this.ensureTasksPageLoaded(key);

    const pageKey = getPageKey(key);

    return computed(() => {
      const pageData = this.projectTaskPages.get(pageKey)();
      if (!pageData) return undefined;

      let filters = null;
      if (pageData.filters) {
        filters = structuredClone(pageData.filters);
        delete (filters as TaskFilters)['direction'];
        delete (filters as TaskFilters)['limit'];
        delete (filters as TaskFilters)['page'];
      }
      return {
        total: pageData.total,
        id: pageData.id,
        filtersId: pageData.filtersId ?? null,
        filters: filters,
        page: pageData.page,
        limit: pageData.limit,
        content: pageData.ids.map(id => this.tasks.get(id))
      } as TasksPageData;
    });
  }

  public getTasksByParent(projectId: string, taskId: string): Signal<Task[] | undefined> {
    if (!projectId || !taskId) {
      return signal([]);
    }

    if (!this.tasksByParent.hasDataForId(taskId)) {
      this.fetchTasksByParent(projectId, taskId);
    }

    return computed(() => {
      const childrenIds = this.tasksByParent.get(taskId)();
      return childrenIds?.ids.map(id => this.tasks.get(id)()) || [];
    });
  }

  protected handleEvent(event: AppEvent): void {
    if (event.eventType === 'TaskUpdated') {
      this.tasks.upsert(event.data as Task);
    }

    // Task description comments are not supported in mock mode
  }

  public upsertLocalData(dto: Partial<ProjectTaskDTO>): Signal<Task> {
    return dto ? this.tasks.upsert(this.taskFactory.produce(dto)) : signal(undefined);
  }

  private fetchTasksPage(pageKey: PageKey, onFinally?: () => void): void {
    untracked(() => {
      let items = MOCK_TASK_DTOS.filter(dto => dto.projectId === pageKey.projectId);

      if (pageKey.filters) {
        const f = pageKey.filters;
        if (f.text) {
          const text = f.text.toLowerCase();
          items = items.filter(dto => dto.name?.toLowerCase().includes(text));
        }
        if (f.taskStatus?.length) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          items = items.filter(dto => (f.taskStatus as any[]).includes(dto.status));
        }
        if (f.taskPriority?.length) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          items = items.filter(dto => (f.taskPriority as any[]).includes(dto.priority));
        }
      }

      items.forEach(dto => {
        if (!this.tasks.hasDataForId(dto.id)) {
          const task = this.taskFactory.produce(dto);
          if (task) this.tasks.upsert(task);
        }
      });

      const total = items.length;
      const start = pageKey.page * pageKey.limit;
      const pageItems = items.slice(start, start + pageKey.limit);
      const stringPageKey = getPageKey(pageKey);

      this.projectTaskPages.upsert({
        id: stringPageKey,
        ids: pageItems.map(dto => dto.id),
        filters: null,
        filtersId: null,
        total,
        limit: pageKey.limit,
        page: pageKey.page
      });

      onFinally?.();
    });
  }

  private fetchTasksByParent(_projectId: string, taskId: string): void {
    untracked(() => {
      const items = taskId === MOCK_SUBTASK_PARENT_ID ? MOCK_SUBTASK_DTOS : [];

      items.forEach(dto => {
        if (!this.tasks.hasDataForId(dto.id)) {
          const task = this.taskFactory.produce(dto);
          if (task) this.tasks.upsert(task);
        }
      });

      this.tasksByParent.upsert({
        id: taskId,
        ids: items.map(dto => dto.id)
      });
    });
  }

  public uploadContextDataItems(contextData: ContextDataDTO): void {
    if (!contextData) {
      return;
    }

    contextData.companies?.forEach(dto => this.companiesService.upsertLocalData(dto));
    contextData.groups?.forEach(dto => this.groupsService.upsertLocalData(dto));
    contextData.industries?.forEach(dto => this.industriesService.upsertLocalData(dto));
    contextData.locations?.forEach(dto => this.locationsService.upsertLocalData(dto));
    contextData.projects?.forEach(dto => this.projectsService.upsertLocalData(dto));
    contextData.projectIndustries?.forEach(dto => this.projectIndustriesService.upsertLocalData(dto));
    contextData.projectParticipants?.forEach(dto => this.projectParticipantsService.upsertLocalData(dto));
    contextData.projectTaskParticipants?.forEach(dto => {
      this.taskParticipantsService.upsertLocalData(dto);
      this.taskParticipantsService.upsertLocalDataTaskParticipants(dto);
    });
    contextData.tasks?.forEach(dto => this.upsertLocalData(dto));
    contextData.taskTypes?.forEach(dto => this.taskTypesService.upsertLocalData(dto));
    contextData.users?.forEach(dto => this.usersService.upsertLocalData(dto));
  }

  public createNewTask(projectId: string, request: TaskCreateData): Observable<ProjectTaskDTO[]> {
    return this.tasksHttpService.createTask(projectId, request).pipe(
      tap((res: ProjectTaskDTO[]) => {
        const newTask = res[0];
        this.upsertLocalData(newTask);
        this.fetchTasksPage(this.currentPageKey);
        if (newTask.parentTaskId) {
          this.changeTaskSubtasksCount('add', newTask.parentTaskId, newTask.id);
        }
        this.notificationService.notify({ eventType: 'TaskCreated', data: newTask });
      }),
      catchError(() => throwError(() => request))
    );
  }

  public deleteTask(task: Task): Observable<ProjectTaskDTO> {
    return this.tasksHttpService.deleteTask(task.id).pipe(
      tap(() => {
        this.tasks.delete(task.id);
        this.tasksByParent.delete(task.id);
        this.fetchTasksPage(this.currentPageKey);
        if (task.parentTask()) {
          this.changeTaskSubtasksCount('delete', task.parentTask().id, task.id);
        }
      })
    );
  }

  public updateTaskType(task: Task, taskType: TaskType): Observable<ProjectTaskDTO> {
    if (!taskType) return;
    return this.updateTaskField(task, 'type', { code: taskType.code });
  }

  public updateTaskName(task: Task, name: string): Observable<ProjectTaskDTO> {
    if (!name) return;
    return this.updateTaskField(task, 'name', { name });
  }

  public updateTaskDescription(task: Task, description: string): Observable<ProjectTaskDTO> {
    if (!description) return;
    return this.updateTaskField(task, 'description', { description }, 'TaskDataChanged');
  }

  public updateTaskStatus(task: Task, status: string): Observable<ProjectTaskDTO> {
    if (!status) return;
    return this.updateTaskField(task, 'status', { status }, 'TaskDataChanged');
  }

  public updateTaskPriority(task: Task, priority: string): Observable<ProjectTaskDTO> {
    if (!priority) return;
    return this.updateTaskField(task, 'priority', { priority }, 'TaskDataChanged');
  }

  public updateCompletionPercentage(percentage: number, task: Task): Observable<ProjectTaskDTO> {
    if (percentage < 0 || percentage > 100) return;
    return this.updateTaskField(task, 'progress', { percentageOfProgress: percentage }, 'TaskDataChanged');
  }

  public updateStartDate(startDate: Date, task: Task): Observable<ProjectTaskDTO> {
    if (!startDate) return;
    return this.updateTaskField(task, 'start-date', { startDate: startDate.toISOString() });
  }

  public updateEndDate(endDate: Date, task: Task): Observable<ProjectTaskDTO> {
    if (!endDate) return;
    return this.updateTaskField(task, 'end-date', { endDate: endDate.toISOString() });
  }

  public updateEstimation(estimation: TaskEstimation, task: Task): Observable<ProjectTaskDTO> {
    const hasTime = estimation.time !== undefined && estimation.time !== null;
    const hasFinancial = estimation.financial !== undefined && estimation.financial !== null;

    if (hasTime && hasFinancial) {
      return this.updateTaskField(task, 'estimation/time', { time: estimation.time }).pipe(
        switchMap(() => this.updateTaskField(task, 'estimation/finances', estimation.financial))
      );
    } else if (hasTime) {
      return this.updateTaskField(task, 'estimation/time', { time: estimation.time });
    } else if (hasFinancial) {
      return this.updateTaskField(task, 'estimation/finances', estimation.financial);
    }

    return EMPTY;
  }

  public updateIndustry(industryId: string, task: Task): Observable<ProjectTaskDTO> {
    if (!industryId) return EMPTY;
    return this.updateTaskField(task, 'industry', { industryId: industryId }, 'TaskDataChanged');
  }

  public updateLocation(location: Location, task: Task): Observable<ProjectTaskDTO> {
    if (!location) return EMPTY;
    return this.updateTaskField(task, 'location', { locationId: location.id }, 'TaskDataChanged');
  }

  public updateTaskGroup(groupId: string, task: Task): Observable<ProjectTaskDTO> {
    if (!groupId) return EMPTY;
    return this.updateTaskField(task, 'group', { groupId: groupId }, 'TaskGroupChanged');
  }

  public updateTaskAcceptanceRequested(task: Task, acceptanceRequested: boolean | null): Observable<ProjectTaskDTO> {
    if (!task?.id) return EMPTY;
    const payload: SetTaskAcceptanceRequestedDTO = { acceptanceRequested };
    return this.updateTaskField(task, 'acceptance-requested', payload, 'TaskDataChanged');
  }

  private updateTaskField<T>(
    task: Task,
    endpoint: string,
    payload: T,
    notify?: AppEventType
  ): Observable<ProjectTaskDTO> {
    if (!task) return;

    return this.tasksHttpService.updateField(task, endpoint, payload).pipe(
      tap((dto: ProjectTaskDTO) => {
        this.upsertLocalData(dto);
        if (notify) this.notificationService.notify({ eventType: notify, data: task.id });
      })
    );
  }

  private changeTaskSubtasksCount(method: 'add' | 'delete', parentTaskId: string, subtaskId: string): void {
    const parentTask = this.tasks.get(parentTaskId)();
    const existingIds = this.tasksByParent.get(parentTaskId)();
    let updatedIds: string[];

    if (method === 'add') {
      parentTask.subtasksCount++;
      updatedIds = existingIds?.ids.concat(subtaskId) ?? [subtaskId];
    } else {
      parentTask.subtasksCount--;
      updatedIds = existingIds?.ids.filter(id => id !== subtaskId) ?? [];
    }

    this.tasksByParent.upsert({
      id: parentTaskId,
      ids: updatedIds
    });
    this.tasks.upsert(parentTask);
  }

  private isObjectEmpty(obj: unknown): boolean {
    let filled = false;
    Object.values(obj).forEach(value => {
      if (
        value !== null &&
        value !== undefined &&
        (value?.length > 0 ||
          (typeof value === 'string' && value === '') ||
          (typeof value === 'boolean' && value === true) ||
          (typeof value === 'object' && value instanceof Date))
      )
        filled = true;
    });
    return !filled;
  }

  private ensureTasksPageLoaded(key: PageKey): void {
    const listKey = this.buildListKey(key);
    if (this.lastListKey !== listKey) {
      this.projectTaskPages.clear();
      this.lastListKey = listKey;
    }

    const pageKey = getPageKey(key);
    const hasData = this.projectTaskPages.hasDataForId(pageKey);
    if (hasData || this.inflight.has(pageKey)) return;
    this.inflight.add(pageKey);
    this.fetchTasksPage(key, () => this.inflight.delete(pageKey));
  }

  private buildFiltersHash(filters?: TaskFilters | null): string {
    if (!filters) return '';
    return JSON.stringify({
      text: filters.text ?? '',
      taskStatus: [...(filters.taskStatus ?? [])].sort(),
      taskPriority: [...(filters.taskPriority ?? [])].sort(),
      group: [...(filters.group ?? [])].sort(),
      noGroup: filters.noGroup ?? false,
      user: [...(filters.user ?? [])].sort(),
      noUsers: filters.noUsers ?? false,
      location: [...(filters.location ?? [])].sort(),
      noLocation: filters.noLocation ?? false,
      industry: [...(filters.industry ?? [])].sort(),
      noIndustry: filters.noIndustry ?? false,
      userRole: [...(filters.userRole ?? [])].sort(),
      createdBy: [...(filters.createdBy ?? [])].sort(),
      startDateFrom: filters.startDateFrom ?? null,
      startDateTo: filters.startDateTo ?? null,
      endDateFrom: filters.endDateFrom ?? null,
      endDateTo: filters.endDateTo ?? null,
      createdDateFrom: filters.createdDateFrom ?? null,
      createdDateTo: filters.createdDateTo ?? null,
      editDateFrom: filters.editDateFrom ?? null,
      editDateTo: filters.editDateTo ?? null,
      projectTagIds: [...(filters.projectTagIds ?? [])].sort(),
      taskTypeIds: [...(filters.taskTypeIds ?? [])].sort()
    });
  }

  private buildListKey(k: PageKey): string {
    return [
      k.projectId,
      convertToKeyString(k.filtersId),
      convertToKeyString(k.searchText ?? ''),
      this.buildFiltersHash(k.filters)
    ].join('|');
  }

  public lockTask(taskId: string): Observable<ProjectTaskDTO> {
    return this.tasksHttpService.lockTask(taskId).pipe(tap((dto: ProjectTaskDTO) => this.upsertLocalData(dto)));
  }

  public unlockTask(taskId: string): Observable<ProjectTaskDTO> {
    return this.tasksHttpService.unlockTask(taskId).pipe(tap((dto: ProjectTaskDTO) => this.upsertLocalData(dto)));
  }
}
