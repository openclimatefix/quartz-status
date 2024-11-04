export interface StatusMessageResponse {
  status: string;
  message: string;
}
export type RouteResponse<T> = {
  200: T;
};
export type AuthenticatedRouteResponses<T> = RouteResponse<T> & {
  401: StatusMessageResponse;
  403: StatusMessageResponse;
};
