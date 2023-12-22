const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Users = require('../users/users-model');

const router = require('express').Router();

const { BCRYPT_ROUNDS, JWT_SECRET } = require('../../configs');

router.post('/register', async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      message: 'username and password required'
    });
 }

try {
  const existingUsername = await Users.findBy({ username }).first();
  if (existingUsername) {
    return res.status(400).json({
      message: 'username taken'
    });
  }
  

  const hash = bcrypt.hashSync(password, BCRYPT_ROUNDS);
  const newUser = await Users.add({ username, password: hash });

  res.status(201).json(newUser)
} catch(err) {
  next(err)
}
});

router.post('/login', (req, res, next) => {
  /*
    IMPLEMENT
    You are welcome to build additional middlewares to help with the endpoint's functionality.

    1- In order to log into an existing account the client must provide `username` and `password`:
      {
        "username": "Captain Marvel",
        "password": "foobar"
      }

    2- On SUCCESSFUL login,
      the response body should have `message` and `token`:
      {
        "message": "welcome, Captain Marvel",
        "token": "eyJhbGciOiJIUzI ... ETC ... vUPjZYDSa46Nwz8"
      }

    3- On FAILED login due to `username` or `password` missing from the request body,
      the response body should include a string exactly as follows: "username and password required".

    4- On FAILED login due to `username` not existing in the db, or `password` being incorrect,
      the response body should include a string exactly as follows: "invalid credentials".
  */

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      message: 'username and password required'
    });
 }

  Users.findBy({ username })
  .then(([user]) => {
    if (user && bcrypt.compareSync(password, user.password)) {
      const token = generateToken(user);

      res.status(200).json({
        message: `welcome, ${user.username}`,
        token
      });
    } else {
      res.status(401).json({
        message: 'invalid credentials'
      });
    }
  })
  .catch(next)
});

function generateToken(user) {
  const payload = {
    subject: user.id,
    username: user.username,
  }
  const options = {
    expiresIn: '1d'
  }
  return jwt.sign(payload, JWT_SECRET, options);
}

module.exports = router;
