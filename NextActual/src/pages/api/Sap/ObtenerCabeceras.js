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
              a.Cabecera_ID                         ,
              RIGHT('0' + CONVERT(VARCHAR(2), DAY(a.Cabecera_FechaSubida)), 2) + '/' + RIGHT('0' + CONVERT(VARCHAR(2), MONTH(a.Cabecera_FechaSubida)), 2) + '/' +  RIGHT(CONVERT(VARCHAR(4), YEAR(a.Cabecera_FechaSubida)), 2) + ' ' + CONVERT(VARCHAR(8), a.Cabecera_FechaSubida, 108) AS Cabecera_FechaSubida, 
              a.Cabecera_NombreUsuarioSubida        ,
			        (SELECT COUNT(1) FROM Correo(NOLOCK) b WHERE a.Cabecera_Id = b.Cabecera_Id) as Cantidad_Correos,
			        (SELECT SUM(b.Sap_Monto_total) FROM Correo(NOLOCK) b WHERE a.Cabecera_Id = b.Cabecera_Id) as MontoTotal_Correos,
              (SELECT COUNT(1) FROM CORREO (NOLOCK) b WHERE a.Cabecera_ID = b.Cabecera_ID and Correo_estado > 0) as Cantidad_Enviados
            FROM
              Cabecera_Cobranza a
            ORDER BY
              Cabecera_ID desc
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
