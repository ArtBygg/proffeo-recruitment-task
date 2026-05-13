/**
 * Parses authenticated shell URLs for active company / project context.
 * Matches primary app routes: `/companies/:companyId/...` and `.../projects/:projectId/...`.
 */
export function parseShellCompanyId(url: string): string | null {
  const match = url.match(/\/companies\/([^/]+)/);
  return match ? match[1] : null;
}

export function parseShellProjectId(url: string): string | null {
  const match = url.match(/\/projects\/([^/]+)/);
  return match ? match[1] : null;
}
