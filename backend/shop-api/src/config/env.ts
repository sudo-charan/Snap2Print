function validateEnvVars() {
  const requiredEnvVars = [
    'MONGODB_URI',
    'JWT_SECRET',
    'PORT'
  ];

  if (process.env.NODE_ENV === 'production') {
    requiredEnvVars.push('NODE_ENV');
  }

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingVars.join(', '));
    console.error('💡 Please check your .env file or deployment configuration');
    process.exit(1);
  }

  console.log('✅ Environment variables validated successfully');
}

export { validateEnvVars };
