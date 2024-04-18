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
        d.DescuentosAlPersonalExcel_ID,
        d.Rut,
        d.DV,
        d.Apellido_Nombre,
        d.NIF,
        d.Sociedad,
        d.NombreEmpresa,
        d.CentroCoste,
        d.Denominacion,
        d.Periodo,
        d.TipoSeguro,
        d.Importe,
        d.Existe
      FROM 
          DescuentosAlPersonalExcel_Existe d
      ORDER BY
          DescuentosAlPersonalExcel_ID desc
      `);
      sql.close();
      // Imprimir los datos en la consola del servidor
      //console.log('***Resultado de la consulta ObtenerSolicitudes.js :', result.recordset);
      //console.log('ObtenerDescuentosExcel_Existe');
      res.status(200).json(result.recordset);
    } catch (error) {
      console.error('Error al obtener valores de los Descuentos Excel_Existe:', error);
      res.status(500).json({ error: '***Error al obtener valores de los Descuentos Excel_Existe:', details: error.message });
    }
  } else {
    res.status(405).end();
  }
}
