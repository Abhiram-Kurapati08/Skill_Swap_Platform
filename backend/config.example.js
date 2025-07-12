// Example configuration file
// Copy this to .env file and update the values

module.exports = {
  // Server Configuration
  PORT: 5000,
  NODE_ENV: 'development',

  // Database Configuration
  MONGODB_URI: 'mongodb://localhost:27017/skill-swap-platform',

  // JWT Configuration
  JWT_SECRET: 'your-super-secret-jwt-key-change-this-in-production',
  JWT_EXPIRES_IN: '7d',

  // File Upload Configuration (for profile photos)
  MAX_FILE_SIZE: 5242880,
  ALLOWED_FILE_TYPES: 'image/jpeg,image/png,image/gif',

  // Email Configuration (optional for future features)
  SMTP_HOST: 'smtp.gmail.com',
  SMTP_PORT: 587,
  SMTP_USER: 'your-email@gmail.com',
  SMTP_PASS: 'your-app-password'
};

/*
To use this configuration:

1. Create a .env file in the backend directory
2. Add the following variables:

PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/skill-swap-platform
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif

3. Update the values according to your setup
*/ 