import {
  ClientBuilder,
  ClientGeneratorsBuilder,
  generateFormDataAndUrlEncodedFunction,
  generateVerbImports,
  GeneratorOptions,
  GeneratorVerbOptions,
  GetterPropType,
  toObjectString,
  generateBodyOptions,
  resolveRef,
  ClientHeaderBuilder, 
  pascal,
  camel, 
  ClientFooterBuilder, 
  TEMPLATE_TAG_REGEX,
  ResReqTypesValue
} from '@orval/core';
import {
  PathItemObject,
  ParameterObject,
  ReferenceObject,
} from 'openapi3-ts/oas30';
import { SchemaObject } from 'openapi3-ts/oas31';

export const generateRequestFunction = (
  {
    queryParams,
    operationName,
    response,
    body,
    props,
    verb,
    fetchReviver,
    formData,
    formUrlEncoded,
    override,
  }: GeneratorVerbOptions,
  { route, context, pathRoute }: GeneratorOptions,
) => {
  const implementationRoute = context.output.urlEncodeParameters
    ? makeRouteSafe(route)
    : route;

  const isFormData = override?.formData.disabled === false;
  const isFormUrlEncoded = override?.formUrlEncoded !== false;

  const inputTypeName = pascal(`${operationName}-input`)

  const successfulResponseTypeName = pascal(`${operationName}SuccessfulResponse`)
  const errorResponseTypeName = pascal(`${operationName}ErrorResponse`)

  const spec = context.specs[context.specKey]!.paths[pathRoute] as
    | PathItemObject
    | undefined;
  const requireAuthentication = (spec?.[verb]?.security && spec[verb].security.length > 0) || (context.specs[context.specKey]?.security && context.specs[context.specKey]!.security!.length > 0);
  const parameters =
    spec?.[verb]?.parameters || ([] as (ParameterObject | ReferenceObject)[]);

  const explodeParameters = parameters.filter((parameter) => {
    const { schema } = resolveRef<ParameterObject>(parameter, context);
    const schemaObject = schema.schema as SchemaObject;

    return (
      schema.in === 'query' &&
      schemaObject.type === 'array' &&
      (schema.explode || override.fetch.explode)
    );
  });

  const explodeParametersNames = explodeParameters.map((parameter) => {
    const { schema } = resolveRef<ParameterObject>(parameter, context);

    return schema.name;
  });
  const hasDateParams =
    context.output.override.useDates &&
    parameters.some(
      (p) =>
        'schema' in p &&
        p.schema &&
        'format' in p.schema &&
        p.schema.format === 'date-time',
    );

  const explodeArrayImplementation =
    explodeParameters.length > 0
      ? `const explodeParameters = ${JSON.stringify(explodeParametersNames)};

    if (Array.isArray(value) && explodeParameters.includes(key)) {
      value.forEach((v) => normalizedParams[key] = v === null ? 'null' : ${hasDateParams ? 'v instanceof Date ? v.toISOString() : ' : ''}v.toString());
      return;
    }
      `
      : '';

  const isExplodeParametersOnly =
    explodeParameters.length === parameters.length;

  const nomalParamsImplementation = `if (value !== undefined) {
      normalizedParams[key] = value === null ? 'null' : ${hasDateParams ? 'value instanceof Date ? value.toISOString() : ' : ''}value.toString()
    }`;

  const queryImplementation = `
${
  queryParams
    ? `  const normalizedParams = {};

  Object.entries(params || {}).forEach(([key, value]) => {
    ${explodeArrayImplementation}
    ${!isExplodeParametersOnly ? nomalParamsImplementation : ''}
  });`
    : ''
}
  ${
    context.output.urlEncodeParameters
      ? `for (const [key, value] of normalizedParams) {
    normalizedParams[key] = encodeURIComponent(value);
  }`
      : ``
  }

  return normalizedParams;
  `

  const mapResponseDataType = (response: ResReqTypesValue) => {
    const name = `${successfulResponseTypeName}${pascal(response.key)}`;
    return {
      name,
      value: `export type ${name} = ${response.value || 'unknown'}
`,
    };
  }

  const successfulResponseTypes = response.types.success.map(mapResponseDataType);
  const errorResponseTypes = response.types.errors.map(mapResponseDataType);

  const compositeSuccessfulResponse = `export type ${successfulResponseTypeName} = ${successfulResponseTypes.length > 0 ? successfulResponseTypes.map((r) => r.name).join(' | ') : 'unknown'}`;
  const compositeErrorResponse = `export type ${errorResponseTypeName} = ${errorResponseTypes.length > 0 ? errorResponseTypes.map((r) => r.name).join(' | ') : 'unknown'}`;

  const responseTypeImplementation = `
${successfulResponseTypes.map((r) => r.value).join('\n\n')}
${errorResponseTypes.map((r) => r.value).join('\n\n')}
    
${compositeSuccessfulResponse}
${compositeErrorResponse}
`

  const propsImplementation = toObjectString(
    props,
    'implementation',
  )
  const inputTypeImplementation = `export type ${inputTypeName} = ${propsImplementation.length === 0 ? 'void' : `{
    ${propsImplementation}
  }`}`

  const requestBodyParams = generateBodyOptions(
    body,
    isFormData,
    isFormUrlEncoded,
  );
  const bodyDataImplementation = requestBodyParams
    ? (isFormData && body.formData) ||
      (isFormUrlEncoded && body.formUrlEncoded) ||
      body.contentType === 'text/plain'
      ? `${requestBodyParams}`
      : `JSON.stringify(${requestBodyParams})`
    : '';
  const bodyFactoryImplementation = `
  const body = ${bodyDataImplementation};
  return {
    body,
    contentType: '${body.contentType || 'application/json'}',
  }
  `

  const reviver = fetchReviver ? `, ${fetchReviver.name}` : '';
  const fetchResponseImplementation = `
  const body = [204, 205, 304].includes(res.status) ? null : await res.text()
  const data: ${successfulResponseTypeName} = body ? JSON.parse(body${reviver}) : {}

  if (!res.status.toString().startsWith('2')) {
    return {
      success: false,
      error: data,
    }
  }


  return {
    success: true,
    output: data
  }
`;

  const bodyForm = generateFormDataAndUrlEncodedFunction({
    formData,
    formUrlEncoded,
    body,
    isFormData,
    isFormUrlEncoded,
  });

  const params = props.filter((p) => p.type === GetterPropType.PARAM || p.type === GetterPropType.NAMED_PATH_PARAMS)

  const definitionImplementation = `
    return httpApi.defineEndpoint<${inputTypeName}, ${successfulResponseTypeName}, ${errorResponseTypeName}>({
      url: (${ params.length > 0 ? `{${toObjectString(
        params,
        'name'
      )}}` : ''}) => \`${implementationRoute}\`,
      method: '${verb.toUpperCase()}',
      query: ${queryParams ? `({${toObjectString(
        props.filter((p) => p.type === GetterPropType.QUERY_PARAM), 
        'name'
      )}}) => {
        ${queryImplementation}
      }` : `undefined`},
      body: ${requestBodyParams ? `({
        ${
        toObjectString(
          props.filter((p) => p.type === GetterPropType.BODY),
          'name'
        )
      }}) => {
        ${bodyForm ? bodyForm : ''}
      ${bodyFactoryImplementation}}` : `undefined`},
      output: async (res) => {
      ${fetchResponseImplementation}
      },
      requireAuthentication: ${requireAuthentication ? 'true' : 'false'},
    })
  `

  const definitionConstructorImplementation = `
const ${operationName} = (httpApi: HttpApi) => {
${definitionImplementation}
}
`

  const implementation =
    `${responseTypeImplementation}` +
    `${inputTypeImplementation}\n` +
    `${definitionConstructorImplementation}\n`

  return implementation;
};

export const fetchResponseTypeName = (
  includeHttpResponseReturnType: boolean | undefined,
  definitionSuccessResponse: string,
  operationName: string,
) => {
  return pascal(includeHttpResponseReturnType
    ? `${operationName}Response`
    : definitionSuccessResponse);
};

const generateClient: ClientBuilder = (verbOptions, options) => {
  const imports = generateVerbImports(verbOptions);
  const functionImplementation = generateRequestFunction(verbOptions, options);

  return { implementation: `${functionImplementation}\n`, imports };
};

const generateHeader: ClientHeaderBuilder = () => {
  return `
import '@api-def/core'
export type HttpApi = ReturnType<typeof createHttpApi>\n\n
  `
};

const generateFooter: ClientFooterBuilder = ({
  operationNames,
  title
}) => {
  if (operationNames.length === 0) {
    return 'export default (httpApi: HttpApi) => ({});\n';
  }

  return `export const ${camel(title!)} = (httpApi: HttpApi) => ({ ${operationNames.map((opName) => `${opName}: ${opName}(httpApi)`).join(',\n')} });\n`;
}

export const makeRouteSafe = (route: string): string =>
  route.replaceAll(TEMPLATE_TAG_REGEX, `\${encodeURIComponent(String($1))}`);

const fetchClientBuilder: ClientGeneratorsBuilder = {
  client: generateClient,
  header: generateHeader,
  footer: generateFooter,
  title: (operationName: string) => operationName,
  dependencies: () => [
    {
      dependency: '@api-def/provider-http',
      exports: [
        {
          name: 'createHttpApi',
        }
      ]
    },
    {
      dependency: '@api-def/core',
      exports: [
        {
          name: 'EndpointDefinition',
        }
      ]
    }
  ],
};

export const builder = () => () => fetchClientBuilder;

export default builder;