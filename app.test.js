const request = require('supertest');
const express = require('express');

const app = express();

app.get('/', (req, res) => {
  res.json({ message: 'Hello from Node.js on ECS!', version: '1.0' });
});

describe('GET /', () => {
  it('should return 200 and message', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Hello from Node.js on ECS!');
  });
});
