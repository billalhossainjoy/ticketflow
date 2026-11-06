process.env.NODE_ENV = "test";

process.env.DATABASE_URL = "postgresql://test:test@127.0.0.1:1/ticketflow_test";

process.env.BETTER_AUTH_URL = "http://localhost:3000";

process.env.BETTER_AUTH_SECRET = "ticketflow-test-only-secret-not-for-production";
