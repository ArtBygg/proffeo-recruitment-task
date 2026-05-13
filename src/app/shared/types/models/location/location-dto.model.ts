export interface CreateLocationRequest {
  name: string;
  parentId: string;
  orderNo?: number;
}

export interface CreateMultipleLocationRequest {
  name: string;
  parentId: string;
  amount: number;
  numbering: number;
}

export interface UpdateLocationRequest {
  name: string;
  parentId: string;
  orderNo: number;
}
