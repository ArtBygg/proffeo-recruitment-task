import { GroupsDataService } from '@app/shared/services/groups-data.service';
import { Group } from '@app/shared/types/models/group/group.model';

function normalize(s: string): string {
  return s.trim().toLowerCase();
}

export function groupMatchesSearch(group: Group, query: string): boolean {
  const q = normalize(query);
  if (!q) {
    return true;
  }
  if (group.name?.toLowerCase().includes(q)) {
    return true;
  }
  for (const gu of group.users() ?? []) {
    const u = gu.applicationUser();
    const blob = `${u?.firstName ?? ''} ${u?.lastName ?? ''} ${u?.email ?? ''}`.toLowerCase();
    if (blob.includes(q)) {
      return true;
    }
  }
  return false;
}

export function subtreeMatchesSearch(
  group: Group,
  query: string,
  groupsData: GroupsDataService,
): boolean {
  if (!normalize(query)) {
    return true;
  }
  if (groupMatchesSearch(group, query)) {
    return true;
  }
  const childSignals = groupsData.getGroupChildren(group.id)() ?? [];
  for (const childSig of childSignals) {
    const child = childSig();
    if (child && subtreeMatchesSearch(child, query, groupsData)) {
      return true;
    }
  }
  return false;
}
