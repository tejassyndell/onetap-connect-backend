module.exports = {
    apps: [
      {
        name: 'highgrove-backend',
        script: 'app.js', // Entry point of your Node.js application
        watch: true,
        env: {
          NODE_ENV: 'production',
          PORT: process.env.PORT
        },
      },
    ],
  };