const request = require('supertest');
const { app, server } = require('../server'); // Import the app and server instances

describe('Rate Limiter Middleware', () => {
  afterAll((done) => {
    server.close(done); // Close the server after all tests are done
  });

  it('should limit repeated requests from the same IP', async () => {
    const loginData = {
      email: 'testuser@example.com',
      password: 'password123',
    };

    // Make 10 successful requests
    for (let i = 0; i < 10; i++) {
      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      // Assuming the login credentials are incorrect for this example
      if (response.status === 200) {
        expect(response.status).toBe(200);
      } else {
        expect(response.status).toBe(401);
      }
    }

    // The 11th request should be rate limited
    const response = await request(app)
      .post('/api/auth/login')
      .send(loginData);

    expect(response.status).toBe(429); // Too many requests
    expect(response.body.message).toBe('Too many login attempts from this IP, please try again after 15 minutes');
  });
});
