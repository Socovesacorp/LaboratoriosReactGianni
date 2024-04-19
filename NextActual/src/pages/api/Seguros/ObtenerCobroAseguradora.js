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
        a.CobroAseguradora_ID,
        a.Rut_Asegurado,
        a.DV_Asegurado,
        (a.[Ape.Paterno] + ' ' + a.Nombres) as Apellido_Nombre,
        a.NIF_Asegurado as NIF,
        a.ContratantePrincipal as NombreEmpresa,
        a.CentroCoste,
        a.Denominacion,
        a.Periodo,
        'Titular' as TipoSeguro,
        a.Total as Importe
      FROM 
        Seguros_CobroAseguradora a 
      WHERE 
        Cabecera_Id = ${Cabecera_Id}
      ORDER BY
        CobroAseguradora_ID desc
      `);
      sql.close();
      //console.log('***Resultado de la consulta ObtenerSolicitudes.js :', result.recordset);
      console.log('ObtenerCobroAseguradora.js');
      res.status(200).json(result.recordset);
    } catch (error) {
      console.error('Error al obtener valores de los Cobros de la Aseguradora:', error);
      res.status(500).json({ error: '***Error al obtener valores de los CobroAseguradora:', details: error.message });
    }
  } else {
    res.status(405).end();
  }
}
