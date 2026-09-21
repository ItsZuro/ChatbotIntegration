import {
  confirmSignUp,
  signIn,
  signOut,
  signUp,
} from "aws-amplify/auth";


export async function registerUser(
  email: string,
  password: string,
) {
  return signUp({
    username: email,
    password,
    options: {
      userAttributes: {
        email,
      },
    },
  });
}


export async function confirmUser(
  email: string,
  code: string,
) {
  return confirmSignUp({
    username: email,
    confirmationCode: code,
  });
}


export async function loginUser(
  email: string,
  password: string,
) {
  return signIn({
    username: email,
    password,
  });
}


export async function logoutUser() {
  await signOut();
}