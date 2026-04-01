const region = process.env.AWS_REGION || process.env.COGNITO_REGION || 'ap-south-1'
const userPoolId = process.env.COGNITO_USER_POOL_ID || 'ap-south-1_vtZ5ayLeL'
const clientId = process.env.COGNITO_CLIENT_ID || '1e1urg04g36ej4r46lpeo3s8p4'
const clientSecret = process.env.COGNITO_CLIENT_SECRET || ''

if (!userPoolId || !clientId) {
  throw new Error('Cognito configuration missing. Set COGNITO_USER_POOL_ID and COGNITO_CLIENT_ID.')
}

export const cognitoConfig = {
  region,
  userPoolId,
  clientId,
  clientSecret,
}