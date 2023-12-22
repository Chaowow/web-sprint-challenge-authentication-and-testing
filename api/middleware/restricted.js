const jwt = require('jsonwebtoken');

const { JWT_SECRET } = require('../../configs');

module.exports = (req, res, next) => {
  const token = req.headers.authorization;

  if (token) {
    jwt.verify(token, JWT_SECRET, (err, decodedToken) => {
      if (err) {
        res.status(401).json({
          message: 'token invalid'
        });
      } else {
        req.decodedJwt = decodedToken;
        next();
      }
    })
  } else {
    res.status(403).json({
      message: 'token required'
    });
  }
};
