import dbConfig from '../../components/dbConfig';
import sql from 'mssql';
import { verifyToken } from './auth';

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
        FechaSubida,
        NickSubida,
        NombreUsuarioSubida,
        NickProcesado,
        NombreUsuarioProcesado,
        Procesado,
        FechaProcesado
      } = req.body;

      console.log('Valores recibidos en el cuerpo de la solicitud:', req.body);

      const pool = await sql.connect(dbConfig);

      const query = `
        INSERT INTO Cabecera_Cobranza (
          Cabecera_FechaSubida,
          Cabecera_NickSubida,
          Cabecera_NombreUsuarioSubida,
          Cabecera_NickProcesado,
          Cabecera_NombreUsuarioProcesado,
          Cabecera_Procesado,
          Cabecera_FechaProcesado
        )
        VALUES (
          @FechaSubida,
          @NickSubida,
          @NombreUsuarioSubida,
          @NickProcesado,
          @NombreUsuarioProcesado,
          @Procesado,
          @FechaProcesado
        );
      `;

      await pool
        .request()
        .input('FechaSubida', sql.DateTime, FechaSubida)
        .input('NickSubida', sql.NChar, NickSubida)
        .input('NombreUsuarioSubida', sql.NChar, NombreUsuarioSubida)
        .input('NickProcesado', sql.NChar, NickProcesado)
        .input('NombreUsuarioProcesado', sql.NChar, NombreUsuarioProcesado)
        .input('Procesado', sql.Int, Procesado)
        .input('FechaProcesado', sql.DateTime, FechaProcesado)
        .query(query);

      sql.close();

      console.log('Valores después de la consulta SQL:', req.body);

      res.status(201).json({ message: 'Cabecera insertada correctamente' });
    } catch (error) {
      console.error('Error al insertar Cabecera:', error);
      res.status(500).json({ error: 'Error al insertar Cabecera', details: error.message });
    }
  } else {
    res.status(405).end();
  }
}
