import { RequestConfig, RequestConstructor, RequestValues } from "./helpers/types";
import useRequest from "./helpers/useRequest";
import useResponse from "./helpers/useResponse";

const useApi = <
  TRequestValues extends RequestValues
>(
  requestConstructor: RequestConstructor<TRequestValues>,
  requestConfig?: RequestConfig<TRequestValues>
):
  | Promise<
      { status: string; isSuccess: boolean; data: any; errors: object } | any
    >
  | any => {
  const request = useRequest(requestConstructor, requestConfig);

  if (!request) {
    throw new Error("Something went wrong with your API request.");
  }

  return useResponse({
    method: request.method,
    path: request.path,
    exec: request.exec,
  });
};

export default useApi;
