process.env.DB_NAME = ":memory:";
process.env.DB_USER = "testUser";
process.env.DB_PASS = "testPassword";
process.env.SYNCHRONIZE = "true";
process.env.JWT_SECRET = Math.random(1000);

// Uncomment to debug tests
//process.env.NODE_ENV = "development";
//process.env.DB_NAME = "test.sqlite";
