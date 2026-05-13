export interface ToastConfig {
  type: 'success' | 'warning' | 'error' | 'info';
  timeOutMs: number;
  message?: string;
}
