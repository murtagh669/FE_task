import { AxiosInstance, AxiosStatic } from "axios";

export type RequestMethod = "GET" | "POST" | "PUT" | "UPDATE" | "DELETE";

export type RequestValues = {
  params?: Record<string, string | number | null>;
  query?: Record<string, string | number | null>;
  body?: Record<string, string | number | null>;
};

export type RequestValuesSchema<
  TValues extends Record<string, string | number | null> | undefined
> = TValues extends undefined
  ? undefined
  : {
      [K in keyof TValues]?: {
        format?: (value: TValues[K]) => TValues[K];
        validators?: Array<(value: TValues[K]) => boolean>;
        default?: TValues[K];
      };
    };

export type RequestConstructor<TRequestValues extends RequestValues> = {
  api: AxiosInstance | AxiosStatic;
  path: string;
  method: RequestMethod;
  params?: RequestValuesSchema<TRequestValues["params"]>;
  query?: RequestValuesSchema<TRequestValues["query"]>;
  body?: RequestValuesSchema<TRequestValues["body"]>;
};

export type RequestConfig<TRequestValues extends RequestValues> = {
  path?: string;
  config?: any;
} & TRequestValues;
