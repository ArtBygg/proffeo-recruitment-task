import { HttpClient } from '@angular/common/http';
import { computed, effect, inject, Injectable, Signal, signal, untracked } from '@angular/core';
import { ToastService } from '@app/shared/services/shared/toast.service';
import { UserStatus } from '@app/shared/types/enums/user-status.enum';
import {
  CreateUserRequestBody,
  UpdateUserDetailsRequestBody,
  UserDTO
} from '@app/shared/types/models/user/user-dto.model';
import { User } from '@app/shared/types/models/user/user.model';
import { DataStore } from '@app/store/data-store';
import { IdsCollection } from '@app/store/ids-collection';
import { environment } from '@env/environment';
import { TranslateService } from '@ngx-translate/core';
import { catchError, finalize, map, Observable, tap, throwError } from 'rxjs';
import { ActiveCompanyService } from './active-company.service';
import { AuthService } from './auth.service';
import { DataService } from './data-service';
import { UserFactory } from './factories/user.factory';
import { LoaderService } from './shared/loader.service';

/**
 * UsersDataService - User entities, company user lists, and related HTTP mutations.
 *
 * Loads company users when {@link ActiveCompanyService.activeCompanyId} is set, and upserts
 * {@link AuthService.currentUser} into the user store when it changes (constructor `effects`), replacing
 * `UserSignedIn` / `ActiveCompanySet` notification handling.
 *
 * Scope: Global (`providedIn: 'root'`).
 *
 * Usage: Company users views, modals, and user pickers.
 *
 * Architecture:
 * - {@link UsersDataService}: Store and HTTP
 * - {@link ActiveCompanyService}: Company scope for company user lists
 * - {@link AuthService}: Source of the signed-in user record in the store
 */
const MOCK_LONG_USER_TEXT =
  'zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzadsadassssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss'.repeat(
    20
  ) + 'as12331231213';

const MOCK_COMPANY_USERS: UserDTO[] = [
  {
    id: '3fc67e07-cc72-4f05-b3b0-f373b5394139',
    email: 'admin@proffeo.net',
    firstName: 'Admin@Proffeo',
    lastName: 'Net',
    profileCompletion: 0,
    status: UserStatus.ACTIVE,
    createdAt: new Date('2024-02-21T13:54:40.464099Z'),
    lastActivityDate: new Date('2024-05-16T19:47:25.604759Z'),
    updatedAt: new Date('2025-09-12T22:35:13.372729Z'),
    activatedAt: new Date('2024-03-06T11:31:59.464101Z')
  },
  {
    id: '27ac90b2-8974-44ce-9c68-bfbe56ecf3a2',
    email: 'karol@bbblikk.no',
    firstName: 'Karol',
    lastName: ' Kojko',
    notes: '',
    profileCompletion: 0,
    status: UserStatus.ACTIVE,
    createdAt: new Date('2024-05-31T11:50:11.13921Z'),
    lastActivityDate: new Date('2025-10-07T18:27:10.97591Z'),
    updatedAt: new Date('2025-10-07T18:27:11.117844Z'),
    activatedAt: new Date('2024-05-31T19:49:58.011431Z')
  },
  {
    id: '019cf825-85a8-7080-b9ba-be71c290931b',
    email: 'klaudia.szczepanska.x@gmail.com',
    firstName: 'Klaudia',
    lastName: 'Szczepańska',
    notes: 'sad',
    profileCompletion: 100,
    status: UserStatus.ACTIVE,
    createdAt: new Date('2026-03-16T19:35:34.570257Z'),
    updatedAt: new Date('2026-04-02T18:47:13.692486Z'),
    activatedAt: new Date('2026-03-25T11:35:38.998533Z'),
    address: 'asd',
    phoneNumbers: '111111111'
  },
  {
    id: 'ddef1ffc-ecb3-4224-ae77-2621fcf1f3f2',
    email: 'kubanam1995@gmail.com',
    firstName: 'Kuba',
    lastName: 'Nam',
    notes: '',
    profileCompletion: 0,
    status: UserStatus.ACTIVE,
    createdAt: new Date('2025-10-06T16:28:08.878003Z'),
    lastActivityDate: new Date('2026-01-07T13:58:51.801467Z'),
    updatedAt: new Date('2026-01-07T13:58:51.953258Z'),
    activatedAt: new Date('2025-10-06T16:31:43.833394Z')
  },
  {
    id: '4d51d39e-ebbd-4d3d-a82b-c8cbc14d65e4',
    email: 'Lenare0306@gmail.com',
    firstName: 'Lena',
    lastName: 'Reglinskaa',
    notes: '',
    profileCompletion: 0,
    status: UserStatus.INACTIVE,
    createdAt: new Date('2024-10-09T15:07:01.336482Z'),
    phoneNumbers: '123'
  },
  {
    id: '2d666090-ae98-4f47-bcb9-4dea6216fef2',
    email: 'piotr.artbygg@gmail.com',
    firstName: 'Piotr@Artbygg',
    lastName: 'gmail',
    profileCompletion: 0,
    status: UserStatus.INACTIVE,
    createdAt: new Date('2025-04-27T18:53:47.31547Z'),
    updatedAt: new Date('2026-03-20T15:26:13.232398Z'),
    address: 'sdfgh',
    phoneNumbers: '333333333'
  },
  {
    id: '932b811d-0af0-423d-a673-29d513edc039',
    email: 'piotr@proffeo.net',
    firstName: 'Piotr@Proffeo ',
    lastName: 'Net',
    notes: 'Multi company user',
    profileCompletion: 100,
    status: UserStatus.ACTIVE,
    createdAt: new Date('2024-03-13T21:20:42.564067Z'),
    lastActivityDate: new Date('2026-01-06T23:56:57.491135Z'),
    updatedAt: new Date('2026-01-23T20:29:55.464496Z'),
    activatedAt: new Date('2025-04-04T14:11:11.084261Z'),
    blockedAt: new Date('2025-04-04T14:11:09.191067Z')
  },
  {
    id: 'f6a74aab-3900-4b84-aee6-daff0fe64ee8',
    email: 'raciniak@gmail.com',
    firstName: 'Krzysztof',
    lastName: 'Raciniewski',
    notes: '',
    profileCompletion: 0,
    status: UserStatus.LOCKED,
    createdAt: new Date('2024-10-17T09:37:06.832161Z'),
    lastActivityDate: new Date('2024-10-18T08:00:27.575126Z'),
    updatedAt: new Date('2025-10-16T20:18:48.837737Z'),
    activatedAt: new Date('2025-09-19T11:04:54.244735Z'),
    blockedAt: new Date('2025-10-16T20:18:48.835586Z'),
    phoneNumbers: '664964859'
  },
  {
    id: '6e7b3d4c-f940-48b2-9f96-d955082435f2',
    email: 'Raymond@bbblikk.no',
    firstName: 'Raymond ',
    lastName: 'Szymanski ',
    notes: '',
    profileCompletion: 0,
    status: UserStatus.ACTIVE,
    createdAt: new Date('2024-05-31T11:48:44.69193Z'),
    lastActivityDate: new Date('2025-07-10T04:00:03.129584Z'),
    updatedAt: new Date('2024-06-06T17:23:33.242458Z'),
    activatedAt: new Date('2024-06-06T17:23:33.242188Z')
  },
  {
    id: '632ceed0-5251-42a6-b5ba-f509c3afdbca',
    email: 'r.pietraszewski75@gmail.com',
    firstName: 'Rafał',
    lastName: 'Pietraszewski',
    notes: '',
    profileCompletion: 0,
    status: UserStatus.ACTIVE,
    createdAt: new Date('2023-04-04T10:03:46.941908Z'),
    lastActivityDate: new Date('2026-01-07T11:50:10.35461Z'),
    updatedAt: new Date('2026-01-07T11:50:10.495853Z'),
    activatedAt: new Date('2023-04-04T15:07:26.147579Z'),
    address: '',
    phoneNumbers: ''
  },
  {
    id: 'e5279a59-11a2-4630-b46c-fee951cb1340',
    email: 'r.testowy75@gmail.com',
    firstName: 'Rafal',
    lastName: 'Testowy',
    notes: '',
    profileCompletion: 0,
    status: UserStatus.INACTIVE,
    createdAt: new Date('2025-03-09T13:59:27.433557Z')
  },
  {
    id: 'df74a6c0-c33e-4abe-81ab-b102e29289e8',
    email: 'sdrottning@hotmail.com',
    firstName: 'Sebastian ',
    lastName: 'Drottning ',
    notes: '',
    profileCompletion: 0,
    status: UserStatus.INACTIVE,
    createdAt: new Date('2024-10-19T09:37:49.95313Z')
  },
  {
    id: 'babcb2de-c990-4c75-9289-f0974784a532',
    email: 'szymon20005920@gmail.com',
    firstName: 'Szymon ',
    lastName: 'Enderman',
    notes: '',
    profileCompletion: 0,
    status: UserStatus.ACTIVE,
    createdAt: new Date('2025-03-18T10:26:19.612836Z'),
    lastActivityDate: new Date('2026-01-07T08:15:18.192981Z'),
    updatedAt: new Date('2026-01-07T08:15:18.376898Z'),
    activatedAt: new Date('2025-03-18T19:02:21.825303Z')
  },
  {
    id: '4acd294d-044c-4ce2-9966-b6da6aab4884',
    email: 'test@test.co',
    firstName: 'Test',
    lastName: `Test${MOCK_LONG_USER_TEXT}`,
    notes: MOCK_LONG_USER_TEXT,
    profileCompletion: 100,
    status: UserStatus.INACTIVE,
    createdAt: new Date('2025-05-20T18:53:09.571977Z'),
    updatedAt: new Date('2026-03-31T17:06:20.385754Z'),
    address: MOCK_LONG_USER_TEXT,
    phoneNumbers: ''
  },
  {
    id: 'c1a00905-25ab-4cc1-91e5-62e8a12be392',
    email: 'test@test.pl',
    firstName: 'daria',
    lastName: 'Dariam',
    notes: 'Kc',
    profileCompletion: 100,
    status: UserStatus.INACTIVE,
    createdAt: new Date('2025-04-24T21:07:56.581069Z'),
    updatedAt: new Date('2026-04-02T16:08:21.967072Z'),
    address: 'test',
    phoneNumbers: '123456789'
  },
  {
    id: '89dba373-bfdf-4ca6-845c-1ad06c99ce0c',
    email: 'tworze@nowego.usera',
    firstName: 'test',
    lastName: 'usera',
    profileCompletion: 0,
    status: UserStatus.INACTIVE,
    createdAt: new Date('2025-04-28T18:18:37.984863Z'),
    address: 'test',
    phoneNumbers: '192222011'
  },
  {
    id: 'ec1b7e30-194c-466a-a7c6-0c34de58a7ba',
    email: 'zysko.marek@gmail.com',
    firstName: 'Marek',
    lastName: 'Zysko',
    notes: '12345',
    profileCompletion: 100,
    status: UserStatus.ACTIVE,
    createdAt: new Date('2026-01-15T19:37:48.130516Z'),
    updatedAt: new Date('2026-04-02T19:04:14.50626Z'),
    activatedAt: new Date('2026-01-15T19:40:50.772268Z'),
    address: 'asda',
    phoneNumbers: '531 876 444'
  }
];

@Injectable({ providedIn: 'root' })
export class UsersDataService extends DataService<UserDTO, User> {
  private readonly users: DataStore<User> = new DataStore<User>();
  private readonly companyUsers: DataStore<IdsCollection> = new DataStore<IdsCollection>();

  private readonly httpClient: HttpClient = inject(HttpClient);
  private readonly loaderService: LoaderService = inject(LoaderService);
  private readonly toastService: ToastService = inject(ToastService);
  private readonly translateService: TranslateService = inject(TranslateService);
  private readonly userFactory: UserFactory = inject(UserFactory);
  private readonly activeCompanyService: ActiveCompanyService = inject(ActiveCompanyService);
  private readonly authService: AuthService = inject(AuthService);

  public constructor() {
    super();
    effect(() => {
      const companyId = this.activeCompanyService.activeCompanyId();
      if (!companyId) {
        return;
      }
      untracked(() => {
        this.loadCompanyUsers(companyId);
      });
    });
    effect(() => {
      const user = this.authService.currentUser();
      if (!user) {
        return;
      }
      untracked(() => {
        this.users.upsert(user);
      });
    });
  }

  public getById(userId: string): Signal<User | undefined> {
    return computed(() => this.users.get(userId)());
  }

  public getCompanyUsers(companyId: string): Signal<User[] | undefined> {
    if (!companyId) {
      return signal(undefined);
    }

    return computed(
      () =>
        this.companyUsers
          .get(companyId)()
          ?.ids?.map(id => this.users.get(id)()) || []
    );
  }

  public loadCompanyUsers(companyId: string): void {
    if (this.companyUsers.hasDataForId(companyId)) {
      return;
    }
    this.fetchCompanyUsers(companyId);
  }

  public upsertLocalData(dto: UserDTO): Signal<User> {
    return dto ? this.users.upsert(this.userFactory.produce(dto)) : signal(undefined);
  }

  private fetchCompanyUsers(companyId: string): void {
    this.users.upsertMany(MOCK_COMPANY_USERS.map(userDto => this.userFactory.produce(userDto)));
    this.companyUsers.upsert({
      id: companyId,
      ids: MOCK_COMPANY_USERS.map(userDto => userDto.id)
    });
  }

  public updateUserDetails(companyId: string, userId: string, request: UpdateUserDetailsRequestBody): Observable<User> {
    const url = `${environment.APIEndPoint}companies/${companyId}/users/${userId}`;
    this.loaderService.startLoading();

    return this.httpClient.put<UserDTO>(url, request).pipe(
      map(dto => {
        const user = this.upsertLocalData(dto)();
        this.toastService.success(
          this.translateService.instant('toasts.user-details-successfully-saved', {
            value: `${user.firstName} ${user.lastName}`
          })
        );
        return user;
      }),
      catchError((error: unknown) => throwError(() => error)),
      finalize(() => this.loaderService.stopLoading())
    );
  }

  public createUser(companyId: string, request: CreateUserRequestBody): Observable<User> {
    const url = `${environment.APIEndPoint}companies/${companyId}/users`;
    this.loaderService.startLoading();

    return this.httpClient.post<UserDTO>(url, request).pipe(
      map(userDTO => {
        const user = this.upsertLocalData(userDTO)();

        this.companyUsers.upsert({
          id: companyId,
          ids: (this.companyUsers.get(companyId)()?.ids ?? []).concat(userDTO.id)
        });

        this.toastService.success(
          this.translateService.instant('toasts.user-successfully-created', {
            value: `${userDTO.firstName} ${userDTO.lastName}`
          })
        );

        return user;
      }),
      catchError((error: unknown) => throwError(() => error)),
      finalize(() => this.loaderService.stopLoading())
    );
  }

  public deleteUser(companyId: string, user: User): Observable<void> {
    this.loaderService.startLoading();

    return this.httpClient.delete<void>(`${environment.APIEndPoint}companies/${companyId}/users/${user.id}`).pipe(
      tap(() => {
        this.users.delete(user.id);
        const companyUserIds = this.companyUsers.get(companyId)();
        if (companyUserIds?.ids?.length) {
          this.companyUsers.upsert({
            id: companyId,
            ids: companyUserIds.ids.filter(applicationUserId => applicationUserId !== user.id)
          });
        }
        this.toastService.success(
          this.translateService.instant('toasts.user-successfully-deleted', {
            value: user.fullName
          })
        );
      }),
      catchError((error: unknown) => throwError(() => error)),
      finalize(() => this.loaderService.stopLoading())
    );
  }

  public lockUser(companyId: string, user: User): Observable<User> {
    this.loaderService.startLoading();

    return this.httpClient
      .put<UserDTO>(`${environment.APIEndPoint}companies/${companyId}/users/${user.id}/lock`, {})
      .pipe(
        map(dto => {
          const updated = this.upsertLocalData(dto)();
          this.toastService.success(
            this.translateService.instant('toasts.user-successfully-locked', { value: user.fullName })
          );
          return updated;
        }),
        catchError((error: unknown) => throwError(() => error)),
        finalize(() => this.loaderService.stopLoading())
      );
  }

  public unlockUser(companyId: string, user: User): Observable<User> {
    this.loaderService.startLoading();

    return this.httpClient
      .put<UserDTO>(`${environment.APIEndPoint}companies/${companyId}/users/${user.id}/unlock`, {})
      .pipe(
        map(dto => {
          const updated = this.upsertLocalData(dto)();
          this.toastService.success(
            this.translateService.instant('toasts.user-successfully-unlocked', { value: user.fullName })
          );
          return updated;
        }),
        catchError((error: unknown) => throwError(() => error)),
        finalize(() => this.loaderService.stopLoading())
      );
  }

  public resendActivationLink(user: User): Observable<void> {
    this.loaderService.startLoading();

    return this.httpClient
      .post<void>(`${environment.APIEndPoint}auth/resend-account-activation-link`, { userId: user.id })
      .pipe(
        tap(() => {
          this.toastService.success(this.translateService.instant('toasts.user-successfully-resend-activation-link'));
        }),
        catchError((error: unknown) => throwError(() => error)),
        finalize(() => this.loaderService.stopLoading())
      );
  }
}
