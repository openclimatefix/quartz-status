export interface StatusMessageResponse {
  status: string | number;
  message: string;
}
export interface ExpressViewResponse {
  render(view: string, locals?: Record<string, any>): void;
}
export type RouteResponse<T> = {
  200: T;
};
export type AuthenticatedRouteResponses<T> = RouteResponse<T> & {
  401: StatusMessageResponse;
  403: StatusMessageResponse;
};
