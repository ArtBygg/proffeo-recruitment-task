import { Signal, signal, WritableSignal } from '@angular/core';
import { IdBased } from '@app/shared/types/models/shared/id-based.model';
import { cloneDeep } from 'lodash';

export class DataStore<T extends IdBased> {
  public readonly store: Map<string, WritableSignal<T>> = new Map<string, WritableSignal<T>>();

  public get(id: string): Signal<T> | undefined {
    if (!this.store.has(id)) {
      this.store.set(id, signal(undefined));
    }
    return this.store.get(id)!.asReadonly();
  }

  public hasDataForId(id: string): boolean {
    return this.store.has(id) && this.store.get(id)()?.id !== undefined;
  }

  public reserveId(id: string): void {
    if (this.store.has(id)) {
      return;
    }
    this.store.set(id, signal(undefined));
  }

  public upsert(entity: T): Signal<T> | undefined {
    if (this.store.has(entity.id)) {
      this.store.get(entity.id).set(cloneDeep(entity));
    } else {
      this.store.set(entity.id, signal(entity));
    }

    return this.get(entity.id);
  }

  public upsertMany(entites: T[]): Signal<T>[] | undefined {
    for (const entity of entites) {
      this.upsert(entity);
    }

    return entites.map(entity => this.get(entity.id));
  }

  public delete(id: string): void {
    if (this.store.has(id)) {
      this.store.delete(id);
    }
  }

  public clear(): void {
    this.store.clear();
  }
}
