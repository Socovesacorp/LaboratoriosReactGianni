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
      SELECT COUNT(1) AS CantidadRegistros
        FROM (
          Select Sociedad_Cod , Sociedad_RazonSocial
          FROM AnalisisGlobalSinTotalExcel 
          GROUP BY Sociedad_Cod, Sociedad_RazonSocial
        ) as Resultado
      `;

      const result = await pool.request().query(query);
      sql.close();

      // La fecha se devuelve en el formato dd/mm/yyyy
      const CantidadSociedadesFacturadas = result.recordset[0].CantidadRegistros || 0;

      //console.log('Máxima fecha de los campos especificados (solo fecha):', maxFechaInicio);
      res.status(200).json({ CantidadSociedadesFacturadas });
    } catch (error) {
      console.error('Error al obtener la CantidadSociedadesFacturadas en excel de los campos especificados (solo count):', error);
      res.status(500).json({ error: 'Error al obtener la CantidadSociedadesFacturadas en excel de los campos especificados (solo count)', details: error.message });
    }
  } else {
    res.status(405).end();
  }
}
