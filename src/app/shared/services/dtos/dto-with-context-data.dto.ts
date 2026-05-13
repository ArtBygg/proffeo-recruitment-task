import { ContextDataDTO } from './context-data.dto';

export interface ModelWithContextData<T> {
  data: T;
  contextData: ContextDataDTO;
}
