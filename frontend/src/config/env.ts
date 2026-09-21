const apiBaseUrl =
  import.meta.env
    .VITE_API_BASE_URL;

const awsRegion =
  import.meta.env
    .VITE_AWS_REGION;

const cognitoUserPoolId =
  import.meta.env
    .VITE_COGNITO_USER_POOL_ID;

const cognitoClientId =
  import.meta.env
    .VITE_COGNITO_CLIENT_ID;


if (!apiBaseUrl) {
  throw new Error(
    'VITE_API_BASE_URL no está configurada'
  );
}

if (
  !awsRegion ||
  !cognitoUserPoolId ||
  !cognitoClientId
) {
  throw new Error(
    'La configuración de Cognito no está completa'
  );
}


export const env = {
  apiBaseUrl,
  awsRegion,
  cognitoUserPoolId,
  cognitoClientId,
};