export interface ApiResponse<T, M = undefined> {
  status: 'success' | 'error'
  message: string
  meta?: M
  data: T
  error: string | null
}

// export interface ApiResponseExtends {
//   status: string;
//   message: string;
//   error: string | null;
// }

// export interface PatentFilterApiResponse extends ApiResponseExtends {
//   data: PatentFilterData;
// }

// 其他 API 回傳的 data 型別請另外擴充，例如：
// export interface OtherApiData extends PatentFilterData {
//   ...
// }

// 使用範例：
// const response: ApiResponse<PatentFilterData> = ...
