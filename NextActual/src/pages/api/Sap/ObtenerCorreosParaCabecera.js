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

      const { Cabecera_Id } = req.query;
      //console.log('El parametro pasado es: '+Cabecera_Id)

      const pool = await sql.connect(dbConfig);
      const request = pool.request();

      let query = `
            SELECT
            Correo_ID                           ,
            Correo_Nombre_Destinatario          ,
            Correo_to                           ,
            Correo_cc                           ,
            Correo_gerente                      ,
            Correo_asunto                       ,
            Sap_Monto_total                     ,
            Sap_Cantidad_Documentos             ,
            RIGHT('0' + CONVERT(VARCHAR(2), DAY(Correo_fecha_creacion)), 2) + '/' + RIGHT('0' + CONVERT(VARCHAR(2), MONTH(Correo_fecha_creacion)), 2) + '/' +  RIGHT(CONVERT(VARCHAR(4), YEAR(Correo_fecha_creacion)), 2) + ' ' + CONVERT(VARCHAR(8),Correo_fecha_creacion, 108) AS Correo_fecha_creacion,
            CASE
              WHEN Correo_estado = 2 AND ID_INSTITUCIONAL_CORREO > 0 THEN 'Enviado'
              WHEN Correo_estado = 1 THEN 'En Espera'
              WHEN Correo_estado = 0 THEN 'No Validado'
              WHEN Correo_estado <> 0 AND Correo_estado <> 1 AND Correo_estado <> 2 THEN 'Error. Consultar a T.I.'
            END AS Correo_estado,
            RIGHT('0' + CONVERT(VARCHAR(2), DAY(Correo_fecha_envio)), 2) + '/' + RIGHT('0' + CONVERT(VARCHAR(2), MONTH(Correo_fecha_envio)), 2) + '/' +  RIGHT(CONVERT(VARCHAR(4), YEAR(Correo_fecha_envio)), 2) + ' ' + CONVERT(VARCHAR(8),Correo_fecha_envio, 108) AS Correo_fecha_envio

            FROM
              Correo
            WHERE
              Cabecera_Id= @Cabecera_Id
      `;
      request.input('Cabecera_Id', sql.Int, Cabecera_Id);
        
      const result = await request.query(query);


      sql.close();
      // Imprimir los datos en la consola del servidor
      //console.log('***Resultado de la consulta ObtenerSolicitudes.js :', result.recordset);
      res.status(200).json(result.recordset);
    } catch (error) {
      console.error('Error al obtener valores:', error);
      res.status(500).json({ error: '***Error al obtener valores', details: error.message });
    }
  } else {
    res.status(405).end();
  }
}
