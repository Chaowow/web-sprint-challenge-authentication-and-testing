const request = require('supertest');
const db = require('../data/dbConfig');
const server = require('./server');

const user1 = { username: 'Reptile', password: 'AcidSpit'};
const user2 = { username: 'Sub-Zero', password: 'IceKlone' };


beforeAll(async () => {
  await db.migrate.rollback();
  await db.migrate.latest();
});

beforeEach(async () => {
  await db('users').truncate();
});
afterAll(async () => {
  await db.destroy();
});

describe('[POST] /api/auth/register', () => {
  it('returns 201 OK', async () => {
    const res = await request(server).post('/api/auth/register').send(user1);
      expect(res.status).toBe(201);
  });
  it('registers new user and returns new user', async () => {
    const res = await request(server).post('/api/auth/register').send(user2);
      expect(res.status).toBe(201);
      expect(res.body.username).toBe('Sub-Zero');
  });
});

describe('[POST] /api/auth/login', () => {
  it('registers then logins and then returns 200 OK', async () => {
    await request(server).post('/api/auth/register').send(user1);
    const res = await request(server).post('/api/auth/login').send(user1);
      expect(res.status).toBe(200);
  });
  it('registers then logins and gives back token', async () => {
    await request(server).post('/api/auth/register').send(user2);
    const res = await request(server).post('/api/auth/login').send(user2);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
  });
});

describe('[GET] /api/jokes/', () => {
  it('registers, logins, and gets then returns 200 OK', async () => {
    await request(server).post('/api/auth/register').send(user1);

    const loginResponse = await request(server).post('/api/auth/login').send(user1);
    const token = loginResponse.body.token;

    const res = await request(server)
    .get('/api/jokes')
    .set('Authorization', `${token}`);

    expect(res.status).toBe(200);
  });

  it('registers, logins, and gets then returns data', async () => {
    await request(server).post('/api/auth/register').send(user2);

    const loginResponse = await request(server).post('/api/auth/login').send(user2);
    const token = loginResponse.body.token;

    const res = await request(server)
    .get('/api/jokes')
    .set('Authorization', `${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(3);
  });
});
