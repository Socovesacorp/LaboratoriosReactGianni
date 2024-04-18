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

      const { Correo_Id } = req.query;
      //console.log('El parametro pasado es: '+Correo_Id)

      const pool = await sql.connect(dbConfig);
      const request = pool.request();

      let query = `
            SELECT
                Correo_body
            FROM
                Correo
            WHERE
                Correo_ID= @Correo_ID
      `;
      request.input('Correo_Id', sql.Int, Correo_Id);
        
      const result = await request.query(query);


      sql.close();
      // Imprimir los datos en la consola del servidor
      //console.log('***Resultado de la consulta ObtenerBodyCorreo.js :', result.recordset);
      res.status(200).json(result.recordset);
    } catch (error) {
      console.error('Error al obtener valores:', error);
      res.status(500).json({ error: '***Error al obtener valores', details: error.message });
    }
  } else {
    res.status(405).end();
  }
}
