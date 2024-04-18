// auth.js
import jwt from 'jsonwebtoken';

const secretKey = 'aJpRucpCobranz@as.2o23'; 

export function generateToken(payload) {
  return jwt.sign(payload, secretKey, { expiresIn: '1h' });
}

export function verifyToken(token) {
  return jwt.verify(token, secretKey);
}
