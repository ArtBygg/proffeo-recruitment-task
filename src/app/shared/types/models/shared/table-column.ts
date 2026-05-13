export interface TableColumn<T = unknown> {
  key: string;
  label: string;
  sortable?: boolean;
  isIdentifier?: boolean;
  renderFn?: (item: T) => string;
  maxWidth?: string;
  minWidth?: string;
}
