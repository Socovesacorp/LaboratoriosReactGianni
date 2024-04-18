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
        SELECT CONVERT(VARCHAR(10), MAX(MaxDate), 103) AS MAX_FECHA
        FROM (
          SELECT MAX(FECHA_INICIO) AS MaxDate FROM Solicitud
          UNION ALL
          SELECT MAX(APROBADOR_RECEPCION) AS MaxDate FROM Solicitud
          UNION ALL
          SELECT MAX(APROBADOR_APROBACION) AS MaxDate FROM Solicitud
          UNION ALL
          SELECT MAX(ENVIADO_A_TESORERIA_RECEPCION) AS MaxDate FROM Solicitud
          UNION ALL
          SELECT MAX(ENVIADO_A_TESORERIA_APROBACION) AS MaxDate FROM Solicitud
        ) AS MaxDates
      `;

      const result = await pool.request().query(query);
      sql.close();

      // La fecha se devuelve en el formato dd/mm/yyyy
      const maxFechaInicio = result.recordset[0].MAX_FECHA || '1753-01-01';

      //console.log('Máxima fecha de los campos especificados (solo fecha):', maxFechaInicio);
      res.status(200).json({ maxFechaInicio });
    } catch (error) {
      console.error('Error al obtener la máxima fecha de los campos especificados (solo fecha):', error);
      res.status(500).json({ error: 'Error al obtener la máxima fecha de los campos especificados (solo fecha)', details: error.message });
    }
  } else {
    res.status(405).end();
  }
}
