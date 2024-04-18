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
            Cabecera_Id                       , 
            Sap_SocDocCta                     ,  
            Sap_Sociedad                      ,
            Sap_DescripcionSociedad           ,
            Sap_NombreUsuario                 ,
            Sap_NroDocumento                  ,
            Sap_FechaContabilizacion          ,
            Sap_Cuenta                        ,
            Sap_Clase                         ,
            Sap_Referencia                    ,
            Sap_Rut                           ,
            Sap_Nombre                        ,
            Sap_Monto                         ,
            Sap_Texto                         ,
            Sap_IndicadorCME                  ,
            Sap_Asignacion                    ,
            Sap_Periodo                       ,
            Sap_Ano                           ,
            Sap_Estado                        ,
            Sap_Comentario1                   ,
            Sap_Comentario2                   ,
            Sap_Comentario3                   ,
            Sap_Contabilizada                 ,
            Sap_CorreoSolicitante             ,
          } = record;
          
          //console.log('*** Registro Recibido desde SubirSapDetalle.js :', record);

          // Convertir la fecha de texto a un formato SQL válido (YYYY-MM-DD)
          const Sap_FechaContabilizacionSQL                        = convertirFechaASQL(Sap_FechaContabilizacion);



           
          // Realizar la inserción
          const insertQuery = `
            INSERT INTO Sap_Detalle (
                
                Cabecera_Id                         ,
                Sap_SocDocCta                       ,
                Sap_Sociedad                        ,
                Sap_DescripcionSociedad             ,
                Sap_NombreUsuario                   ,
                Sap_NroDocumento                    ,
                Sap_FechaContabilizacion            ,
                Sap_Cuenta                          ,
                Sap_Clase                           ,
                Sap_Referencia                      ,
                Sap_Rut                             ,
                Sap_Nombre                          ,
                Sap_Monto                           ,
                Sap_Texto                           ,
                Sap_IndicadorCME                    ,
                Sap_Asignacion                      ,
                Sap_Periodo                         ,
                Sap_Ano                             ,
                Sap_Estado                          ,
                Sap_Comentario1                     ,
                Sap_Comentario2                     ,
                Sap_Comentario3                     ,
                Sap_Contabilizada                   ,
                Sap_CorreoSolicitante
            )
            VALUES (
              @Cabecera_Id                          ,
              @Sap_SocDocCta                        ,
              @Sap_Sociedad                         ,
              @Sap_DescripcionSociedad              ,
              @Sap_NombreUsuario                    ,
              @Sap_NroDocumento                     ,
              @Sap_FechaContabilizacion             ,
              @Sap_Cuenta                           ,
              @Sap_Clase                            ,
              @Sap_Referencia                       ,
              @Sap_Rut                              ,
              @Sap_Nombre                           ,
              @Sap_Monto                            ,
              @Sap_Texto                            ,
              @Sap_IndicadorCME                     ,
              @Sap_Asignacion                       ,
              @Sap_Periodo                          ,
              @Sap_Ano                              ,
              @Sap_Estado                           ,
              @Sap_Comentario1                      ,
              @Sap_Comentario2                      ,
              @Sap_Comentario3                      ,
              @Sap_Contabilizada                    ,
              @Sap_CorreoSolicitante
            );
          `;
          
          await transaction.request()
            .input('Cabecera_Id'                            ,sql.Numeric(18,0),       Cabecera_Id                           )
            .input('Sap_SocDocCta'                          ,sql.VarChar(200),        Sap_SocDocCta                         )
            .input('Sap_Sociedad'                           ,sql.Numeric(18,0),       Sap_Sociedad                          )
            .input('Sap_DescripcionSociedad'                ,sql.VarChar(200),        Sap_DescripcionSociedad               )
            .input('Sap_NombreUsuario'                      ,sql.VarChar(200),        Sap_NombreUsuario                     )
            .input('Sap_NroDocumento'                       ,sql.VarChar(50),         Sap_NroDocumento                      )
            .input('Sap_FechaContabilizacion'               ,sql.Date,                Sap_FechaContabilizacionSQL           )
            .input('Sap_Cuenta'                             ,sql.VarChar(50),         Sap_Cuenta                            )
            .input('Sap_Clase'                              ,sql.VarChar(50),         Sap_Clase                             )
            .input('Sap_Referencia'                         ,sql.VarChar(200),        Sap_Referencia                        )
            .input('Sap_Rut'                                ,sql.VarChar(20),         Sap_Rut                               )
            .input('Sap_Nombre'                             ,sql.VarChar(200),        Sap_Nombre                            )
            .input('Sap_Monto'                              ,sql.Decimal(18,0),       Sap_Monto                             )
            .input('Sap_Texto'                              ,sql.VarChar(500),        Sap_Texto                             )
            .input('Sap_IndicadorCME'                       ,sql.VarChar(50),         Sap_IndicadorCME                      )
            .input('Sap_Asignacion'                         ,sql.VarChar(200),        Sap_Asignacion                        )
            .input('Sap_Periodo'                            ,sql.VarChar(10),         Sap_Periodo                           )
            .input('Sap_Ano'                                ,sql.Int,                 Sap_Ano                               )
            .input('Sap_Estado'                             ,sql.VarChar(100),        Sap_Estado                            )
            .input('Sap_Comentario1'                        ,sql.VarChar(1500),       Sap_Comentario1                       )
            .input('Sap_Comentario2'                        ,sql.VarChar(1500),       Sap_Comentario2                       )
            .input('Sap_Comentario3'                        ,sql.VarChar(1500),       Sap_Comentario3                       )
            .input('Sap_Contabilizada'                      ,sql.VarChar(1500),       Sap_Contabilizada                     )
            .input('Sap_CorreoSolicitante'                  ,sql.VarChar(200),        Sap_CorreoSolicitante                 )
            .query(insertQuery);
            
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


