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
      const cabeceraId = req.body.Cabecera_Id;
      let correoRevisor = req.body.Correo_Revisor;
      let correoSupervisor = req.body.Correo_Supervisor;

      //console.log('recibí: '+cabeceraId+correoRevisor)
      if(!cabeceraId){
        return res.status(400).json({message: 'Cabecera_Id no proporcionado.', CodigoRetorno: 99})
      }

      if(!correoRevisor){
        return res.status(400).json({message: 'correoRevisor no proporcionado.', CodigoRetorno: 99})
      }

      if(!correoSupervisor){
        return res.status(400).json({message: 'correoSupervisor no proporcionado.', CodigoRetorno: 99})
      }

      if (correoRevisor.indexOf(correoSupervisor) === -1) {
        correoRevisor = correoRevisor.trim() + ";"+correoSupervisor;
      }

      try {
        // Iniciar la transacción
        await transaction.begin();

        // Configurar el tiempo de espera (LOCK_TIMEOUT)
        await transaction.request().query("SET LOCK_TIMEOUT 180000");

        // Si el token es válido, continuar con la inserción en la base de datos
        
        const query = `
        Declare @htmlBody					          VarChar(MAX)
        Declare @Sap_CorreoSolicitnate		  VarChar(500)
        Declare @Sap_Nombre					        VarChar(500)
        Declare @Cantidad					          Int
        Declare @Suma_Monto					        Numeric(18)
        Declare @Fecha_Hora_Actual          DateTime
		    Declare @Sap_Monto					        Numeric(18)
		    Declare @Sap_Texto					        VarChar(500)
		    Declare @Sap_Referencia				      VarChar(200)
		    Declare @Sap_FechaContabilizacion	  Date
        Declare @Sap_Sociedad				        Numeric(18)
        Declare @MargenDerechoEstrofas      VarChar(20)
        Declare @Renglon                    int
        Declare @Color_fondo_renglon        VarChar(50)
        SET @MargenDerechoEstrofas = 'Width:22px'
        

        --Set @Prueba = '2023-10-16 11:34:01.000'
        Set @Fecha_Hora_Actual = (Select Cast(LEFT(CONVERT(VARCHAR,DATEADD(HOUR, 
            CASE WHEN DATEPART(TZOFFSET, getdate() AT TIME ZONE 'Pacific SA Standard Time') = -420 
            THEN -4 /* Horario de verano (GMT-4) */ 
            ELSE -3 /* Horario estándar (GMT-3) */ END,
            getdate() AT TIME ZONE 'Pacific SA Standard Time'),120), 19)as datetime)
        )

        DECLARE Cursor_Crear_Correos CURSOR FOR 
            SELECT Sap_CorreoSolicitante, Sap_Nombre, Count(1) as Cantidad, Sum(Sap_Monto) as Suma
            FROM Sap_Detalle
            WHERE Cabecera_Id = @Cabecera_Id and Sap_CorreoSolicitante <> ''
            GROUP BY Sap_CorreoSolicitante, Sap_Nombre
        
        OPEN Cursor_Crear_Correos
        FETCH NEXT FROM Cursor_Crear_Correos INTO @Sap_CorreoSolicitnate , @Sap_Nombre , @Cantidad , @Suma_Monto
        WHILE (@@FETCH_STATUS <> -1) BEGIN 
            IF (@@FETCH_STATUS <> -2) BEGIN 
                Set @htmlBody = ''
                SET @htmlBody = ltrim(rtrim(@htmlBody)) + '<TABLE align = "LEFT" border="0" cellpadding="0" cellspacing="0" style="width:806px">'+CHAR(10)
                SET @htmlBody = ltrim(rtrim(@htmlBody)) + '	<TR>'+CHAR(10)
                SET @htmlBody = ltrim(rtrim(@htmlBody)) + '		<TD style="Width:820px" colspan="3">'+CHAR(10)
                SET @htmlBody = ltrim(rtrim(@htmlBody)) + '			<img src="https://imagenes.empresassocovesa.cl/imagenes/Institucional/EnvioCorreo/Diseno1/Diseno1_top.jpg">'+CHAR(10)
                SET @htmlBody = ltrim(rtrim(@htmlBody)) + '		</TD>'+CHAR(10)
                SET @htmlBody = ltrim(rtrim(@htmlBody)) + '	</TR>'+CHAR(10)
                SET @htmlBody = ltrim(rtrim(@htmlBody)) + '	<TR>'+CHAR(10)
                SET @htmlBody = ltrim(rtrim(@htmlBody)) + '		<TD style="width:70px" valign="top">'+CHAR(10)
                SET @htmlBody = ltrim(rtrim(@htmlBody)) + '			<img src="https://imagenes.empresassocovesa.cl/imagenes/Institucional/EnvioCorreo/Diseno1/Diseno1_izq.jpg">'+CHAR(10)
                SET @htmlBody = ltrim(rtrim(@htmlBody)) + '		</TD>'+CHAR(10)
                SET @htmlBody = ltrim(rtrim(@htmlBody)) + '		<TD valign="TOP" align = "LEFT">'+CHAR(10)
                SET @htmlBody = ltrim(rtrim(@htmlBody)) + '			<TABLE border="0" cellpadding="0" cellspacing="0">'+CHAR(10)
                SET @htmlBody = ltrim(rtrim(@htmlBody)) + '				<TR style="height:60px">      </TR>'+CHAR(10)
                SET @htmlBody = ltrim(rtrim(@htmlBody)) + '				<TR>'+CHAR(10)
                SET @htmlBody = ltrim(rtrim(@htmlBody)) + '					<TD>'+CHAR(10)
                SET @htmlBody = ltrim(rtrim(@htmlBody)) + '						<img src="https://imagenes.empresassocovesa.cl/imagenes/Institucional/EnvioCorreo/Diseno1/logo-largo-ES.png">'+CHAR(10)
                SET @htmlBody = ltrim(rtrim(@htmlBody)) + '					</TD>'+CHAR(10)
                SET @htmlBody = ltrim(rtrim(@htmlBody)) + '				</TR>'+CHAR(10)
                SET @htmlBody = ltrim(rtrim(@htmlBody)) + '				<TR valign="TOP" align = "LEFT">'+CHAR(10)
                SET @htmlBody = ltrim(rtrim(@htmlBody)) + '					<TD>'+CHAR(10)
                SET @htmlBody = ltrim(rtrim(@htmlBody)) + '						<TABLE border="0" cellpadding="0" cellspacing="0">'+CHAR(10)
                SET @htmlBody = ltrim(rtrim(@htmlBody)) + '							<TR style="height:40px">         </TR>'+CHAR(10)
                SET @htmlBody = ltrim(rtrim(@htmlBody)) + '							<TR>'+CHAR(10)
                SET @htmlBody = ltrim(rtrim(@htmlBody)) + '								<TD style="color:Black; font-family: Trebuchet MS; font-size:10.0pt">'+CHAR(10)
                SET @htmlBody = ltrim(rtrim(@htmlBody)) + '									<B>Estimad@: '+@Sap_Nombre+'</B>'+CHAR(10)
                SET @htmlBody = ltrim(rtrim(@htmlBody)) + '								</TD>'+CHAR(10)
                SET @htmlBody = ltrim(rtrim(@htmlBody)) + '							</TR>'+CHAR(10)
                SET @htmlBody = ltrim(rtrim(@htmlBody)) + '						</TABLE>'+CHAR(10)
                SET @htmlBody = ltrim(rtrim(@htmlBody)) + '					</TD>'+CHAR(10)
                SET @htmlBody = ltrim(rtrim(@htmlBody)) + '				</TR>'+CHAR(10)
                SET @htmlBody = ltrim(rtrim(@htmlBody)) + '				<TR valign="TOP" align = "LEFT">'+CHAR(10)
                SET @htmlBody = ltrim(rtrim(@htmlBody)) + '					<TD>'+CHAR(10)
                SET @htmlBody = ltrim(rtrim(@htmlBody)) + '						<TABLE border="0" cellpadding="0" cellspacing="0">'+CHAR(10)
                SET @htmlBody = ltrim(rtrim(@htmlBody)) + '							<TR style="height:30px">         </TR>'+CHAR(10)
                SET @htmlBody = ltrim(rtrim(@htmlBody)) + '							<TR>'+CHAR(10)
                SET @htmlBody = ltrim(rtrim(@htmlBody)) + '								<TD style="color:Black; font-family: Trebuchet MS; font-size:10.0pt">'+CHAR(10)
                SET @htmlBody = ltrim(rtrim(@htmlBody)) + '									De acuerdo a nuestros registros, usted tiene pendiente de rendición de '
					
                IF (@Cantidad = 1) BEGIN 
                  SET @htmlBody = ltrim(rtrim(@htmlBody)) + ' <B><I><U>1 formulario de Solicitud de Pago</B></I></U> por la suma de $ <B><I><U>' + REPLACE(REPLACE(CONVERT(VARCHAR, CAST(@Suma_Monto AS MONEY), 1), '$', ''),'.00','') + '</B></I></U>.' +CHAR(10)
                END
                IF (@Cantidad > 1) BEGIN 
                  SET @htmlBody = ltrim(rtrim(@htmlBody)) + ' <B><I><U>' + Convert(CHAR(30), @Cantidad) + ' formularios de Solicitud de Pago</B></I></U> por la suma de $ <B><I><U>' + REPLACE(REPLACE(CONVERT(VARCHAR, CAST(@Suma_Monto AS MONEY), 1), '$', ''),'.00','') + '</B></I></U>.' +CHAR(10)
                END
				        SET @htmlBody = ltrim(rtrim(@htmlBody)) + '								</TD>'+CHAR(10)
                SET @htmlBody = ltrim(rtrim(@htmlBody)) + '								<TD style="'+@MargenDerechoEstrofas+'" ></TD>'+CHAR(10)
                SET @htmlBody = ltrim(rtrim(@htmlBody)) + '							</TR>'+CHAR(10)        
                SET @htmlBody = ltrim(rtrim(@htmlBody)) + '						</TABLE>'+CHAR(10)
                SET @htmlBody = ltrim(rtrim(@htmlBody)) + '					</TD>'+CHAR(10)
                SET @htmlBody = ltrim(rtrim(@htmlBody)) + '				</TR>'+CHAR(10)
                SET @htmlBody = ltrim(rtrim(@htmlBody)) + '				<TR valign="TOP" align = "LEFT">'+CHAR(10)
                SET @htmlBody = ltrim(rtrim(@htmlBody)) + '					<TD>'+CHAR(10)
                SET @htmlBody = ltrim(rtrim(@htmlBody)) + '						<TABLE border="0" cellpadding="0" cellspacing="0">'+CHAR(10)
                SET @htmlBody = ltrim(rtrim(@htmlBody)) + '							<TR style="height:20px">         </TR>'+CHAR(10)
                SET @htmlBody = ltrim(rtrim(@htmlBody)) + '							<TR>'+CHAR(10)
                SET @htmlBody = ltrim(rtrim(@htmlBody)) + '								<TD style="color:Black; font-family: Trebuchet MS; font-size:10.0pt">'+CHAR(10)
                SET @htmlBody = ltrim(rtrim(@htmlBody)) + '									Favor enviar respaldos a los siguientes correos: <B><I>aherrera@socovesa.cl</B></I> y <B><I>hvicentea@socovesa.cl</B></I>.'+CHAR(10)
                SET @htmlBody = ltrim(rtrim(@htmlBody)) + '								</TD>'+CHAR(10)
                SET @htmlBody = ltrim(rtrim(@htmlBody)) + '								<TD style="'+@MargenDerechoEstrofas+'" ></TD>'+CHAR(10)
                SET @htmlBody = ltrim(rtrim(@htmlBody)) + '							</TR>'+CHAR(10)
				SET @htmlBody = ltrim(rtrim(@htmlBody)) + '							<TR style="height:20px">         </TR>'+CHAR(10)

				SET @htmlBody = ltrim(rtrim(@htmlBody)) + '							<TR>'+CHAR(10)
                SET @htmlBody = ltrim(rtrim(@htmlBody)) + '								<TD style="color:Black; font-family: Trebuchet MS; font-size:10.0pt">'+CHAR(10)
                SET @htmlBody = ltrim(rtrim(@htmlBody)) + '									Le recordamos que el plazo máximo para rendir fondos es de <B><I><U>60 días</U></I></B>.'+CHAR(10)
                SET @htmlBody = ltrim(rtrim(@htmlBody)) + '								</TD>'+CHAR(10)
                SET @htmlBody = ltrim(rtrim(@htmlBody)) + '								<TD style="'+@MargenDerechoEstrofas+'" ></TD>'+CHAR(10)
                SET @htmlBody = ltrim(rtrim(@htmlBody)) + '							</TR>'+CHAR(10)
				SET @htmlBody = ltrim(rtrim(@htmlBody)) + '							<TR style="height:20px">         </TR>'+CHAR(10)


                SET @htmlBody = ltrim(rtrim(@htmlBody)) + '						</TABLE>'+CHAR(10)
                SET @htmlBody = ltrim(rtrim(@htmlBody)) + '					</TD>'+CHAR(10)
                SET @htmlBody = ltrim(rtrim(@htmlBody)) + '				</TR>'+CHAR(10)
                SET @htmlBody = ltrim(rtrim(@htmlBody)) + '				<TR valign="TOP" align = "LEFT">'+CHAR(10)
                SET @htmlBody = ltrim(rtrim(@htmlBody)) + '					<TD>'+CHAR(10)

                
				        --COMIENZA EL STYLE...
                SET @htmlBody = ltrim(rtrim(@htmlBody)) + '						   <style>'+CHAR(10)
                SET @htmlBody = ltrim(rtrim(@htmlBody)) + '                 .round_table {'+CHAR(10)
                SET @htmlBody = ltrim(rtrim(@htmlBody)) + '                 border: 1px solid #a7a7a7 !important;'+CHAR(10)
                SET @htmlBody = ltrim(rtrim(@htmlBody)) + '                 border-radius: 5px 5px 0px 0px !important;'+CHAR(10)
                SET @htmlBody = ltrim(rtrim(@htmlBody)) + '                 -moz-border-radius: 5px 5px 0px 0px !important;'+CHAR(10)
                SET @htmlBody = ltrim(rtrim(@htmlBody)) + '                 -webkit-border-radius: 5px 5px 0px 0px !important;'+CHAR(10)
                SET @htmlBody = ltrim(rtrim(@htmlBody)) + '                 }'+CHAR(10)
               
                SET @htmlBody = ltrim(rtrim(@htmlBody)) + '						  </style>'+CHAR(10)
				
                --TERMINA EL STYLE...



                --COMIENZA LA TABLA...
                SET @htmlBody = ltrim(rtrim(@htmlBody)) + '						<table id="SapInfo" border="0" cellpadding="0" cellspacing="0" class="round_table">'+CHAR(10)
                SET @htmlBody = ltrim(rtrim(@htmlBody)) + '						       <tr style="height:40px; font-family: Trebuchet MS; font-size:9.0pt">'+CHAR(10)
                SET @htmlBody = ltrim(rtrim(@htmlBody)) + '						           <td style="width: 75px; text-align: center;background-color: #3498db; color: white;">Sociedad</td>'+CHAR(10)
                SET @htmlBody = ltrim(rtrim(@htmlBody)) + '						           <td style="width: 75px; text-align: center;background-color: #3498db; color: white;">Fecha</td>'+CHAR(10)
                SET @htmlBody = ltrim(rtrim(@htmlBody)) + '						           <td style="width: 100px; text-align: center;background-color: #3498db; color: white;">Referencia</td>'+CHAR(10)
                SET @htmlBody = ltrim(rtrim(@htmlBody)) + '						           <td style="width: 80px; text-align: right;background-color: #3498db; color: white;">Monto</td>'+CHAR(10)
                SET @htmlBody = ltrim(rtrim(@htmlBody)) + '						           <td style="text-align: center;background-color: #3498db; color: white;">Texto</td>'+CHAR(10)
                SET @htmlBody = ltrim(rtrim(@htmlBody)) + '						       </tr>'+CHAR(10)

                DECLARE Cursor_Detalle_Correos CURSOR FOR 
                  SELECT Sap_Monto , Sap_Texto , Sap_Referencia , Sap_FechaContabilizacion, Sap_Sociedad
                  FROM Sap_Detalle
                  WHERE Cabecera_Id = @Cabecera_Id and Sap_CorreoSolicitante = @Sap_CorreoSolicitnate
                  ORDER BY Cabecera_Id, Sap_CorreoSolicitante, Sap_FechaContabilizacion

                SET @Renglon = 1
                
                OPEN Cursor_Detalle_Correos
                FETCH NEXT FROM Cursor_Detalle_Correos INTO @Sap_Monto, @Sap_Texto , @Sap_Referencia , @Sap_FechaContabilizacion, @Sap_Sociedad
                WHILE (@@FETCH_STATUS <> -1) BEGIN 
                  IF (@@FETCH_STATUS <> -2) BEGIN

                    If @Renglon % 2 = 0 Begin
                      SET @Color_fondo_renglon = 'background-color: #f2f2f2;'
                    End
                    If @Renglon % 2 <> 0 Begin
                      SET @Color_fondo_renglon = ''
                    End

					      	  --COMIENZAN LAS FILAS DINÁMICAS DEL CORREO... DINÁMICAS PORQUE NO TODOS LOS CORREOS TIENEN LA MISMA CANTIDAD DE RENGLONES...
                    SET @htmlBody = ltrim(rtrim(@htmlBody)) + '						       <tr style="height:40px; font-family: Trebuchet MS; font-size:9.0pt">'+CHAR(10)
                    SET @htmlBody = ltrim(rtrim(@htmlBody)) + '						           <td align = "CENTER" style="'+@Color_fondo_renglon+'">'+CONVERT(VARCHAR(20), @Sap_Sociedad)+'</td>'+CHAR(10)
                    SET @htmlBody = ltrim(rtrim(@htmlBody)) + '						           <td align = "CENTER" style="'+@Color_fondo_renglon+'">'+CONVERT(varchar(10), @Sap_FechaContabilizacion, 103)+'</td>'+CHAR(10)
                    SET @htmlBody = ltrim(rtrim(@htmlBody)) + '						           <td align = "CENTER" style="'+@Color_fondo_renglon+'">'+@Sap_Referencia+'</td>'+CHAR(10)
                    SET @htmlBody = ltrim(rtrim(@htmlBody)) + '						           <td align = "RIGHT" style="'+@Color_fondo_renglon+'">$ '+REPLACE(REPLACE(CONVERT(VARCHAR, CAST(@Sap_Monto AS MONEY), 1), '$', ''),'.00','')+'</td>'+CHAR(10)
                    SET @htmlBody = ltrim(rtrim(@htmlBody)) + '						           <td style="padding-left:30px;padding-right:10px;'+@Color_fondo_renglon+'" >'+ @Sap_Texto + '</td>'+CHAR(10)
                    SET @htmlBody = ltrim(rtrim(@htmlBody)) + '						       </tr>'+CHAR(10)
                    SET @Renglon = @Renglon + 1
                  END 
                  FETCH NEXT FROM Cursor_Detalle_Correos INTO @Sap_Monto, @Sap_Texto , @Sap_Referencia , @Sap_FechaContabilizacion , @Sap_Sociedad
                END
                CLOSE		Cursor_Detalle_Correos
                DEALLOCATE	Cursor_Detalle_Correos

                --TERMINA LA TABLA
                SET @htmlBody = ltrim(rtrim(@htmlBody)) + '						   </table>'+CHAR(10)



                SET @htmlBody = ltrim(rtrim(@htmlBody)) + '				</TD>'+CHAR(10)
                SET @htmlBody = ltrim(rtrim(@htmlBody)) + '								<TD style="'+@MargenDerechoEstrofas+'" ></TD>'+CHAR(10)
                SET @htmlBody = ltrim(rtrim(@htmlBody)) + '				</TR>'+CHAR(10)
                SET @htmlBody = ltrim(rtrim(@htmlBody)) + '				<TR valign="TOP" align = "LEFT">'+CHAR(10)
                SET @htmlBody = ltrim(rtrim(@htmlBody)) + '					<TD>                </TD>'+CHAR(10)
                SET @htmlBody = ltrim(rtrim(@htmlBody)) + '				</TR>'+CHAR(10)
                SET @htmlBody = ltrim(rtrim(@htmlBody)) + '				<TR valign="TOP" align = "LEFT">'+CHAR(10)
                SET @htmlBody = ltrim(rtrim(@htmlBody)) + '					<TD>'+CHAR(10)
                SET @htmlBody = ltrim(rtrim(@htmlBody)) + '						<TABLE border="0" cellpadding="0" cellspacing="0">'+CHAR(10)
                SET @htmlBody = ltrim(rtrim(@htmlBody)) + '							<TR style="height:30px">         </TR>'+CHAR(10)
                SET @htmlBody = ltrim(rtrim(@htmlBody)) + '							<TR>'+CHAR(10)
                SET @htmlBody = ltrim(rtrim(@htmlBody)) + '								<TD style="color:Black; font-family: Trebuchet MS; font-size:10.0pt"><B><I>'+CHAR(10)
                SET @htmlBody = ltrim(rtrim(@htmlBody)) + '									Atte., <BR>Área de UCP - Centro de Servicios Compartidos</B></I>'+CHAR(10)
                SET @htmlBody = ltrim(rtrim(@htmlBody)) + '								</TD>'+CHAR(10)
                SET @htmlBody = ltrim(rtrim(@htmlBody)) + '							</TR>'+CHAR(10)
                SET @htmlBody = ltrim(rtrim(@htmlBody)) + '						</TABLE>'+CHAR(10)
                SET @htmlBody = ltrim(rtrim(@htmlBody)) + '					</TD>'+CHAR(10)
                SET @htmlBody = ltrim(rtrim(@htmlBody)) + '				</TR>'+CHAR(10)
                SET @htmlBody = ltrim(rtrim(@htmlBody)) + '			</TABLE>'+CHAR(10)
                SET @htmlBody = ltrim(rtrim(@htmlBody)) + '		</TD>'+CHAR(10)
                SET @htmlBody = ltrim(rtrim(@htmlBody)) + '		<TD ALIGN="RIGHT" style="width:43px" valign="top">'+CHAR(10)
                SET @htmlBody = ltrim(rtrim(@htmlBody)) + '			<img src="https://imagenes.empresassocovesa.cl/imagenes/Institucional/EnvioCorreo/Diseno1/Diseno1_der.jpg">'+CHAR(10)
                SET @htmlBody = ltrim(rtrim(@htmlBody)) + '		</TD>'+CHAR(10)
                SET @htmlBody = ltrim(rtrim(@htmlBody)) + '	</TR>'+CHAR(10)
                SET @htmlBody = ltrim(rtrim(@htmlBody)) + '</table>'
                insert into Correo(Cabecera_Id,Correo_to,Correo_Nombre_Destinatario,Correo_cc,Correo_gerente,Correo_from,Correo_asunto,Correo_body,Sap_Monto_total,Sap_Cantidad_Documentos,Correo_fecha_creacion,Correo_estado,Correo_estado_descripcion,ID_INSTITUCIONAL_CORREO)
                values(@Cabecera_Id,@Sap_CorreoSolicitnate,@Sap_Nombre,@Correo_Revisor,'','UCP_Cobranzas','Cobranzas U.C.P.',@htmlBody,@Suma_Monto,@Cantidad,@Fecha_Hora_Actual,0,'No Validado',0)
                --SELECT @Sap_Nombre , @Cantidad , @htmlBody
            END 
            FETCH NEXT FROM Cursor_Crear_Correos INTO @Sap_CorreoSolicitnate , @Sap_Nombre , @Cantidad , @Suma_Monto
        END
        CLOSE		Cursor_Crear_Correos
        DEALLOCATE	Cursor_Crear_Correos
        
        `;

        const result = await transaction
          .request()
          .input('Cabecera_Id', sql.Numeric(18), cabeceraId)
          .input('Correo_Revisor', sql.VarChar(200), correoRevisor)
          .query(query);
        
        await transaction.commit();

        // Cerrar la conexión a la base de datos
        await sql.close();

        res.status(201).json({ message: 'Correos Generados Correctamente.', CodigoRetorno: 1 });
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

