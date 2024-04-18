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
        SELECT COUNT(1) AS Cantidad FROM Seguros_DescuentosAlPersonalExcel(NOLOCK)
        
      `;

      const result = await pool.request().query(query);
      sql.close();

      // La fecha se devuelve en el formato dd/mm/yyyy
      const CantidadDescuentosExcel = result.recordset[0].Cantidad || 0;

      //console.log('ObtenerCantidadDescuentosExcel:', CantidadDescuentosExcel);
      res.status(200).json({ CantidadDescuentosExcel });
    } catch (error) {
      console.error('Error al obtener la cantidad de los Descuentos en excel de los campos especificados (solo count):', error);
      res.status(500).json({ error: 'Error al obtener la cantidad de los Descuentos en excel de los campos especificados (solo count)', details: error.message });
    }
  } else {
    res.status(405).end();
  }
}
