// Server configuration
export const config = {
  // Environment
  nodeEnv: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "5000", 10),

  // Database
  databaseUrl: process.env.DATABASE_URL!,

  // Authentication
  jwtSecret: process.env.JWT_SECRET || "dev-secret-key",
  jwtExpiresIn: "7d",

  // Email Service
  resendApiKey: process.env.RESEND_API_KEY || "",

  // AI Service
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || "",

  // Feature Flags
  features: {
    aiEnabled: !!process.env.ANTHROPIC_API_KEY,
    emailEnabled: !!process.env.RESEND_API_KEY,
  },

  // Security
  cors: {
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  },

  // Rate Limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  },
};

// Validate required environment variables in production
if (config.nodeEnv === "production") {
  const required = [
    "DATABASE_URL",
    "JWT_SECRET",
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error(`Missing required environment variables: ${missing.join(", ")}`);
    process.exit(1);
  }

  if (config.jwtSecret === "dev-secret-key") {
    console.error("JWT_SECRET must be set in production");
    process.exit(1);
  }
}
