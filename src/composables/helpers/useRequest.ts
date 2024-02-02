import isNotNil from "@/helpers/isNotNIl";
import { RequestConfig, RequestConstructor, RequestValues } from "./types";

const METHOD = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  UPDATE: "UPDATE",
  DELETE: "DELETE",
};

const useRequest = <
  TRequestValues extends RequestValues
>(
  constructor: RequestConstructor<TRequestValues>,
  config?: RequestConfig<TRequestValues>
): any => {
  try {
    return buildRequest(
      constructor,
      config || {} as RequestConfig<TRequestValues>
    );
  } catch (e) {
    console.error(e);
    return false;
  }
};

export default useRequest;

function buildRequest<
  TRequestValues extends RequestValues
>(
  {
    api,
    method,
    path: path,
    params: paramsSchema,
    query: querySchema,
    body: bodySchema,
  }: RequestConstructor<TRequestValues>,
  {
    path: forcedPath,
    params,
    query,
    body,
    config,
  }: RequestConfig<TRequestValues>
) {
  let finalPath = forcedPath || path;

  const finalMethod = method.toLowerCase();

  let finalQuery: Record<string, string> = {};
  let finalBody: Record<string, string | number | null> = {};

  if (!paramsSchema && !querySchema && !bodySchema) {
    return requestBuilder(method, path, config);
  }

  //If procedural path configuration
  if (!forcedPath) {
    if (params && paramsSchema && Object.keys(paramsSchema).length) {
      let paramNames = path
        .split("/")
        .filter((path: any) => path.includes(":"))
        .map((param: any) => param.replace(":", ""));

      if (paramNames.length !== Object.keys(paramsSchema).length) {
        throw Error(
          `'params' field is not correctly implementing 'path' params declaration. [Ex1]`
        );
      }

      const paramsSchemaKeys = Object.keys(paramsSchema);

      for (let key of paramsSchemaKeys) {
        if (!paramNames.includes(key)) {
          throw Error(
            `'params' field is not correctly implementing 'path' params declaration. [Ex2]`
          );
        } else {
          const paramSchema = paramsSchema[key];
          const paramValue = params[key];

          let finalParamValue =
            typeof paramValue === "undefined"
              ? paramSchema?.default
              : paramValue;

          if (isNotNil(finalParamValue)) {
            const format = paramSchema?.format;

            if (format) {
              finalParamValue = format(finalParamValue as any);
            }

            const validated = paramSchema?.validators
              ? paramSchema.validators.some(
                  (func: any) => func(finalParamValue) === true
                )
              : true;

            if (!validated) {
              throw Error(
                ` params '${key}' is not valid. Required: ${paramSchema?.validators?.join(
                  ", "
                )}`
              );
            }

            finalPath = finalPath.replace(`:${key}`, finalParamValue?.toString() || '');
          }
        }
      }
    }

    if (query && querySchema && Object.keys(querySchema).length) {
      const querySchemaKeys = Object.keys(querySchema);

      for (let key of querySchemaKeys) {
        const fieldSchema = querySchema[key];
        const fieldValue = query[key];

        let finalFieldValue =
          typeof fieldValue === "undefined" ? fieldSchema?.default : fieldValue;

        if (isNotNil(finalFieldValue)) {
          const format = fieldSchema?.format;

          if (format) {
            finalFieldValue = format(fieldValue as any);
          }

          const validated = fieldSchema?.validators
            ? fieldSchema.validators.some(
                (func: any) => func(finalFieldValue) === true
              )
            : true;

          if (!validated) {
            throw Error(
              ` query '${key}' is not valid. Required: ${fieldSchema?.validators?.join(
                ", "
              )}`
            );
          }

          if (isNotNil(finalFieldValue)) {
            finalQuery[key] = finalFieldValue.toString();
          }
        }
      }

      finalPath = finalPath + "?" + new URLSearchParams(finalQuery).toString();
    }

    if (body && bodySchema && Object.keys(bodySchema).length) {
      const bodySchemaKeys = Object.keys(bodySchema);

      for (let key of bodySchemaKeys) {
        const fieldSchema = bodySchema[key];
        const fieldValue = body[key];

        let finalFieldValue =
          typeof fieldValue === "undefined" ? fieldSchema?.default : fieldValue;

        if (typeof finalFieldValue !== 'undefined') {
          const format = fieldSchema?.format;

          if (format) {
            finalFieldValue = format(fieldValue as any);
          }

          const validated = fieldSchema?.validators
            ? fieldSchema.validators.some(
                (func: any) => func(finalFieldValue) === true
              )
            : true;
          if (!validated) {
            throw Error(
              ` body '${key}' is not valid. Required: ${fieldSchema?.validators?.join(
                ", "
              )}`
            );
          }

          finalBody[key] = finalFieldValue;
        }
      }
    }
  }
  //If scriptural forced path
  else {
    finalPath = forcedPath;
  }

  return requestBuilder(api, finalMethod, finalPath, finalBody, config);
}

function requestBuilder(
  api: any,
  method: string,
  path: string,
  body: any = null,
  config: any = {}
) {
  if (config.headers) {
    config.headers = {
      ...api.defaults.headers.common,
      ...api.defaults.headers[method],
      ...config.headers,
    };
  }
  // console.log('useRequest CONFIG',config);
  return {
    method,
    path,
    body: JSON.stringify(body),
    exec: [METHOD.GET, METHOD.DELETE].includes(method)
      ? () => api[method](path, config)
      : () => api[method](path, body, config),
  };
}
