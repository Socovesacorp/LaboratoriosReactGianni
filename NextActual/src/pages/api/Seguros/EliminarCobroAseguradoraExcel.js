//Real...

import dbConfig from '../../../components/dbConfig';
import sql from 'mssql';
import { verifyToken } from '../auth';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    try {
      const decodedToken = verifyToken(token);

      const pool = await sql.connect(dbConfig);
      const query = `
        truncate table Seguros_CobroAseguradoraExcel        
      `;

      await pool.request().query(query);
      sql.close();

 
      //console.log('Máxima fecha de los campos especificados (solo fecha):', maxFechaInicio);
      res.status(200).json({ message: 'OK' });
    } catch (error) {
        console.error('Error al truncar la tabla Seguros_CobroAseguradoraExcel:', error);
        res.status(500).json({ error: 'Error al truncar la tabla Seguros_CobroAseguradoraExcel', details: error.message });
    }
  } else {
    res.status(405).end();
  }
}
