//Real...

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
      const pool = await sql.connect(dbConfig);
      const transaction = pool.transaction();

      try {
        // Iniciar la transacción
        await transaction.begin();

        // Configurar el tiempo de espera (LOCK_TIMEOUT)
        await transaction.request().query("SET LOCK_TIMEOUT 180000");

        // Si el token es válido, continuar con la inserción en la base de datos
        const {
          FechaSubida,
          NickSubida,
          NombreUsuarioSubida
        } = req.body;

        const query = `
          INSERT INTO Cabecera_Cobranza (
            Cabecera_FechaSubida,
            Cabecera_NickSubida,
            Cabecera_NombreUsuarioSubida
          )
          OUTPUT INSERTED.Cabecera_Id 
          VALUES (
            @FechaSubida,
            @NickSubida,
            @NombreUsuarioSubida            
          );
        `;

        const result = await transaction
          .request()
          .input('FechaSubida', sql.DateTime, FechaSubida)
          .input('NickSubida', sql.NChar, NickSubida)
          .input('NombreUsuarioSubida', sql.NChar, NombreUsuarioSubida)
          .query(query);

        const cabeceraIdGenerado = result.recordset[0].Cabecera_Id;
        //console.log('idgenerado: '+cabeceraIdGenerado)
        // Confirmar la transacción
        await transaction.commit();

        // Cerrar la conexión a la base de datos
        await sql.close();

        res.status(201).json({ message: 'Cabecera insertada correctamente', Cabecera_Id: cabeceraIdGenerado });
      } catch (error) {
        // Si se produce un error, deshacer la transacción
        await transaction.rollback();
        throw error; // Lanzar el error para que sea manejado en el bloque catch externo
      }
    } catch (error) {
      console.error('Error al insertar Cabecera:', error);
      res.status(500).json({ error: 'Error al insertar Cabecera', details: error.message });
    }
  } else {
    res.status(405).end();
  }
}

