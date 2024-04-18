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
      SELECT Proyecto_Id , Sociedad_Cod , Proyecto_Pep ,  Proyecto_Nombre FROM PROYECTOS(NOLOCK) , SOCIEDADES(NOLOCK) WHERE PROYECTOS.Sociedad_Id = SOCIEDADES.Sociedad_Id ORDER BY SOCIEDAD_COD , PROYECTO_NOMBRE
      `);
      sql.close();
      // Imprimir los datos en la consola del servidor
      //console.log('***Resultado de la consulta ObtenerSociedadesFacturadasExcel.js :', result.recordset);
      res.status(200).json(result.recordset);
    } catch (error) {
      console.error('Error al obtener valores de ObtenerPEPs:', error);
      res.status(500).json({ error: '***Error al obtener valores de ObtenerPEPs', details: error.message });
    }
  } else {
    res.status(405).end();
  }
}
