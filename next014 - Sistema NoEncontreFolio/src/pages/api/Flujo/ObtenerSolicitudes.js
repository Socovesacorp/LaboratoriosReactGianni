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
            SELECT
              SolicitudId                         ,
              FOLIO                               ,
              INGRESADO_POR                       ,
              CONVERT(VARCHAR, FECHA_INGRESO,                               103) as FECHA_INGRESO,
              TAREA                               ,
              ESTADO                              ,
              CONVERT(VARCHAR, FECHA_INICIO,                                103)  as FECHA_INICIO,
              CONVERT(VARCHAR, FECHA_TERMINO,                               103)  as FECHA_TERMINO,
              RIGHT('0' + CONVERT(VARCHAR(2), DAY(Aprobador_Recepcion)), 2) + '/' + RIGHT('0' + CONVERT(VARCHAR(2), MONTH(Aprobador_Recepcion)), 2) + '/' +  RIGHT(CONVERT(VARCHAR(4), YEAR(Aprobador_Recepcion)), 2) + ' ' + CONVERT(VARCHAR(8), Aprobador_Recepcion, 108) AS Aprobador_Recepcion, 
              RIGHT('0' + CONVERT(VARCHAR(2), DAY(Aprobador_Aprobacion)), 2) + '/' + RIGHT('0' + CONVERT(VARCHAR(2), MONTH(Aprobador_Aprobacion)), 2) + '/' +  RIGHT(CONVERT(VARCHAR(4), YEAR(Aprobador_Aprobacion)), 2) + ' ' + CONVERT(VARCHAR(8), Aprobador_Aprobacion, 108) AS Aprobador_Aprobacion, 
              RIGHT('0' + CONVERT(VARCHAR(2), DAY(Enviado_a_Tesoreria_Recepcion)), 2) + '/' + RIGHT('0' + CONVERT(VARCHAR(2), MONTH(Enviado_a_Tesoreria_Recepcion)), 2) + '/' +  RIGHT(CONVERT(VARCHAR(4), YEAR(Enviado_a_Tesoreria_Recepcion)), 2) + ' ' + CONVERT(VARCHAR(8), Enviado_a_Tesoreria_Recepcion, 108) AS Enviado_a_Tesoreria_Recepcion, 
              RIGHT('0' + CONVERT(VARCHAR(2), DAY(Enviado_a_Tesoreria_Aprobacion)), 2) + '/' + RIGHT('0' + CONVERT(VARCHAR(2), MONTH(Enviado_a_Tesoreria_Aprobacion)), 2) + '/' +  RIGHT(CONVERT(VARCHAR(4), YEAR(Enviado_a_Tesoreria_Aprobacion)), 2) + ' ' + CONVERT(VARCHAR(8), Enviado_a_Tesoreria_Aprobacion, 108) AS Enviado_a_Tesoreria_Aprobacion, 
              RIGHT('0' + CONVERT(VARCHAR(2), DAY(Pendiente_de_Rendicion_Recepcion)), 2) + '/' + RIGHT('0' + CONVERT(VARCHAR(2), MONTH(Pendiente_de_Rendicion_Recepcion)), 2) + '/' +  RIGHT(CONVERT(VARCHAR(4), YEAR(Pendiente_de_Rendicion_Recepcion)), 2) + ' ' + CONVERT(VARCHAR(8), Pendiente_de_Rendicion_Recepcion, 108) AS Pendiente_de_Rendicion_Recepcion, 
              RIGHT('0' + CONVERT(VARCHAR(2), DAY(Pendiente_de_Rendicion_Aprobacion)), 2) + '/' + RIGHT('0' + CONVERT(VARCHAR(2), MONTH(Pendiente_de_Rendicion_Aprobacion)), 2) + '/' +  RIGHT(CONVERT(VARCHAR(4), YEAR(Pendiente_de_Rendicion_Aprobacion)), 2) + ' ' + CONVERT(VARCHAR(8), Pendiente_de_Rendicion_Aprobacion, 108) AS Pendiente_de_Rendicion_Aprobacion, 
              RIGHT('0' + CONVERT(VARCHAR(2), DAY(Cerrado_Recepcion)), 2) + '/' + RIGHT('0' + CONVERT(VARCHAR(2), MONTH(Cerrado_Recepcion)), 2) + '/' +  RIGHT(CONVERT(VARCHAR(4), YEAR(Cerrado_Recepcion)), 2) + ' ' + CONVERT(VARCHAR(8), Cerrado_Recepcion, 108) AS Cerrado_Recepcion, 
              RIGHT('0' + CONVERT(VARCHAR(2), DAY(Cerrado_Aprobacion)), 2) + '/' + RIGHT('0' + CONVERT(VARCHAR(2), MONTH(Cerrado_Aprobacion)), 2) + '/' +  RIGHT(CONVERT(VARCHAR(4), YEAR(Cerrado_Aprobacion)), 2) + ' ' + CONVERT(VARCHAR(8), Cerrado_Aprobacion, 108) AS Cerrado_Aprobacion, 
              APROBADOR                           ,
              NOMBREAUTOMATICO_SOLICITANTE        ,
              RUTAUTOMATICO_SOLICITANTE           ,
              CARGOAUTOMATICO_SOLICITANTE         ,
              EMAILAUTOMATICO_SOLICITANTE         ,
              ANEXOAUTOMATICO_SOLICITANTE         ,
              TIPO_DE_SOLICITUD                   ,
              TIPO_MONEDA                         ,
              MOTIVO_DE_SOLICITUD                 ,
              TIPO_DE_RESPALDO                    ,
              RESPALDO                            ,
              NOMBRE_BENEFICIARIO                 ,
              RUT_BEN                             ,
              TIPO_DE_CUENTA                      ,
              N_CUENTA                            ,
              BANCO                               ,
              EMAIL_BENEFICIARIO                  ,
              EMPRESA                             ,
              CENTRO_DE_COSTO                     ,
              CONVERT(VARCHAR, FECHA_PAGO,                                103)  as FECHA_PAGO,
              CONVERT(VARCHAR, FECHA_DE_RENDICION,                               103)  as FECHA_DE_RENDICION,
              MONTO_SOLICITADO


            FROM
              Solicitud
            ORDER BY
              SolicitudId DESC
      `);
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
