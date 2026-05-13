import { Environment } from '@angular/cli/lib/config/workspace-schema';
import { InjectionToken } from '@angular/core';

export const ENVIRONMENT_INJECTION_TOKEN = new InjectionToken<Environment>('environment');
