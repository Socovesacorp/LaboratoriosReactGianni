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
      const Correo_ID = req.body.Correo_ID;
      const Correo_gerente = req.body.Correo_gerente;
      
      //console.log('recibí: '+Correo_ID+Correo_gerente)
      if(!Correo_ID){
        return res.status(400).json({message: 'Correo_ID no proporcionado.', CodigoRetorno: 99})
      }

      if(!Correo_gerente){
        return res.status(400).json({message: 'Correo_gerente no proporcionado.', CodigoRetorno: 99})
      }

      try {
        // Iniciar la transacción
        await transaction.begin();

        // Configurar el tiempo de espera (LOCK_TIMEOUT)
        await transaction.request().query("SET LOCK_TIMEOUT 180000");

        // Si el token es válido, continuar con el update
        const query = `

        If (SELECT COUNT(1) FROM Correo(nolock) WHERE Correo_ID = @Correo_ID AND LTRIM(RTRIM(Correo_gerente))='') > 0 BEGIN
          UPDATE Correo SET Correo_gerente = @Correo_gerente
          WHERE Correo_ID = @Correo_ID
        End
        Else
        begin
          UPDATE Correo SET Correo_gerente = ''
          WHERE Correo_ID = @Correo_ID
        End

        `;

        const result = await transaction
          .request()
          .input('Correo_ID', sql.Numeric(18), Correo_ID)
          .input('Correo_gerente', sql.VarChar(200), Correo_gerente)
          .query(query);
        
        await transaction.commit();

        // Cerrar la conexión a la base de datos
        await sql.close();

        res.status(201).json({ message: 'Correo copiado Correctamente al gerente.', CodigoRetorno: 1 });
      } catch (error) {
        // Si se produce un error, deshacer la transacción
        await transaction.rollback();
        throw error; // Lanzar el error para que sea manejado en el bloque catch externo
      }
    } catch (error) {
      console.error('Error al modificar correo para avisar al Gerente:', error);
      res.status(500).json({ error: 'Error al querer copiar al Gerente dentro de la tabla Correo', details: error.message });
    }
  } else {
    res.status(405).end();
  }
}
