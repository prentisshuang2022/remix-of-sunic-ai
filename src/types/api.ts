/**
 * 统一 API 响应结构
 * 所有 src/api/ 下的函数必须返回此类型
 */
export interface ApiResponse<T> {
  /** 请求是否成功 */
  success: boolean;
  /** 成功时的数据 */
  data: T | null;
  /** 失败时的错误信息 */
  error: string | null;
}

/**
 * 分页请求参数
 */
export interface PaginationParams {
  page: number;
  pageSize: number;
}

/**
 * 分页响应数据
 */
export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}