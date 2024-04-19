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
      const query = `
        SELECT COUNT(1) AS Cantidad FROM Seguros_CobroAseguradora(NOLOCK) WHERE Cabecera_Id = ${Cabecera_Id}        
      `;

      const result = await pool.request().query(query);
      sql.close();

      // La fecha se devuelve en el formato dd/mm/yyyy
      const CantidadCobroAseguradora = result.recordset[0].Cantidad || 0;

      //console.log('ObtenerCantidadCobroAseguradora.js:', CantidadCobroAseguradora);
      console.log('ObtenerCantidadCobroAseguradora.js');
      res.status(200).json({ CantidadCobroAseguradora });
    } catch (error) {
      console.error('Error al obtener la cantidad de los Cobros Aseguradora de los campos especificados (solo count):', error);
      res.status(500).json({ error: 'Error al obtener la cantidad de los Cobros Aseguradora de los campos especificados (solo count)', details: error.message });
    }
  } else {
    res.status(405).end();
  }
}
