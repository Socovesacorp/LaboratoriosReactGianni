import dbConfig from '../../../components/dbConfig';
import sql from 'mssql';
import { verifyToken } from '../auth';

export default async function CerrarPeriodo(req, res) {
    if (req.method === 'GET') {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'Token no proporcionado' });
        }

        const NICK = req.query.NICK;
        const USUARIO = req.query.USUARIO;
        //const Sociedad_Cod = req.query.Sociedad_Cod;
        //const Proyecto_Nombre = req.query.Proyecto_Nombre;

        let resultado = {
            error: 0,
            descripcionError: 'Periodo cerrado correctamente.'
        };

        try {
            const decodedToken = verifyToken(token);

            const pool = await sql.connect({
                ...dbConfig,
                requestTimeout: 300000 // 300 segundos
            });
            const transaction = pool.transaction();
            await transaction.begin();
            await transaction.request().query("SET LOCK_TIMEOUT 180000")

            const result = await transaction.request().query(`
            DECLARE @Periodo VARCHAR(6)
            DECLARE @ERROR INT
            DECLARE @DescripcionError VARCHAR(300)
            DECLARE @Fecha_Hora_Actual DATETIME
            DECLARE @Cabecera_Id NUMERIC(18,0)
            
            --Calculo Fecha y Hora Actual...
            SET @Fecha_Hora_Actual = SYSDATETIMEOFFSET() AT TIME ZONE 'Pacific SA Standard Time'
            
            SET @ERROR = 0
            SET @DescripcionError = 'Periodo cerrado correctamente.'
            
            SELECT TOP 1 @Periodo = Periodo FROM Seguros_DescuentosAlPersonalExcel (NOLOCK)
            
            IF @Periodo IS NULL
            BEGIN
                SET @Periodo = ''
                SET @ERROR = 1
                SET @DescripcionError = 'Dentro de la tabla Seguros_TrabajadoresExcel no se ha encontrado un Periodo. Favor verificar.'
            END
            
            IF @ERROR = 0
            BEGIN
                INSERT INTO Seguros_Cabecera(Cabecera_FechaSubida,Cabecera_NickSubida,Cabecera_Referencia,Cabecera_NombreUsuarioSubida)
                SELECT @Fecha_Hora_Actual, '${NICK}' , @Periodo, '${USUARIO}'
                SET @Cabecera_Id = SCOPE_IDENTITY();
                IF @Cabecera_Id IS NULL
                BEGIN
                    SET @ERROR = 1
                    SET @DescripcionError = 'No se pudo crear la tabla Cabecera.'
                END
            END

            IF @ERROR = 0
            BEGIN
                INSERT INTO Seguros_Trabajadores([Cabecera_Id],[Estado],[Rut],[DV],[NIF],[Nombres],[ApellidoPaterno],[ApellidoMaterno],[CentroCoste],[Denominacion],[NombreProyecto],[CodigoProyecto])
                SELECT @Cabecera_Id,[Estado],[Rut],[DV],[NIF],[Nombres],[ApellidoPaterno],[ApellidoMaterno],[CentroCoste],[Denominacion],[NombreProyecto],[CodigoProyecto] FROM [Seguros_TrabajadoresExcel]

                INSERT INTO Seguros_DescuentosAlPersonal([Cabecera_Id],[Rut],[DV],[Apellido_Nombre],[NIF],[Sociedad],[NombreEmpresa],[CentroCoste],[Denominacion],[Periodo],[TipoSeguro],[Importe])
                SELECT @Cabecera_Id,[Rut],[DV],[Apellido_Nombre],[NIF],[Sociedad],[NombreEmpresa],[CentroCoste],[Denominacion],[Periodo],[TipoSeguro],[Importe] FROM [Seguros_DescuentosAlPersonalExcel]

                INSERT INTO Seguros_CobroAseguradora([Cabecera_Id],[ContratantePrincipal],[RutEmpresa],[DVEmpresa],[TipoAseg],[Rut_Asegurado],[DV_Asegurado],[NIF_Asegurado],[Nombres],[Ape.Paterno],[Ape.Materno],[Periodo],[Exento],[Afecto],[Iva],[Total])
                SELECT @Cabecera_Id,[ContratantePrincipal],[RutEmpresa],[DVEmpresa],[TipoAseg],[Rut_Asegurado],[DV_Asegurado],[NIF_Asegurado],[Nombres],[Ape.Paterno],[Ape.Materno],[Periodo],[Exento],[Afecto],[Iva],[Total] FROM [Seguros_CobroAseguradoraExcel]

                INSERT INTO Seguros_Facturas([Cabecera_Id],[Sociedad_Rut],[Sociedad_RazonSocial],[Sociedad_RutN],[Sociedad_Dv],[Factura_Nro],[Factura_Exento],[Factura_Neto],[Factura_Iva],[Factura_Total],[Sociedad_Id])
                SELECT @Cabecera_Id,[Sociedad_Rut],[Sociedad_RazonSocial],[Sociedad_RutN],[Sociedad_Dv],[Factura_Nro],[Factura_Exento],[Factura_Neto],[Factura_Iva],[Factura_Total],[Sociedad_Id] FROM [Seguros_FacturasExcel]

                INSERT INTO [Seguros_DiferenciasSobreLoFacturado]([Cabecera_Id],[Sociedad_Cod],[Sociedad_Id],[Sociedad_RazonSocial],[NroTrabajadoresDescuento],[TotalDescuentos],[NroTrabajadoresCobroAseguradora],[TotalCalculadoAseguradora],[TotalFactura],[TotalDiferencia],[TotalCalculadoExentoAseguradora],[TotalExentoFactura],[TotalDiferenciaExento],[TotalCalculadoAfectoAseguradora],[TotalAfectoFactura],[TotalDiferenciaAfecto],[TotalCalculadoIvaAseguradora],[TotalIvaFactura],[TotalDiferenciaIva],[TotalCalculadoCostoEmpresa],[TotalCostoEmpresaFactura],[TotalDiferenciaCostoEmpresa])
                SELECT 
                    @Cabecera_Id,
                    s.Sociedad_Cod							                                            AS Sociedad_Cod,
                    (select Sociedad_Id from Sociedades where Sociedad_Cod = s.Sociedad_Cod)			AS Sociedad_Id,
                    s.Sociedad_RazonSocial					                                            AS Sociedad_RazonSocial, 
                    COALESCE(Sum(NroTrabajadoresDescuento),0)			                                AS NroTrabajadoresDescuento,
                    COALESCE(Sum(TotalDescuentos),0)					                                AS TotalDescuentos,
                    COALESCE(Sum(NroTrabajadoresCobroAseguradora),0)	                                AS NroTrabajadoresCobroAseguradora,
                    COALESCE(Sum(TotalCobroAseguradora),0)					                            AS TotalCobroAseguradora,
                    COALESCE((select Factura_Total from Seguros_FacturasExcel , SOCIEDADES where Sociedad_RutN = Sociedades.Sociedad_Rut AND SOCIEDAD_COD = s.Sociedad_Cod  ),0)                                                    AS TotalFactura,
                    COALESCE(Sum(TotalCobroAseguradora),0) - COALESCE((select Factura_Total from Seguros_FacturasExcel , SOCIEDADES where Sociedad_RutN = Sociedades.Sociedad_Rut AND SOCIEDAD_COD = s.Sociedad_Cod  ),0)           AS DiferenciaTotal,
    
                    COALESCE(Sum(TotalExentoCobroAseguradora),0)			                            AS TotalExentoCobroAseguradora,
                    COALESCE((select Factura_Exento from Seguros_FacturasExcel , SOCIEDADES where Sociedad_RutN = Sociedades.Sociedad_Rut AND SOCIEDAD_COD = s.Sociedad_Cod  ),0)                                                   AS TotalExento,
                    COALESCE(Sum(TotalExentoCobroAseguradora),0)-COALESCE((select Factura_Exento from Seguros_FacturasExcel , SOCIEDADES where Sociedad_RutN = Sociedades.Sociedad_Rut AND SOCIEDAD_COD = s.Sociedad_Cod  ),0)      AS DiferenciaExento,
    
                    COALESCE(Sum(TotalAfectoCobroAseguradora),0)			                            AS TotalAfectoCobroAseguradora,
                    COALESCE((select Factura_Neto from Seguros_FacturasExcel , SOCIEDADES where Sociedad_RutN = Sociedades.Sociedad_Rut AND SOCIEDAD_COD = s.Sociedad_Cod  ),0)                                                     AS TotalAfecto,
                    COALESCE(Sum(TotalAfectoCobroAseguradora),0)-COALESCE((select Factura_Neto from Seguros_FacturasExcel , SOCIEDADES where Sociedad_RutN = Sociedades.Sociedad_Rut AND SOCIEDAD_COD = s.Sociedad_Cod  ),0)        AS DiferenciaAfecto,
    
                    COALESCE(Sum(TotalIvaCobroAseguradora),0)				                            AS TotalIvaCobroAseguradora,
                    COALESCE((select Factura_Iva from Seguros_FacturasExcel , SOCIEDADES where Sociedad_RutN = Sociedades.Sociedad_Rut AND SOCIEDAD_COD = s.Sociedad_Cod  ),0)                                                      AS TotalIva,
                    COALESCE(Sum(TotalIvaCobroAseguradora),0)-COALESCE((select Factura_Iva from Seguros_FacturasExcel , SOCIEDADES where Sociedad_RutN = Sociedades.Sociedad_Rut AND SOCIEDAD_COD = s.Sociedad_Cod  ),0)            AS DiferenciaIva,
    
                    COALESCE(Sum(CostoEmpresa),0)	 						                            AS CostoEmpresa,
                    COALESCE((select Factura_Total from Seguros_FacturasExcel , SOCIEDADES where Sociedad_RutN = Sociedades.Sociedad_Rut AND SOCIEDAD_COD = s.Sociedad_Cod  ),0) - COALESCE(Sum(TotalDescuentos),0) As CostoEmpresaSegunFactura,
                    COALESCE(Sum(CostoEmpresa),0) - (COALESCE((select Factura_Total from Seguros_FacturasExcel , SOCIEDADES where Sociedad_RutN = Sociedades.Sociedad_Rut AND SOCIEDAD_COD = s.Sociedad_Cod  ),0) - COALESCE(Sum(TotalDescuentos),0)) AS DiferenciaCostoEmpresa
                From AnalisisGlobalSinTotalExcel as s
                Group By s.Sociedad_Cod ,  s.Sociedad_RazonSocial 
                Order By s.Sociedad_Cod , s.Sociedad_RazonSocial

                INSERT INTO Seguros_DiferenciasSobreLoDistribuido([Cabecera_Id],[Sociedad_Cod],[Sociedad_Id],[Sociedad_RazonSocial],[CentroCoste],[Denominacion],[NroTrabajadoresDescuento],[TotalDescuentos],[NroTrabajadoresCobroAseguradora],[TotalAseguradora],[TotalExentoAseguradora],[TotalAfectoAseguradora],[TotalIvaAseguradora],[TotalCostoEmpresa])
                SELECT 
                    @Cabecera_Id,
                    Sociedad_Cod,
                    (select Sociedad_Id from Sociedades where Sociedad_Cod = AnalisisGlobalConTotalExcel.Sociedad_Cod)			AS Sociedad_Id,
                    Sociedad_RazonSocial, 
			        CentroCoste,
			        Denominacion,
                    NroTrabajadoresDescuento,
                    TotalDescuentos,
                    NroTrabajadoresCobroAseguradora,
                    TotalCobroAseguradora,
                    TotalExentoCobroAseguradora,
                    TotalAfectoCobroAseguradora,
                    TotalIvaCobroAseguradora,
                    CostoEmpresa
                From AnalisisGlobalConTotalExcel 
                Order By Id2
            END
            select @ERROR as ERROR, @DescripcionError as DescripcionError

            `);
               
            resultado.error = result.recordset[0].ERROR;
            resultado.descripcionError = result.recordset[0].DescripcionError;
            await transaction.commit();
            await sql.close();
            console.log(resultado)
            res.status(200).json({ resultado });

        } catch (error) {
            console.error('** Error al Cerrar un Periodo: ', error);
            resultado = {
                error: 999,
                descripcionError: 'Al ejecutar el T-Sql en el Servidor de Base de Datos aparece el siguiente error: '+ error.message
            };
            console.log(resultado)
            res.status(500).json({ resultado });
        }
    } else {
        res.status(405).end();
    }
}
