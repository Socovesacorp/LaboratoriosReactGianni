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
              Cabecera_ID                         ,
              RIGHT('0' + CONVERT(VARCHAR(2), DAY(Cabecera_FechaSubida)), 2) + '/' + RIGHT('0' + CONVERT(VARCHAR(2), MONTH(Cabecera_FechaSubida)), 2) + '/' +  RIGHT(CONVERT(VARCHAR(4), YEAR(Cabecera_FechaSubida)), 2) + ' ' + CONVERT(VARCHAR(8), Cabecera_FechaSubida, 108) AS Cabecera_FechaSubida, 
              Cabecera_NombreUsuarioSubida        ,
              RIGHT('0' + CONVERT(VARCHAR(2), DAY(Cabecera_FechaProcesado)), 2) + '/' + RIGHT('0' + CONVERT(VARCHAR(2), MONTH(Cabecera_FechaProcesado)), 2) + '/' +  RIGHT(CONVERT(VARCHAR(4), YEAR(Cabecera_FechaProcesado)), 2) + ' ' + CONVERT(VARCHAR(8), Cabecera_FechaProcesado, 108) AS Cabecera_FechaProcesado, 
              Cabecera_NombreUsuarioProcesado
            FROM
              Cabecera_Cobranza
            ORDER BY
              Cabecera_FechaSubida DESC
      `);
      sql.close();
      // Imprimir los datos en la consola del servidor
      //console.log('***Resultado de la consulta ObtenerSolicitudes.js :', result.recordset);
      res.status(200).json(result.recordset);
    } catch (error) {
      console.error('Error al obtener valores:', error);
      res.status(500).json({ error: '***Error al obtener valores', details: error.message });
    }
  } else {
    res.status(405).end();
  }
}
