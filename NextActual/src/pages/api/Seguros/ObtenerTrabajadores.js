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
            t.Trabajadores_ID,
            t.Estado,
            t.Rut,
            t.DV,
            t.NIF,
            t.Nombres,
            t.ApellidoPaterno,
            t.ApellidoMaterno,
            t.CentroCoste,
            t.Denominacion,
            t.NombreProyecto,
            t.CodigoProyecto
        FROM
            Seguros_Trabajadores t
        WHERE
            Cabecera_Id = ${Cabecera_Id}
        ORDER BY
            Trabajadores_ID desc 
      `);
      sql.close();
      // Imprimir los datos en la consola del servidor
      console.log('ObtenerTrabajadores.js');
      res.status(200).json(result.recordset);
    } catch (error) {
      console.error('Error al obtener valores de Trabajadores:', error);
      res.status(500).json({ error: '***Error al obtener valores de Trabajadores', details: error.message });
    }
  } else {
    res.status(405).end();
  }
}
