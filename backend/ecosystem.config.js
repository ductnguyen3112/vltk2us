module.exports = {
  apps: [
    {
      name: 'jx2us',             // Give your application a name
      script: 'server.js',       // Path to your application's entry point
      watch: true,               // Enable automatic restart on file changes
      env: {
        NODE_ENV: 'production',
        PORT: 3333,              // Set your application's port
      },
    },
  ],
};
