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
        Facturas_Id,
        Sociedad_RazonSocial,
        Sociedad_Rut,
        Factura_Nro,
        Factura_Exento,
        Factura_Neto,
        Factura_Iva,
        Factura_Total
      FROM 
          Seguros_Facturas
      WHERE
          Cabecera_Id = ${Cabecera_Id}
      ORDER BY
          Facturas_Id
      `);
      sql.close();
      // Imprimir los datos en la consola del servidor
      //console.log('***Resultado de la consulta ObtenerSolicitudes.js :', result.recordset);
      console.log('ObtenerFacturas.js');
      res.status(200).json(result.recordset);
    } catch (error) {
      console.error('Error al obtener valores de las Facturas:', error);
      res.status(500).json({ error: '***Error al obtener valores de las Facturas:', details: error.message });
    }
  } else {
    res.status(405).end();
  }
}
