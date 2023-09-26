//Real...

import dbConfig from '../../../components/dbConfig';
import sql from 'mssql';
import { verifyToken } from '../auth';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const token = req.headers.authorization?.split(' ')[1];

      if (!token) {
        return res.status(401).json({ error: 'Token no proporcionado' });
      }

      const decodedToken = verifyToken(token);

      const recordsToInsert = req.body; // Recibe una colección de registros

      const pool = await sql.connect(dbConfig);

      // Declarar la variable transaction fuera del bloque try
      const transaction = pool.transaction();

      try {
        // Iniciar la transacción
        await transaction.begin();
        await transaction.request().query("SET LOCK_TIMEOUT 180000")
      
        for (const record of recordsToInsert) {
          const { 
            nickSubidoPor                     , 
            usuarioSubidoPor                  , 
            fechaHoraSubido                   , 
            FOLIO                             , 
            INGRESADO_POR                     ,  
            FECHA_INGRESO                     , 
            TAREA                             ,
            ESTADO                            ,
            FECHA_INICIO                      ,
            FECHA_TERMINO                     ,
            Aprobador_Recepcion               ,
            Aprobador_Aprobacion              ,
            Enviado_a_Tesoreria_Recepcion     ,
            Enviado_a_Tesoreria_Aprobacion    ,
            Pendiente_de_Rendicion_Recepcion  ,
            Pendiente_de_Rendicion_Aprobacion ,
            Cerrado_Recepcion                 ,
            Cerrado_Aprobacion                ,

            APROBADOR                         ,
            NOMBREAUTOMATICO_SOLICITANTE      ,
            RUTAUTOMATICO_SOLICITANTE         ,
            CARGOAUTOMATICO_SOLICITANTE       ,
            EMAILAUTOMATICO_SOLICITANTE       ,
            ANEXOAUTOMATICO_SOLICITANTE       ,
            TIPO_DE_SOLICITUD                 ,
            TIPO_MONEDA                       ,
            MOTIVO_DE_SOLICITUD               ,
            FECHA_DE_RENDICION                ,
            TIPO_DE_RESPALDO                  ,
            RESPALDO                          ,
            NOMBRE_BENEFICIARIO               ,
            RUT_BEN                           ,
            TIPO_DE_CUENTA                    ,
            N_CUENTA                          ,
            BANCO                             ,
            EMAIL_BENEFICIARIO                ,
            FECHA_PAGO                        ,
            EMPRESA                           ,
            CENTRO_DE_COSTO                   ,
            MONTO_SOLICITADO
          } = record;
          
          // Copiar valores a las nuevas variables
          const nickModificadoPor = nickSubidoPor;
          const usuarioModificadoPor = usuarioSubidoPor;
          const fechaHoraModificado = fechaHoraSubido;

          //console.log('*** Registro Recibido desde SubirSolicitudes.js :', record.FOLIO);

          // Convertir la fecha de texto a un formato SQL válido (YYYY-MM-DD)
          const FECHA_INGRESOSQL                        = convertirFechaASQL(FECHA_INGRESO);
          const FECHA_INICIOSQL                         = convertirFechaASQL(FECHA_INICIO);
          const FECHA_TERMINOSQL                        = convertirFechaASQL(FECHA_TERMINO);
          const FECHA_DE_RENDICIONSQL                   = convertirFechaASQL(FECHA_DE_RENDICION);
          const FECHA_PAGOSQL                           = convertirFechaASQL(FECHA_PAGO);
          const Aprobador_RecepcionSQL                  = convertirFechaASQLconTime(Aprobador_Recepcion);
          const Aprobador_AprobacionSQL                 = convertirFechaASQLconTime(Aprobador_Aprobacion);
          const Enviado_a_Tesoreria_RecepcionSQL        = convertirFechaASQLconTime(Enviado_a_Tesoreria_Recepcion);
          const Enviado_a_Tesoreria_AprobacionSQL       = convertirFechaASQLconTime(Enviado_a_Tesoreria_Aprobacion);
          const Pendiente_de_Rendicion_RecepcionSQL     = convertirFechaASQLconTime(Pendiente_de_Rendicion_Recepcion);
          const Pendiente_de_Rendicion_AprobacionSQL    = convertirFechaASQLconTime(Pendiente_de_Rendicion_Aprobacion);
          const Cerrado_RecepcionSQL                    = convertirFechaASQLconTime(Cerrado_Recepcion);
          const Cerrado_AprobacionSQL                   = convertirFechaASQLconTime(Cerrado_Aprobacion);

          // Verificar si el FOLIO ya existe
          const existeFolio = await verificarExistenciaFolio(FOLIO, transaction);

          if (existeFolio) {
            // Realizar la actualización
            const updateQuery = `
              UPDATE Solicitud
              SET
                nickModificadoPor                   = @nickModificadoPor                  ,
                usuarioModificadoPor                = @usuarioModificadoPor               ,
                fechaHoraModificado                 = @fechaHoraModificado                ,
                INGRESADO_POR                       = @INGRESADO_POR                      ,
                FECHA_INGRESO                       = @FECHA_INGRESO                      ,
                TAREA                               = @TAREA                              ,
                ESTADO                              = @ESTADO                             ,
                FECHA_INICIO                        = @FECHA_INICIO                       ,
                FECHA_TERMINO                       = @FECHA_TERMINO                      ,
                Aprobador_Recepcion                 = @Aprobador_Recepcion                ,
                Aprobador_Aprobacion                = @Aprobador_Aprobacion               ,             
                Enviado_a_Tesoreria_Recepcion       = @Enviado_a_Tesoreria_Recepcion      ,    
                Enviado_a_Tesoreria_Aprobacion      = @Enviado_a_Tesoreria_Aprobacion     ,   
                Pendiente_de_Rendicion_Recepcion    = @Pendiente_de_Rendicion_Recepcion   , 
                Pendiente_de_Rendicion_Aprobacion   = @Pendiente_de_Rendicion_Aprobacion  ,
                Cerrado_Recepcion                   = @Cerrado_Recepcion                  ,                
                Cerrado_Aprobacion                  = @Cerrado_Aprobacion                 ,

                APROBADOR                           = @APROBADOR                          ,
                NOMBREAUTOMATICO_SOLICITANTE        = @NOMBREAUTOMATICO_SOLICITANTE       ,
                RUTAUTOMATICO_SOLICITANTE           = @RUTAUTOMATICO_SOLICITANTE          ,
                CARGOAUTOMATICO_SOLICITANTE         = @CARGOAUTOMATICO_SOLICITANTE        ,
                EMAILAUTOMATICO_SOLICITANTE         = @EMAILAUTOMATICO_SOLICITANTE        ,
                ANEXOAUTOMATICO_SOLICITANTE         = @ANEXOAUTOMATICO_SOLICITANTE        ,

                TIPO_DE_SOLICITUD                   = @TIPO_DE_SOLICITUD                  ,
                TIPO_MONEDA                         = @TIPO_MONEDA                        ,
                MOTIVO_DE_SOLICITUD                 = @MOTIVO_DE_SOLICITUD                ,
                FECHA_DE_RENDICION                  = @FECHA_DE_RENDICION                 ,
                TIPO_DE_RESPALDO                    = @TIPO_DE_RESPALDO                   ,
                RESPALDO                            = @RESPALDO                           ,
                NOMBRE_BENEFICIARIO                 = @NOMBRE_BENEFICIARIO                ,
                RUT_BEN                             = @RUT_BEN                            ,

                TIPO_DE_CUENTA                      = @TIPO_DE_CUENTA                     ,
                N_CUENTA                            = @N_CUENTA                           ,
                BANCO                               = @BANCO                              ,
                EMAIL_BENEFICIARIO                  = @EMAIL_BENEFICIARIO                 ,
                FECHA_PAGO                          = @FECHA_PAGO                         ,
                EMPRESA                             = @EMPRESA                            ,
                CENTRO_DE_COSTO                     = @CENTRO_DE_COSTO                    ,
                MONTO_SOLICITADO                    = @MONTO_SOLICITADO


              WHERE FOLIO = @FOLIO;
            `;
            
            await transaction.request()
              .input('nickModificadoPor'                      ,sql.VarChar(200),         nickModificadoPor                    )
              .input('usuarioModificadoPor'                   ,sql.VarChar(200),         usuarioModificadoPor                 )
              .input('fechaHoraModificado'                    ,sql.DateTime,             fechaHoraModificado                  )
              .input('FOLIO'                                  ,sql.Numeric(18, 0),       FOLIO                                )
              .input('INGRESADO_POR'                          ,sql.VarChar(200),         INGRESADO_POR                        )
              .input('FECHA_INGRESO'                          ,sql.Date,                 FECHA_INGRESOSQL                     )
              .input('TAREA'                                  ,sql.VarChar(200),         TAREA                                )
              .input('ESTADO'                                 ,sql.VarChar(200),         ESTADO                               )
              .input('FECHA_INICIO'                           ,sql.Date,                 FECHA_INICIOSQL                      )
              .input('FECHA_TERMINO'                          ,sql.Date,                 FECHA_TERMINOSQL                     )
              .input('Aprobador_Recepcion'                    ,sql.VarChar(50),          Aprobador_RecepcionSQL               )
              .input('Aprobador_Aprobacion'                   ,sql.VarChar(50),          Aprobador_AprobacionSQL              )
              .input('Enviado_a_Tesoreria_Recepcion'          ,sql.VarChar(50),          Enviado_a_Tesoreria_RecepcionSQL     )
              .input('Enviado_a_Tesoreria_Aprobacion'         ,sql.VarChar(50),          Enviado_a_Tesoreria_AprobacionSQL    )
              .input('Pendiente_de_Rendicion_Recepcion'       ,sql.VarChar(50),          Pendiente_de_Rendicion_RecepcionSQL  )
              .input('Pendiente_de_Rendicion_Aprobacion'      ,sql.VarChar(50),          Pendiente_de_Rendicion_AprobacionSQL )
              .input('Cerrado_Recepcion'                      ,sql.VarChar(50),          Cerrado_RecepcionSQL                 )
              .input('Cerrado_Aprobacion'                     ,sql.VarChar(50),          Cerrado_AprobacionSQL                )

              .input('APROBADOR'                              ,sql.VarChar(200),         APROBADOR                            )
              
              .input('NOMBREAUTOMATICO_SOLICITANTE'           ,sql.VarChar(200),         NOMBREAUTOMATICO_SOLICITANTE         )
              .input('RUTAUTOMATICO_SOLICITANTE'              ,sql.VarChar(20),          RUTAUTOMATICO_SOLICITANTE            )
              .input('CARGOAUTOMATICO_SOLICITANTE'            ,sql.VarChar(200),         CARGOAUTOMATICO_SOLICITANTE          )
              .input('EMAILAUTOMATICO_SOLICITANTE'            ,sql.VarChar(200),         EMAILAUTOMATICO_SOLICITANTE          )
              .input('ANEXOAUTOMATICO_SOLICITANTE'            ,sql.VarChar(200),         ANEXOAUTOMATICO_SOLICITANTE          )

              .input('TIPO_DE_SOLICITUD'                      ,sql.VarChar(200),         TIPO_DE_SOLICITUD                    )
              .input('TIPO_MONEDA'                            ,sql.VarChar(200),         TIPO_MONEDA                          )
              .input('MOTIVO_DE_SOLICITUD'                    ,sql.VarChar(2500),         MOTIVO_DE_SOLICITUD                  )
              .input('FECHA_DE_RENDICION'                     ,sql.Date,                 FECHA_DE_RENDICIONSQL                )
              .input('TIPO_DE_RESPALDO'                       ,sql.VarChar(200),         TIPO_DE_RESPALDO                     )
              .input('RESPALDO'                               ,sql.VarChar(500),         RESPALDO                             )
              .input('NOMBRE_BENEFICIARIO'                    ,sql.VarChar(500),         NOMBRE_BENEFICIARIO                  )
              .input('RUT_BEN'                                ,sql.VarChar(20),          RUT_BEN                              )

              .input('TIPO_DE_CUENTA'                         ,sql.VarChar(200),         TIPO_DE_CUENTA                       )
              .input('N_CUENTA'                               ,sql.VarChar(200),         N_CUENTA                             )
              .input('BANCO'                                  ,sql.VarChar(200),         BANCO                                )
              .input('EMAIL_BENEFICIARIO'                     ,sql.VarChar(200),         EMAIL_BENEFICIARIO                   )
              .input('FECHA_PAGO'                             ,sql.Date,                 FECHA_PAGOSQL                        )
              .input('EMPRESA'                                ,sql.VarChar(500),         EMPRESA                              )
              .input('CENTRO_DE_COSTO'                        ,sql.VarChar(200),         CENTRO_DE_COSTO                      )
              .input('MONTO_SOLICITADO'                       ,sql.Decimal(18,4),        MONTO_SOLICITADO                     )
              .query(updateQuery);
          } else {
            // Realizar la inserción
            const insertQuery = `
              INSERT INTO Solicitud (
                  nickSubidoPor                       ,
                  usuarioSubidoPor                    ,
                  fechaHoraSubido                     ,
                  FOLIO                               ,
                  INGRESADO_POR                       ,
                  FECHA_INGRESO                       ,
                  TAREA                               ,
                  ESTADO                              ,
                  FECHA_INICIO                        ,
                  FECHA_TERMINO                       ,
                  Aprobador_Recepcion                 ,
                  Aprobador_Aprobacion                ,               
                  Enviado_a_Tesoreria_Recepcion       ,      
                  Enviado_a_Tesoreria_Aprobacion      ,     
                  Pendiente_de_Rendicion_Recepcion    ,   
                  Pendiente_de_Rendicion_Aprobacion   ,  
                  Cerrado_Recepcion                   ,                  
                  Cerrado_Aprobacion                  ,
                  APROBADOR                           ,

                  NOMBREAUTOMATICO_SOLICITANTE        ,
                  RUTAUTOMATICO_SOLICITANTE           ,
                  CARGOAUTOMATICO_SOLICITANTE         ,
                  EMAILAUTOMATICO_SOLICITANTE         ,
                  ANEXOAUTOMATICO_SOLICITANTE         ,

                  TIPO_DE_SOLICITUD                   ,
                  TIPO_MONEDA                         ,
                  MOTIVO_DE_SOLICITUD                 ,
                  FECHA_DE_RENDICION                  ,
                  TIPO_DE_RESPALDO                    ,
                  RESPALDO                            ,
                  NOMBRE_BENEFICIARIO                 ,
                  RUT_BEN                             ,

                  TIPO_DE_CUENTA                      ,
                  N_CUENTA                            ,
                  BANCO                               ,
                  EMAIL_BENEFICIARIO                  ,
                  FECHA_PAGO                          ,
                  EMPRESA                             ,
                  CENTRO_DE_COSTO                     ,
                  MONTO_SOLICITADO












              )
              VALUES (
                @nickSubidoPor                        ,
                @usuarioSubidoPor                     ,
                @fechaHoraSubido                      ,
                @FOLIO                                ,
                @INGRESADO_POR                        ,
                @FECHA_INGRESO                        ,
                @TAREA                                ,
                @ESTADO                               ,
                @FECHA_INICIO                         ,
                @FECHA_TERMINO                        ,
                @Aprobador_Recepcion                  ,
                @Aprobador_Aprobacion                 ,               
                @Enviado_a_Tesoreria_Recepcion        ,      
                @Enviado_a_Tesoreria_Aprobacion       ,     
                @Pendiente_de_Rendicion_Recepcion     ,   
                @Pendiente_de_Rendicion_Aprobacion    ,  
                @Cerrado_Recepcion                    ,
                @Cerrado_Aprobacion                   ,
                @APROBADOR                            ,

                @NOMBREAUTOMATICO_SOLICITANTE         ,
                @RUTAUTOMATICO_SOLICITANTE            ,
                @CARGOAUTOMATICO_SOLICITANTE          ,
                @EMAILAUTOMATICO_SOLICITANTE          ,
                @ANEXOAUTOMATICO_SOLICITANTE          ,

                @TIPO_DE_SOLICITUD                    ,
                @TIPO_MONEDA                          ,
                @MOTIVO_DE_SOLICITUD                  ,
                @FECHA_DE_RENDICION                   ,
                @TIPO_DE_RESPALDO                     ,
                @RESPALDO                             ,
                @NOMBRE_BENEFICIARIO                  ,
                @RUT_BEN                              ,

                @TIPO_DE_CUENTA                       ,
                @N_CUENTA                             ,
                @BANCO                                ,
                @EMAIL_BENEFICIARIO                   ,
                @FECHA_PAGO                           ,
                @EMPRESA                              ,
                @CENTRO_DE_COSTO                      ,
                @MONTO_SOLICITADO
              );
            `;
            
            await transaction.request()
              .input('nickSubidoPor'                          ,sql.VarChar(200),         nickSubidoPor                        )
              .input('usuarioSubidoPor'                       ,sql.VarChar(200),         usuarioSubidoPor                     )
              .input('fechaHoraSubido'                        ,sql.DateTime,             fechaHoraSubido                      )
              .input('FOLIO'                                  ,sql.Numeric(18, 0),       FOLIO                                )
              .input('INGRESADO_POR'                          ,sql.VarChar(200),         INGRESADO_POR                        )
              .input('FECHA_INGRESO'                          ,sql.Date,                 FECHA_INGRESOSQL                     )
              .input('TAREA'                                  ,sql.VarChar(200),         TAREA                                )
              .input('ESTADO'                                 ,sql.VarChar(200),         ESTADO                               )
              .input('FECHA_INICIO'                           ,sql.Date,                 FECHA_INICIOSQL                      )
              .input('FECHA_TERMINO'                          ,sql.Date,                 FECHA_TERMINOSQL                     )
              .input('Aprobador_Recepcion'                    ,sql.VarChar(50),          Aprobador_RecepcionSQL               )
              .input('Aprobador_Aprobacion'                   ,sql.VarChar(50),          Aprobador_AprobacionSQL              )
              .input('Enviado_a_Tesoreria_Recepcion'          ,sql.VarChar(50),          Enviado_a_Tesoreria_RecepcionSQL     )
              .input('Enviado_a_Tesoreria_Aprobacion'         ,sql.VarChar(50),          Enviado_a_Tesoreria_AprobacionSQL    )
              .input('Pendiente_de_Rendicion_Recepcion'       ,sql.VarChar(50),          Pendiente_de_Rendicion_RecepcionSQL  )
              .input('Pendiente_de_Rendicion_Aprobacion'      ,sql.VarChar(50),          Pendiente_de_Rendicion_AprobacionSQL )
              .input('Cerrado_Recepcion'                      ,sql.VarChar(50),          Cerrado_RecepcionSQL                 )
              .input('Cerrado_Aprobacion'                     ,sql.VarChar(50),          Cerrado_AprobacionSQL                )
              .input('APROBADOR'                              ,sql.VarChar(200),         APROBADOR                            )
              .input('NOMBREAUTOMATICO_SOLICITANTE'           ,sql.VarChar(200),         NOMBREAUTOMATICO_SOLICITANTE         )
              .input('RUTAUTOMATICO_SOLICITANTE'              ,sql.VarChar(20),          RUTAUTOMATICO_SOLICITANTE            )
              .input('CARGOAUTOMATICO_SOLICITANTE'            ,sql.VarChar(200),         CARGOAUTOMATICO_SOLICITANTE          )
              .input('EMAILAUTOMATICO_SOLICITANTE'            ,sql.VarChar(200),         EMAILAUTOMATICO_SOLICITANTE          )
              .input('ANEXOAUTOMATICO_SOLICITANTE'            ,sql.VarChar(200),         ANEXOAUTOMATICO_SOLICITANTE          )
              .input('TIPO_DE_SOLICITUD'                      ,sql.VarChar(200),         TIPO_DE_SOLICITUD                    )
              .input('TIPO_MONEDA'                            ,sql.VarChar(200),         TIPO_MONEDA                          )
              .input('MOTIVO_DE_SOLICITUD'                    ,sql.VarChar(2500),        MOTIVO_DE_SOLICITUD                  )
              .input('FECHA_DE_RENDICION'                     ,sql.Date,                 FECHA_DE_RENDICIONSQL                )
              .input('TIPO_DE_RESPALDO'                       ,sql.VarChar(200),         TIPO_DE_RESPALDO                     )
              .input('RESPALDO'                               ,sql.VarChar(500),         RESPALDO                             )
              .input('NOMBRE_BENEFICIARIO'                    ,sql.VarChar(500),         NOMBRE_BENEFICIARIO                  )
              .input('RUT_BEN'                                ,sql.VarChar(20),          RUT_BEN                              )

              .input('TIPO_DE_CUENTA'                         ,sql.VarChar(200),         TIPO_DE_CUENTA                       )
              .input('N_CUENTA'                               ,sql.VarChar(200),         N_CUENTA                             )
              .input('BANCO'                                  ,sql.VarChar(200),         BANCO                                )
              .input('EMAIL_BENEFICIARIO'                     ,sql.VarChar(200),         EMAIL_BENEFICIARIO                   )
              .input('FECHA_PAGO'                             ,sql.Date,                 FECHA_PAGOSQL                        )
              .input('EMPRESA'                                ,sql.VarChar(500),         EMPRESA                              )
              .input('CENTRO_DE_COSTO'                        ,sql.VarChar(200),         CENTRO_DE_COSTO                      )
              .input('MONTO_SOLICITADO'                       ,sql.Decimal(18,4),        MONTO_SOLICITADO                     )

              .query(insertQuery);
          }
        }
      
        // Hacer commit de la transacción
        await transaction.commit();
        //console.log('Se han subido de a 100 registros como tope a la vez.')
        sql.close();

        res.status(201).json({ message: 'Registros insertados o actualizados correctamente' });
      } catch (error) {
        // Si hay un error, hacer rollback de la transacción
        await transaction.rollback();
        console.error('Error al insertar registros:', error);
        res.status(500).json({ error: 'Error al insertar registros*', details: error.message });
      }
    } catch (error) {
      console.error('Error al insertar registros:', error);
      res.status(500).json({ error: 'Error al insertar registros', details: error.message });
    }
  } else {
    console.error('se encontró un error')
    res.status(405).end();
  }
}

// Función para verificar si un FOLIO existe en la base de datos
async function verificarExistenciaFolio(FOLIO, transaction) {
  const existsQuery = `
    SELECT TOP 1 1
    FROM Solicitud
    WHERE FOLIO = @FOLIO;
  `;
  const result = await transaction.request()
    .input('FOLIO', sql.Numeric(18, 0), FOLIO)
    .query(existsQuery);
  return result.rowsAffected > 0;
}

// Función para convertir la fecha en formato SQL válido (YYYY-MM-DD)
function convertirFechaASQL(fechaTexto) {
  //console.log('Fecha Recibida:'+fechaTexto)
  if (!fechaTexto) {
    return null; // Si la fecha es vacía, retorna null
  }
  const [dia, mes, anio] = fechaTexto.split('/');
  const fechaSQL = `${anio}-${mes}-${dia}`;
  //console.log('Fecha Retornada:'+fechaSQL)
  return fechaSQL;
}


function convertirFechaASQLconTime(fechaTexto) {
  if (!fechaTexto) {
    return null;
  }
  //console.log('así llegó: '+fechaTexto)
  // Divide la cadena en fecha y hora
  const partes = fechaTexto.split(' ');
  const fechaPartes = partes[0].split('/');
  const horaPartes = partes[1].split(':');
  // Extrae las partes de fecha
  const anio = fechaPartes[2];
  const mes = fechaPartes[1].padStart(2, '0'); // Asegura que el mes tenga dos dígitos
  const dia = fechaPartes[0].padStart(2, '0'); // Asegura que el día tenga dos dígitos
  // Extrae las partes de la hora
  const hora = horaPartes[0].padStart(2, '0'); // Asegura que la hora tenga dos dígitos
  const minuto = horaPartes[1].padStart(2, '0'); // Asegura que el minuto tenga dos dígitos
  const segundo = horaPartes[2].padStart(2, '0'); // Asegura que el segundo tenga dos dígitos
  // Formatea la fecha y hora en el formato deseado
  const fechaSQL = `${anio}-${mes}-${dia} ${hora}:${minuto}:${segundo}`;
  //console.log('así se retorna: '+fechaSQL)
  return fechaSQL;
}