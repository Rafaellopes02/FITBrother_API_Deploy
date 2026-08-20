const jwt = require('jsonwebtoken');

exports.generateAccessToken = information => 
  jwt.sign(information, process.env.JWT_SECRET, { expiresIn: '7d' });

exports.certifyAccessToken = token => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) reject(err);
      else resolve(decoded);
    });
  });
};