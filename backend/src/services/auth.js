import crypto from 'crypto'
import {
  AdminInitiateAuthCommand,
  ChangePasswordCommand,
  CognitoIdentityProviderClient,
  ConfirmForgotPasswordCommand,
  ConfirmSignUpCommand,
  ForgotPasswordCommand,
  GetUserCommand,
  GlobalSignOutCommand,
  InitiateAuthCommand,
  ResendConfirmationCodeCommand,
  SignUpCommand,
} from '@aws-sdk/client-cognito-identity-provider'
import { CognitoJwtVerifier } from 'aws-jwt-verify'
import { cognitoConfig } from './cognito-config.js'

const cognitoClient = new CognitoIdentityProviderClient({
  region: cognitoConfig.region,
})

const accessTokenVerifier = CognitoJwtVerifier.create({
  userPoolId: cognitoConfig.userPoolId,
  clientId: cognitoConfig.clientId,
  tokenUse: 'access',
})

const idTokenVerifier = CognitoJwtVerifier.create({
  userPoolId: cognitoConfig.userPoolId,
  clientId: cognitoConfig.clientId,
  tokenUse: 'id',
})

function buildSecretHash(username) {
  if (!cognitoConfig.clientSecret) {
    return undefined
  }

  return crypto
    .createHmac('sha256', cognitoConfig.clientSecret)
    .update(`${username}${cognitoConfig.clientId}`)
    .digest('base64')
}

function toAttributeList(attributes = {}) {
  return Object.entries(attributes)
    .filter(([, value]) => typeof value === 'string' && value.trim().length > 0)
    .map(([Name, Value]) => ({ Name, Value }))
}

export async function verifyCognitoAccessToken(token) {
  return accessTokenVerifier.verify(token)
}

export async function verifyCognitoToken(token) {
  try {
    return await accessTokenVerifier.verify(token)
  } catch (accessError) {
    const message = accessError?.message || ''
    const isIdTokenProvided = /Token use not allowed:\s*id\.\s*Expected:\s*access/i.test(message)

    if (!isIdTokenProvided) {
      throw accessError
    }

    return idTokenVerifier.verify(token)
  }
}

export async function signUpCognitoUser({ email, password, attributes = {} }) {
  const lowerEmail = email.toLowerCase().trim()
  const command = new SignUpCommand({
    ClientId: cognitoConfig.clientId,
    Username: lowerEmail,
    Password: password,
    SecretHash: buildSecretHash(lowerEmail),
    UserAttributes: toAttributeList({
      email: lowerEmail,
      ...attributes,
    }),
  })

  return cognitoClient.send(command)
}

export async function confirmCognitoSignUp({ email, code }) {
  const lowerEmail = email.toLowerCase().trim()
  const command = new ConfirmSignUpCommand({
    ClientId: cognitoConfig.clientId,
    Username: lowerEmail,
    ConfirmationCode: code,
    SecretHash: buildSecretHash(lowerEmail),
  })

  return cognitoClient.send(command)
}

export async function resendCognitoSignUpCode(email) {
  const lowerEmail = email.toLowerCase().trim()
  const command = new ResendConfirmationCodeCommand({
    ClientId: cognitoConfig.clientId,
    Username: lowerEmail,
    SecretHash: buildSecretHash(lowerEmail),
  })

  return cognitoClient.send(command)
}

export async function loginWithCognito({ email, password }) {
  const lowerEmail = email.toLowerCase().trim()
  const authParameters = {
    USERNAME: lowerEmail,
    PASSWORD: password,
    SECRET_HASH: buildSecretHash(lowerEmail),
  }

  const command = new InitiateAuthCommand({
    ClientId: cognitoConfig.clientId,
    AuthFlow: 'USER_PASSWORD_AUTH',
    AuthParameters: authParameters,
  })

  try {
    return await cognitoClient.send(command)
  } catch (error) {
    const canFallbackToAdminAuth =
      error?.name === 'InvalidParameterException' &&
      error?.message?.includes('USER_PASSWORD_AUTH flow not enabled for this client')

    if (!canFallbackToAdminAuth) {
      throw error
    }

    const adminCommand = new AdminInitiateAuthCommand({
      UserPoolId: cognitoConfig.userPoolId,
      ClientId: cognitoConfig.clientId,
      AuthFlow: 'ADMIN_USER_PASSWORD_AUTH',
      AuthParameters: authParameters,
    })

    return cognitoClient.send(adminCommand)
  }
}

export async function refreshCognitoToken({ email, refreshToken }) {
  const lowerEmail = email.toLowerCase().trim()
  const command = new InitiateAuthCommand({
    ClientId: cognitoConfig.clientId,
    AuthFlow: 'REFRESH_TOKEN_AUTH',
    AuthParameters: {
      REFRESH_TOKEN: refreshToken,
      SECRET_HASH: buildSecretHash(lowerEmail),
    },
  })

  return cognitoClient.send(command)
}

export async function startForgotPassword(email) {
  const lowerEmail = email.toLowerCase().trim()
  const command = new ForgotPasswordCommand({
    ClientId: cognitoConfig.clientId,
    Username: lowerEmail,
    SecretHash: buildSecretHash(lowerEmail),
  })

  return cognitoClient.send(command)
}

export async function confirmForgotPassword({ email, code, newPassword }) {
  const lowerEmail = email.toLowerCase().trim()
  const command = new ConfirmForgotPasswordCommand({
    ClientId: cognitoConfig.clientId,
    Username: lowerEmail,
    ConfirmationCode: code,
    Password: newPassword,
    SecretHash: buildSecretHash(lowerEmail),
  })

  return cognitoClient.send(command)
}

export async function changeCognitoPassword({ accessToken, oldPassword, newPassword }) {
  const command = new ChangePasswordCommand({
    AccessToken: accessToken,
    PreviousPassword: oldPassword,
    ProposedPassword: newPassword,
  })

  return cognitoClient.send(command)
}

export async function signOutCognitoSession(accessToken) {
  if (!accessToken) {
    return
  }

  const command = new GlobalSignOutCommand({
    AccessToken: accessToken,
  })

  return cognitoClient.send(command)
}

export async function getCognitoUserProfile(accessToken) {
  const command = new GetUserCommand({
    AccessToken: accessToken,
  })

  const response = await cognitoClient.send(command)
  const attributes = {}

  for (const item of response.UserAttributes || []) {
    attributes[item.Name] = item.Value
  }

  return {
    username: response.Username,
    email: attributes.email?.toLowerCase(),
    name: attributes.name,
    phone: attributes.phone_number,
    attributes,
  }
}
