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
      const result = await pool.request().query(`
      SELECT 
        Cabecera_ID,
        Cabecera_FechaSubida,
        Cabecera_NickSubida,
        Cabecera_Referencia,
        Cabecera_NombreUsuarioSubida
      FROM 
        Seguros_Cabecera
      ORDER BY
      Cabecera_ID desc
      `);
      sql.close();
      // Imprimir los datos en la consola del servidor
      //console.log('***Resultado de la consulta ObtenerSolicitudes.js :', result.recordset);
      console.log('ObtenerSegurosCabeceras.js');
      res.status(200).json(result.recordset);
    } catch (error) {
      console.error('Error al obtener valores de las Cabeceras de Seguros:', error);
      res.status(500).json({ error: '***Error al obtener valores de las Cabeceras de Seguros:', details: error.message });
    }
  } else {
    res.status(405).end();
  }
}
