import dbConfig from '../../../components/dbConfig'
import sql from 'mssql';
import { verifyToken } from '../auth';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      // Obtener el token de autorización de los encabezados de la solicitud
      const token = req.headers.authorization?.split(' ')[1];

      // Verificar si el token es válido
      if (!token) {
        return res.status(401).json({ error: 'Token no proporcionado' });
      }

      // Verificar el token utilizando la función verifyToken
      const decodedToken = verifyToken(token);

      // Si el token es válido, continuar con la inserción en la base de datos
      const {
        ID,
        NOMBRE,
        DESCRIPCION
      } = req.body;

      //console.log('Valores recibidos en el cuerpo de la solicitud:', req.body);

      const pool = await sql.connect(dbConfig);

      const query = `
        INSERT INTO PRUEBA (
            ID,
            NOMBRE,
            DESCRIPCION
        )
        VALUES (
          @ID,
          @NOMBRE,
          @DESCRIPCION
        );
      `;

      await pool
        .request()
        .input('ID', sql.Decimal, ID)
        .input('NOMBRE', sql.NChar, NOMBRE)
        .input('DESCRIPCION', sql.NChar, DESCRIPCION)
        .query(query);

      sql.close();

      //console.log('Valores después de la consulta SQL:', req.body);

      res.status(201).json({ message: 'Cabecera insertada correctamente' });
    } catch (error) {
      console.error('Error al insertar Cabecera:', error);
      res.status(500).json({ error: 'Error al insertar Cabecera', details: error.message });
    }
  } else {
    res.status(405).end();
  }
}