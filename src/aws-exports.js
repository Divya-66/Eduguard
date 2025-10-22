// eslint-disable-next-line import/no-anonymous-default-export
export default {
  Auth: {
    Cognito: {
      userPoolId: 'eu-north-1_Bk3fVXL4y',
      userPoolClientId: 'eu-north-1_Bk3fVXL4y', // You'll need to get the actual client ID from AWS Console
      loginWith: {
        email: true,
        username: true,
        phone: false,
      },
    },
  },
};