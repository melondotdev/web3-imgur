export interface ApiResponse<T> {
  message: string;
  data: T;
}

export interface ApiError {
  error: string;
  details?: Array<{ message: string }>;
}
