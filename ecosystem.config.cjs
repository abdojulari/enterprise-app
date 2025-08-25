require('dotenv').config({ path: '/var/www/cam/.env' });
module.exports = {
    apps: [
      {
        name: 'enterprise-app',
        port: '3000',
        exec_mode: 'cluster',
        instances: 'max',
        script: './.output/server/index.mjs',
        env: {
          NODE_ENV: 'production',
        },
        env_file: '/var/www/enterprise-app/.env'
      }
    ]
  }
