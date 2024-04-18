import dbConfig from '../../../components/dbConfig';
import sql from 'mssql';
import { verifyToken } from '../auth'; // Asegúrate de tener esta importación correcta

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
      const pool = await sql.connect(dbConfig);

      // Obtener el archivo Excel del cuerpo de la solicitud
      const excelData = req.body;

      // Iterar sobre los datos del archivo Excel y realizar inserciones en la base de datos
      for (const row of excelData) {
        const {
          SolCheq_Sociedad,
          SolCheq_NroSolicitud,
          SolCheq_FechaAprobacion,
          SolCheq_FechaDicitacion,
          SolCheq_Solicitante,
          SolCheq_TipoFondo,
          SolCheq_Proveedor,
          SolCheq_Rut,
          SelCheq_Monto,
          SelCheq_NroSap,
          SelCheq_EntregadoA,
          SelCheq_FechaEntrega,
          SelCheq_CorreoSolicitante,
          SelCheq_ControlInterno,
          SelCheq_FechaRendicion
        } = row;

        const query = `
          INSERT INTO [dbo].[SolicitudCheque] (
            [SolCheq_Sociedad],
            [SolCheq_NroSolicitud],
            [SolCheq_FechaAprobacion],
            [SolCheq_FechaDicitacion],
            [SolCheq_Solicitante],
            [SolCheq_TipoFondo],
            [SolCheq_Proveedor],
            [SolCheq_Rut],
            [SelCheq_Monto],
            [SelCheq_NroSap],
            [SelCheq_EntregadoA],
            [SelCheq_FechaEntrega],
            [SelCheq_CorreoSolicitante],
            [SelCheq_ControlInterno],
            [SelCheq_FechaRendicion],
            [Cabecera_Id]
          )
          VALUES (
            @SolCheq_Sociedad,
            @SolCheq_NroSolicitud,
            @SolCheq_FechaAprobacion,
            @SolCheq_FechaDicitacion,
            @SolCheq_Solicitante,
            @SolCheq_TipoFondo,
            @SolCheq_Proveedor,
            @SolCheq_Rut,
            @SelCheq_Monto,
            @SelCheq_NroSap,
            @SelCheq_EntregadoA,
            @SelCheq_FechaEntrega,
            @SelCheq_CorreoSolicitante,
            @SelCheq_ControlInterno,
            @SelCheq_FechaRendicion,
            20
          );
        `;

        await pool
          .request()
          .input('SolCheq_Sociedad', sql.Decimal, SolCheq_Sociedad)
          .input('SolCheq_NroSolicitud', sql.Decimal, SolCheq_NroSolicitud)
          .input('SolCheq_FechaAprobacion', sql.Date, SolCheq_FechaAprobacion)
          .input('SolCheq_FechaDicitacion', sql.Date, SolCheq_FechaDicitacion)
          .input('SolCheq_Solicitante', sql.NChar, SolCheq_Solicitante)
          .input('SolCheq_TipoFondo', sql.NChar, SolCheq_TipoFondo)
          .input('SolCheq_Proveedor', sql.NChar, SolCheq_Proveedor)
          .input('SolCheq_Rut', sql.NChar, SolCheq_Rut)
          .input('SelCheq_Monto', sql.Decimal, SelCheq_Monto)
          .input('SelCheq_NroSap', sql.Decimal, SelCheq_NroSap)
          .input('SelCheq_EntregadoA', sql.NChar, SelCheq_EntregadoA)
          .input('SelCheq_FechaEntrega', sql.Date, SelCheq_FechaEntrega)
          .input('SelCheq_CorreoSolicitante', sql.NChar, SelCheq_CorreoSolicitante)
          .input('SelCheq_ControlInterno', sql.NChar, SelCheq_ControlInterno)
          .input('SelCheq_FechaRendicion', sql.Date, SelCheq_FechaRendicion)
          .query(query);
      }

      sql.close();

      res.status(201).json({ message: 'Datos desde el archivo Excel insertados correctamente en la tabla SolicitudCheque' });
    } catch (error) {
      console.error('Error al insertar datos desde el archivo Excel:', error);
      res.status(500).json({ error: 'Error al insertar datos desde el archivo Excel', details: error.message });
    }
  } else {
    res.status(405).end();
  }
}
