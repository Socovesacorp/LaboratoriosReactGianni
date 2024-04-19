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
      const Cabecera_Id = req.query.Cabecera_Id;
      const pool = await sql.connect(dbConfig);
      const result = await pool.request().query(`
      SELECT
        TipoSeguro,
        COUNT(DISTINCT Rut) AS RutDistintos,
        SUM(Importe) AS SumaImporte
      FROM
        Seguros_DescuentosAlPersonal
      WHERE
        Cabecera_Id = ${Cabecera_Id}
      GROUP BY
        TipoSeguro
      Order By
        TipoSeguro
      `);
      sql.close();
      // Imprimir los datos en la consola del servidor
      //console.log('***Resultado de la consulta ObtenerSolicitudes.js :', result.recordset);
      console.log('ObtenerDescuentosAgrupados.js');
      res.status(200).json(result.recordset);
    } catch (error) {
      console.error('Error al obtener valores de los Descuentos Agrupados:', error);
      res.status(500).json({ error: '***Error al obtener valores de los Descuentos Agrupados:', details: error.message });
    }
  } else {
    res.status(405).end();
  }
}
