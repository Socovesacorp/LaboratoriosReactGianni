import React, { useState , useEffect }              from 'react';
import * as XLSX                                    from 'xlsx';
import { DataGrid }                                 from '@mui/x-data-grid';
import { Button, Snackbar, Input, Box }             from '@mui/material';
import ManejoDatosGrillaMaterialUi                  from '../ManejarDatosGrilla/ManejoDatosGrillaMaterialUi';
import LlamadosApis                                 from '../ManejarDatosApis/LlamadosApis';
import ManejoDatosExcel                             from '../ManejarDatosGrilla/ManejoDatosExcel';
import '../../hojas-de-estilo/MantenedorExcels.css';

const SubirSolicitudesSap = (props) => {
  const {textoNick, NombreUsuario , CodPerfil, CorreoUsuario, CorreoSupervisor} = props;
  const [openAlertaExcel, setOpenAlertaExcel] = useState(false);
  const [OpenAlertaImportarDatosNube, setOpenAlertaImportarDatosNube] = useState(false);
  const [openAlertaCargarGrilla, setopenAlertaCargarGrilla] = useState(false);
  const [openAlertaError, setOpenAlertaError] = useState(false);
  const [openAlertaErrorApi, setOpenAlertaErrorApi] = useState(false);
  const [rowSelectionModel, setRowSelectionModel] = useState([]);
  const [rows, setRows] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [fechaMaximaFlujo, setFechaMaximaFlujo] = useState(null);
  const [cabeceraIdGenerado, setCabeceraIdGenerado] = useState(null); 
  const [totalSi, setTotalSi] = useState(0);
  const [totalNo, setTotalNo] = useState(0);
  const [totalMontoSeleccionado, setTotalMontoSeleccionado] = useState(0);

  const API_URL = ''; 

  const cargarDatos = async () => {
    try {
      const token = await LlamadosApis.ObtenerToken();
      try {
        const fechaMaxima = await LlamadosApis.obtenerFechaMaxima(token);
        setFechaMaximaFlujo(fechaMaxima);
      } catch (errorFechaMaxima) {
        setOpenAlertaErrorApi(true);
        console.error('Error al obtener la Fecha Máxima:', errorFechaMaxima);
      }
    } catch (errorToken) {
      setOpenAlertaErrorApi(true);
      console.error('Error al Obtener Token:', errorToken);
    }
  };
  
  useEffect(() => {
    cargarDatos();
    const totalSiCount = rows.filter((row) => row.Encontrado === "Si").length;
    const totalNoCount = rows.filter((row) => row.Encontrado === "NO").length;
    setTotalSi(totalSiCount);
    setTotalNo(totalNoCount);
  }, [rows]);

  const columns = [
    { field: 'ID',                                        headerAlign: 'center',    headerName: 'Id.', width: 80 , align: 'center' },
    { field: 'Encontrado',                                headerAlign: 'center',    headerName: '¿Encontrado?', width: 140 , align: 'center'},
    { field: 'Sap_SocDocCta',                             headerAlign: 'center',    headerName: 'Soc+Documento+Cuenta', width: 220 , align: 'center'},
    { field: 'Sap_Sociedad',              type: 'number', headerAlign: 'center',    headerName: 'Sociedad', width: 130 , align: 'center'},
    { field: 'Sap_DescripcionSociedad',                   headerAlign: 'left',      headerName: 'Descripción Sociedad', width: 250 },
    { field: 'Sap_NombreUsuario',                         headerAlign: 'left',      headerName: 'Usuario', width: 150 },
    { field: 'Sap_NroDocumento',                          headerAlign: 'center',    headerName: 'Nº Documento', width: 150 , align: 'center'},
    { field: 'Sap_FechaContabilizacion',  type: 'date',   headerAlign: 'center',    headerName: 'F. Contabilizado', width: 150 , align: 'center' ,valueGetter: (params) => ManejoDatosGrillaMaterialUi.parseDate(params.value),},
    { field: 'Sap_Cuenta',                                headerAlign: 'center',    headerName: 'Cuenta', width: 100, align: 'center'},
    { field: 'Sap_Clase',                                 headerAlign: 'center',    headerName: 'Clase', width: 100 , align: 'center'},
    { field: 'Sap_Referencia',                            headerAlign: 'center',    headerName: 'Referencia', width: 200 , align: 'center'},
    { field: 'Sap_Rut',                                   headerAlign: 'center',    headerName: 'Rut', width: 120,align: 'center'},
    { field: 'Sap_Nombre',                                headerAlign: 'left',      headerName: 'Nombre', width: 200,align: 'left'},
    { field: 'Sap_Monto',               type: 'number',   headerAlign: 'center',    headerName: 'Monto', width: 150,align: 'right', valueFormatter: (params) => {   return params.value.toLocaleString('en-US'); }, },
    { field: 'Sap_Texto',                                 headerAlign: 'left',      headerName: 'Texto', width: 250,align: 'left'},
    { field: 'Sap_IndicadorCME',                          headerAlign: 'center',    headerName: 'Indicador CME', width: 140,align: 'center'},
    { field: 'Sap_Asignacion',                            headerAlign: 'center',    headerName: 'Asignación', width: 200,align: 'center'},
    { field: 'Sap_Periodo',                               headerAlign: 'center',    headerName: 'Periodo', width: 100,align: 'center'},
    { field: 'Sap_Ano',                                   headerAlign: 'center',    headerName: 'Año', width: 100,align: 'center'},
    { field: 'Sap_Estado',                                headerAlign: 'left',      headerName: 'Estado', width: 200 , align: 'left'},
    { field: 'Sap_Comentario1',                           headerAlign: 'left',      headerName: 'Comentario1', width: 300 , align: 'left'},
    { field: 'Sap_Comentario2',                           headerAlign: 'left',      headerName: 'Comentario2', width: 300 , align: 'left'},
    { field: 'Sap_Comentario3',                           headerAlign: 'left',      headerName: 'Comentario3', width: 300 , align: 'left'},
    { field: 'Sap_Contabilizada',                         headerAlign: 'left',      headerName: 'Contabilizada', width: 300 , align: 'center'},
    { field: 'CORREO_SOLICITANTE',                        headerAlign: 'left',      headerName: 'Correo Solicitante', width: 250 , align: 'left'},
  ];

  const getRowId = (row) => row.ID;

  const handleFileUpload = async (e) => {
    const token = await LlamadosApis.ObtenerToken();
    const file = e.target.files[0];
    setProcessing(true);
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
    
        // Obtener los datos desde la fila 1
        const range = XLSX.utils.decode_range(sheet['!ref']);
        range.s.r = 0; // Fila 1 (0-based index)
        const dataRows = XLSX.utils.sheet_to_json(sheet, {
          range: range,
          raw: false, // Evita que los valores se interpreten como fechas
        });
        
        const batchSize = 100;
        const totalRows = dataRows.length;
        const updatedRows = [];
  
        for (let i = 0; i < totalRows; i += batchSize) {
          const batch = dataRows.slice(i, i + batchSize);
    
          const batchResults = await Promise.all(
            batch.map(async (row, index) => {
              const updatedRow = {
                ID: index + 1 + i, // Comenzar desde 1 en lugar de nextId
                Sap_SocDocCta                       : row['Soc+Documento+Cuenta'],
                Sap_Sociedad                        : ManejoDatosExcel.formatDecimal(row['Sociedad']),
                Sap_DescripcionSociedad             : row['Descripción Sociedad'],
                Sap_NombreUsuario                   : row['Nombre del usuario'],
                Sap_NroDocumento                    : row['Nº documento'],
                Sap_FechaContabilizacion            : row['Fe. contabilización'] ? ManejoDatosExcel.IntercalaDiaMes(row['Fe. contabilización']) : null,
                Sap_Cuenta                          : row['Cuenta'],
                Sap_Clase                           : row['Clase de documento'],
                Sap_Referencia                      : row['Referencia'],
                Sap_Rut                             : row['Número RUT'],
                Sap_Nombre                          : row['Nombre 1'], 
                Sap_Monto                           : ManejoDatosExcel.formatDecimal(row['Importe en moneda doc.']),
                Sap_Texto                           : row['Texto'], 
                Sap_IndicadorCME                    : row['Indicador CME'], 
                Sap_Asignacion                      : row['Asignación'],
                Sap_Periodo                         : row['Periodo'],
                Sap_Ano                             : ManejoDatosExcel.formatDecimal(row['Año']),
                Sap_Estado                          : row['18 Estado solicitud'],
                Sap_Comentario1                     : row['19 comentario'],
                Sap_Comentario2                     : row['20 comentario'],
                Sap_Comentario3                     : row['21 comentario'],
                Sap_Contabilizada                   : row['22 Contabilizada'],
              };
  
              updatedRow.Encontrado="NO";
              
              if (row['Referencia'] !== undefined && /^\d+$/.test(row['Referencia'].trim())) {
                console.log('Así está la referencia: '+ row['Referencia'] + '**')
                await LlamadosApis.DevolverCorreo( token, row, updatedRow, 0);
              }
              return updatedRow;
            })
          );
    
          updatedRows.push(...batchResults);
          
          // Pausa de 1 segundo entre bloques de solicitudes
          if (i + batchSize < totalRows) {
            //console.log('***************gianni voy por: '+i+' '+batchSize +' '+totalRows)
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        }
    
        // Actualiza 'rows' con los datos modificados que incluyen el campo 'CORREO_SOLICITANTE'
        setRows(updatedRows);
        setopenAlertaCargarGrilla(true);
        setProcessing(false);
      };
    
      reader.readAsArrayBuffer(file);
    }
  };
  
  const handleProcesarDatos = async () => {
    try {
      if (rowSelectionModel.length === 0) {
        setOpenAlertaError(true);
        return;
      }
      setProcessing(true);

      
      // Llama a obtenerToken para obtener el token
      const token = await LlamadosApis.ObtenerToken();

      const horaActual = new Date();
      const mes = horaActual.getMonth() + 1;

      if (mes >= 4 && mes < 9) {
        horaActual.setHours(horaActual.getHours() - 4); // Restar 4 horas en invierno
      } else {
        horaActual.setHours(horaActual.getHours() - 3); // Restar 3 horas en verano
      }

      const dataToCreateCabecera = {
        "FechaSubida": horaActual,
        "NickSubida": textoNick,
        "NombreUsuarioSubida": NombreUsuario
      };

      const generatedCabeceraId = await LlamadosApis.CrearSapCabecera( token, dataToCreateCabecera);
      setCabeceraIdGenerado(generatedCabeceraId);

      const recordsToInsert = [];
      const batchSize = 100; // Tamaño del lote
      
      // Dividir los registros en lotes de 100
      for (let i = 0; i < rowSelectionModel.length; i += batchSize) {
        const batchSelection = rowSelectionModel.slice(i, i + batchSize);
        const batch = batchSelection.map((selectedRowId) => {
          const selectedRow = rows.find((row) => row.ID === selectedRowId);

          return {
            //ID: selectedRow.ID,
            Cabecera_Id                           : generatedCabeceraId,
            Sap_SocDocCta                         : selectedRow.Sap_SocDocCta,
            Sap_Sociedad                          : selectedRow.Sap_Sociedad,
            Sap_DescripcionSociedad               : selectedRow.Sap_DescripcionSociedad,
            Sap_NombreUsuario                     : selectedRow.Sap_NombreUsuario,
            Sap_NroDocumento                      : selectedRow.Sap_NroDocumento,
            Sap_FechaContabilizacion              : ManejoDatosExcel.formatoFechaSQL(selectedRow.Sap_FechaContabilizacion),
            Sap_Cuenta                            : selectedRow.Sap_Cuenta,
            Sap_Clase                             : selectedRow.Sap_Clase,
            Sap_Referencia                        : selectedRow.Sap_Referencia,
            Sap_Rut                               : selectedRow.Sap_Rut,
            Sap_Nombre                            : selectedRow.Sap_Nombre,
            Sap_Monto                             : selectedRow.Sap_Monto,
            Sap_Texto                             : selectedRow.Sap_Texto,
            Sap_IndicadorCME                      : selectedRow.Sap_IndicadorCME,
            Sap_Asignacion                        : selectedRow.Sap_Asignacion,
            Sap_Periodo                           : selectedRow.Sap_Periodo,
            Sap_Ano                               : selectedRow.Sap_Ano,
            Sap_Estado                            : selectedRow.Sap_Estado,
            Sap_Comentario1                       : selectedRow.Sap_Comentario1,
            Sap_Comentario2                       : selectedRow.Sap_Comentario2,
            Sap_Comentario3                       : selectedRow.Sap_Comentario3,
            Sap_Contabilizada                     : selectedRow.Sap_Contabilizada,
            Sap_CorreoSolicitante                 : selectedRow.CORREO_SOLICITANTE,
          };
        });
        recordsToInsert.push(...batch);
        try {
          await LlamadosApis.SubirSapDetalle(token, batch);
        } catch (error) {
          setOpenAlertaErrorApi(true);
          console.error('Error al enviar datos:', error);
        }
      }
      
      const dataToCreateCorreos = {
        "Cabecera_Id": generatedCabeceraId,
        "Correo_Revisor": props.CorreoUsuario,
        "Correo_Supervisor": props.CorreoSupervisor
      };

      try {
        
        const CodigoRetornoApiCabecera = await LlamadosApis.CrearCorreosParaCabecera(token, dataToCreateCorreos);
        if(CodigoRetornoApiCabecera!== 1){
          setOpenAlertaErrorApi(true);
          console.error('Error al Crearse los Correos para la Cabecera:', CodigoRetornoApiCabecera);
        }
      } catch (error) {
        setOpenAlertaErrorApi(true);
        console.error('Error al enviar datos:', error);
      }
      setOpenAlertaImportarDatosNube(true);
    } catch (error) {
      setOpenAlertaErrorApi(true);
      console.error('Error al enviar datos:', error);
    } finally {
      setProcessing(false); // Deshabilita el estado "processing" al final del proceso, independientemente de si hubo un error o no
      setRowSelectionModel([]);
    }
  };

  const handleExportarAexcel = () => {
    const selectedRowsData = rows.filter((row) =>
      rowSelectionModel.includes(row.ID)
    );

    if (rowSelectionModel.length === 0) {
      console.error('No se han seleccionado filas para procesar.');
      setOpenAlertaError(true); // Mostrar alerta de error
      return;
    }

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(selectedRowsData);
    //ws['!cols'] = [{ width: 10 }, { width: 20 }, { width: 100 }];
    XLSX.utils.book_append_sheet(wb, ws, 'Datos Seleccionados');
    const fileName = 'ArchivoMío.xlsx';
    XLSX.writeFile(wb, fileName);
    setOpenAlertaExcel(true);
  };

  const handleRowSelectionModelChange = (newRowSelectionModel) => {
    setRowSelectionModel(newRowSelectionModel);
    // Calcular el total del monto seleccionado
    const selectedRowsData = rows.filter((row) =>
      newRowSelectionModel.includes(row.ID)
    );
    const totalMonto = selectedRowsData.reduce(
      (total, row) => total + row.Sap_Monto, 0
    );
    setTotalMontoSeleccionado(totalMonto);
  };
  
  return (
    <div style={{ marginLeft: '15px', marginRight: '15px' , background: 'white' }}>
      <h1 style={{ marginTop: '20px', marginBottom: '40px' }}>
        Subir información de Sap 
      </h1>
      <h4 style={{ marginTop: '0px', marginBottom: '40px' }}>
        {fechaMaximaFlujo === '1753-01-01'
          ? 'No hay datos cargados en las tablas'
          : `Los datos se encuentran actualizados al ${fechaMaximaFlujo}`}
      </h4>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Input
          type="file"
          accept=".xlsx"
          onChange={handleFileUpload}
          id="file-upload-input" // Agrega un ID al input
          style={{ display: 'none' }} // Oculta el input
        />
        <label htmlFor="file-upload-input">
          <Button
            variant="contained"
            color="primary"
            component="span" 
            disabled={processing}
          >
            {rows.length === 0
              ? 'Cargar archivo Sap'
              : `Archivo cargado: ${rows.length} filas`}
          </Button>
          <Snackbar
            open={openAlertaCargarGrilla}
            autoHideDuration={3000}
            onClose={() => setopenAlertaCargarGrilla(false)}
            message="Se han importado a la Grilla los datos del Excel seleccionado..."
            anchorOrigin={{
              vertical: 'center',
              horizontal: 'center',
            }}
            ContentProps={{
              style: {
                marginLeft: '-10px'
              },
            }}
          />
        </label>
        <Button
          variant="contained"
          color="primary"
          onClick={handleExportarAexcel}
          disabled={rows.length === 0}
        >
          Exportar a Excel
        </Button>
      </Box>
      <Snackbar
        open={openAlertaExcel}
        autoHideDuration={3000}
        onClose={() => setOpenAlertaExcel(false)}
        message="Se han exportado los datos seleccionados a Excel..."
        anchorOrigin={{
          vertical: 'center',
          horizontal: 'center',
        }}
        ContentProps={{
          style: {
            marginLeft: '-10px'
          },
        }}
      />
      <Snackbar
        open={openAlertaError}
        autoHideDuration={3000}
        onClose={() => setOpenAlertaError(false)}
        message="No se han seleccionado registros. Acción inválida."
        anchorOrigin={{
          vertical: 'center',
          horizontal: 'center',
        }}
        ContentProps={{
          style: {
            backgroundColor: 'red',
            color: 'white',
            marginLeft: '-10px'
          },
        }}
      />
      <div style={{ marginTop: '5px' }}>
        <div
          className="custom-data-grid-container"
          style={{ height: '500px', width: '100%' }}
        >
          <DataGrid
            rows={rows}
            columns={columns}
            checkboxSelection
            onRowSelectionModelChange={handleRowSelectionModelChange}
            rowSelectionModel={rowSelectionModel}
            getRowHeight={() => 'auto'}
            resizable
            className="custom-data-grid"
            getRowId={getRowId}
            localeText={{
              noRowsLabel: 'No hay filas para mostrar',
              MuiTablePagination: {
                labelDisplayedRows: ({ from, to, count }) => {
                  const spaces1 = '\u00A0'.repeat(20); 
                  const spaces2 = '\u00A0'.repeat(20);
                  return (
                    <div>
                      <span style={{ color: '#1976D2' , textShadow: '0.25px 0 0 #1976D2, 0 0.25px 0 #1976D2, -0.25px 0 0 #1976D2, 0 -0.25px 0 #1976D2' }}>
                      Monto Seleccionado: $ {totalMontoSeleccionado.toLocaleString('en-US')}
                      {spaces1}
                      Encontrados: {totalSi} / NO Encontrados: {totalNo}
                      </span>
                      {spaces2}
                      {from} - {to} de un total de {count}
                      
                    </div>
                  );
                },
                //más configuraciones...
              },
            }}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 100 },
              },
            }}
            pageSizeOptions={[]}

          />
        </div>
      </div>
      <Button
        variant="contained"
        color="primary"
        onClick={handleProcesarDatos}
        style={{ marginTop: '20px' , marginBottom: '20px' }}
        disabled={processing}
      >
      Procesar Datos
      </Button>
      <Snackbar
        open={OpenAlertaImportarDatosNube}
        autoHideDuration={3000}
        onClose={() => setOpenAlertaImportarDatosNube(false)}
        message="Se han exportado los datos seleccionados a la Nube..."
        anchorOrigin={{
          vertical: 'center', // Centra verticalmente
          horizontal: 'center', // Centra horizontalmente
        }}
        ContentProps={{
          style: {
            marginLeft: '-10px'
          },
        }}
      />
      <Snackbar
        open={openAlertaError}
        autoHideDuration={3000}
        onClose={() => setOpenAlertaError(false)}
        message="No se han seleccionado registros. Acción inválida."
        anchorOrigin={{
          vertical: 'center', // Centra verticalmente
          horizontal: 'center', // Centra horizontalmente
        }}
        ContentProps={{
          style: {
            backgroundColor: 'red',
            color: 'white',
            marginLeft: '-10px'
          },
        }}
      />
      <Snackbar
        open={openAlertaErrorApi}
        autoHideDuration={3000}
        onClose={() => setOpenAlertaErrorApi(false)}
        message="Error en Api. Consultar a T.I."
        ContentProps={{
          style: {
            backgroundColor: 'red',
            color: 'white',
            marginLeft: '-10px'
          },
        }}
      />
    </div>
  );
};

export default SubirSolicitudesSap;