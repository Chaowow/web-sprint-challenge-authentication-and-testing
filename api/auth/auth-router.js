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
