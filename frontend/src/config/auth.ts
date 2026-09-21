import {
  Amplify,
} from 'aws-amplify';

import {
  env,
} from './env';


export function configureAuth() {
  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId:
          env.cognitoUserPoolId,

        userPoolClientId:
          env.cognitoClientId,

        loginWith: {
          email: true,
        },

        signUpVerificationMethod:
          'code',
      },
    },
  });
}