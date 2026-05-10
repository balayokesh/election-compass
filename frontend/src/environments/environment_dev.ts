export const environment = {
  production: false,
  dialogflow: {
    // These should come from environment variables or secure build process
    region: 'global',
    languageCode: 'en',
    proxyUrl: 'http://localhost:3000/api/dialogflow',
    firebase: {
      apiKey: '',
      authDomain: '',
      projectId: '',
      storageBucket: '',
      messagingSenderId: '',
      appId: '',
      measurementId: '',
    },
  },
};
