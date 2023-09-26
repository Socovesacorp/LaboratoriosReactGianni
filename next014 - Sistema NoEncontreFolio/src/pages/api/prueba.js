import dbConfig from '../../components/dbConfig';
import sql from 'mssql';
import { verifyToken } from './auth'; // Ajusta la ruta según donde tengas el archivo auth.js

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    try {
      const decodedToken = verifyToken(token);

      const pool = await sql.connect(dbConfig);
      const result = await pool.request().query('SELECT ID, LTRIM(RTRIM(NOMBRE)) AS NOMBRE, LTRIM(RTRIM(DESCRIPCION)) AS DESCRIPCION FROM PRUEBA');
      sql.close();

      res.status(200).json(result.recordset);
    } catch (error) {
      console.error('Error al obtener valores:', error);
      res.status(500).json({ error: '***Error al obtener valores', details: error.message });
    }
  } else {
    res.status(405).end();
  }
}
