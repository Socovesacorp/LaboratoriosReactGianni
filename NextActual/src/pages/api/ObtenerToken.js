//Real...

import { generateToken } from './auth'; // Ajusta la ruta según donde tengas el archivo auth.js

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { username, password } = req.body;

    if (username === 'User_UCP' && password === 'Cobranz@s_UCP.2023') {
      const user = {
        id: 1,
        username: 'User_UCP',
        roles: ['user'],
      };

      const token = generateToken(user);

      res.status(200).json({ token });
    } else {
      res.status(401).json({ error: 'Credenciales incorrectas' });
    }
  } 
}
