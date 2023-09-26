//Real...
//Esto tiene que cargar una grilla y si se confirma llevarse la data seleccionada a la nube...

import React, { useState , useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Button, Snackbar, Input, Box } from '@mui/material';
import * as XLSX from 'xlsx';
import { format } from 'date-fns'; // Importa la función format de date-fns
import '../hojas-de-estilo/MantenedorExcels.css';

const SubirSolicitudesSap = (props) => {
  const {textoNick, NombreUsuario , CodPerfil} = props;
  const [openAlertaExcel, setOpenAlertaExcel] = useState(false);
  const [OpenAlertaImportarDatosNube, setOpenAlertaImportarDatosNube] = useState(false);
  const [openAlertaCargarGrilla, setopenAlertaCargarGrilla] = useState(false);
  const [openAlertaError, setOpenAlertaError] = useState(false);
  const [openAlertaErrorApi, setOpenAlertaErrorApi] = useState(false);
  const [rowSelectionModel, setRowSelectionModel] = useState([]);
  const [rows, setRows] = useState([]);
  const [token, setToken] = useState('');
  const [processing, setProcessing] = useState(false);
  const [fechaMaximaFlujo, setFechaMaximaFlujo] = useState(null);
  const [cabeceraIdGenerado, setCabeceraIdGenerado] = useState(null); 
  const [totalSi, setTotalSi] = useState(0);
  const [totalNo, setTotalNo] = useState(0);
  const [totalMontoSeleccionado, setTotalMontoSeleccionado] = useState(0);



  const API_URL = ''; 

  const obtenerToken = async () => {
    try {
      const tokenResponse = await fetch(`${API_URL}/api/ObtenerToken`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'User_UCP',
          password: 'Cobranz@s_UCP.2023',
        }),
      });

      if (!tokenResponse.ok) {
        console.error('Error al obtener el token:', tokenResponse.statusText);
        throw new Error('Error al obtener el token');
      }

      const tokenData = await tokenResponse.json();
      return tokenData.token;
    } catch (error) {
      console.error('Error al obtener el token:', error);
      throw error;
    }
  };

  // En tu componente
  const obtenerFechaMaxima = async () => {
    try {
      const token = await obtenerToken();
      const response = await fetch(`${API_URL}/api/Flujo/ObtenerMaximaFecha`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Verifica que 'maxFechaInicio' esté presente en la respuesta
        if (data.maxFechaInicio) {
          setFechaMaximaFlujo(data.maxFechaInicio);
        } else {
          console.error('La respuesta de la API no contiene maxFechaInicio:', data);
        }
      } else {
        console.error('Error al obtener la fecha máxima:', response.statusText);
      }
    } catch (error) {
      console.error('Error al obtener la fecha máxima:', error);
    }
  };

  // Utiliza useEffect para llamar a la función cuando se monta el componente
  useEffect(() => {
    obtenerFechaMaxima();
    const totalSiCount = rows.filter((row) => row.Encontrado === "Si").length;
    const totalNoCount = rows.filter((row) => row.Encontrado === "NO").length;

    // Actualiza los estados de los totales
    setTotalSi(totalSiCount);
    setTotalNo(totalNoCount);
  }, [rows]);

  // Función para parsear una cadena de fecha en formato 'dd/mm/yyyy' a un objeto Date
  function parseDate(value) {
    if (value) {
      const parts = value.split('/');
      if (parts.length === 3) {
        const year = parseInt(parts[2]);
        const fullYear = (year < 1000) ? (2000 + year) : year;
        const month = parseInt(parts[1]) - 1;
        const day = parseInt(parts[0]);
        return new Date(fullYear, month, day);
      }
    }
    return null;
  }

  const columns = [
    { field: 'ID',                                        headerAlign: 'center',    headerName: 'Id.', width: 80 , align: 'center' },
    { field: 'Encontrado',                                headerAlign: 'center',    headerName: '¿Encontrado?', width: 140 , align: 'center'},
    { field: 'Sap_SocDocCta',                             headerAlign: 'center',    headerName: 'Soc+Documento+Cuenta', width: 220 , align: 'center'},
    { field: 'Sap_Sociedad',              type: 'number', headerAlign: 'center',    headerName: 'Sociedad', width: 130 , align: 'center'/*, valueFormatter: (params) => {   return params.value.toLocaleString('en-US'); }, */},
    { field: 'Sap_DescripcionSociedad',                   headerAlign: 'left',      headerName: 'Descripción Sociedad', width: 250 },
    { field: 'Sap_NombreUsuario',                         headerAlign: 'left',      headerName: 'Usuario', width: 150 },
    { field: 'Sap_NroDocumento',                          headerAlign: 'center',    headerName: 'Nº Documento', width: 150 , align: 'center'},
    { field: 'Sap_FechaContabilizacion',  type: 'date',   headerAlign: 'center',    headerName: 'F. Contabilizado', width: 150 , align: 'center' ,valueGetter: (params) => parseDate(params.value),},
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
    { field: 'Sap_Ano',                                   headerAlign: 'center',    headerName: 'Año', width: 100,align: 'center' /*, valueFormatter: (params) => {   return params.value.toLocaleString('en-US'); }, */},
    { field: 'Sap_Estado',                                headerAlign: 'left',      headerName: 'Estado', width: 200 , align: 'left'},
    { field: 'Sap_Comentario1',                           headerAlign: 'left',      headerName: 'Comentario1', width: 300 , align: 'left'},
    { field: 'Sap_Comentario2',                           headerAlign: 'left',      headerName: 'Comentario2', width: 300 , align: 'left'},
    { field: 'Sap_Comentario3',                           headerAlign: 'left',      headerName: 'Comentario3', width: 300 , align: 'left'},
    { field: 'Sap_Contabilizada',                         headerAlign: 'left',      headerName: 'Contabilizada', width: 300 , align: 'center'},
    { field: 'CORREO_SOLICITANTE',                        headerAlign: 'left',      headerName: 'Correo Solicitante', width: 250 , align: 'left'},
  ];

  const getRowId = (row) => row.ID;

  function formatDecimal(value) {
    // Verificar si el valor es una cadena
    if (typeof value === 'string') {
      // Eliminar todas las comas
      const cleanedValue = value.replace(/,/g, '');
      // Reemplazar el primer punto por un punto decimal (si existe)
      const formattedValue = cleanedValue.replace('.', ',').replace(/\.(?=\d)/g, '');
      // Reemplazar la coma decimal por un punto decimal
      const numericValue = parseFloat(formattedValue.replace(',', '.'));
      // Verificar si el valor es un número válido
      if (!isNaN(numericValue)) {
        return numericValue;
      }
    }
     // Si no se pudo convertir a número, retornar NaN o el valor original
    return NaN;
  }

  
  
  
  function IntercalaDiaMes(fecha) {
    const parts = fecha.split('/');
    if (parts.length === 3) {
      // Intercambiar el día y el mes y devolver la nueva fecha
      return parts[1] + '/' + parts[0] + '/' + parts[2];
    }
    // Si no tiene el formato esperado, dejarla sin cambios
    return fecha;
  }

  const handleFileUpload = async (e) => {
    const token = await obtenerToken();
    const file = e.target.files[0];
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
        
        const updatedRows = await Promise.all(
          dataRows.map(async (row, index) => {
            const updatedRow = {
              ID: index + 1, // Comenzar desde 1 en lugar de nextId
              Sap_SocDocCta                       : row['Soc+Documento+Cuenta'],
              Sap_Sociedad                        : formatDecimal(row['Sociedad']),
              Sap_DescripcionSociedad             : row['Descripción Sociedad'],
              Sap_NombreUsuario                   : row['Nombre del usuario'],
              Sap_NroDocumento                    : row['Nº documento'],
              Sap_FechaContabilizacion            : row['Fe. contabilización'] ? IntercalaDiaMes(row['Fe. contabilización']) : null,
              Sap_Cuenta                          : row['Cuenta'],
              Sap_Clase                           : row['Clase de documento'],
              Sap_Referencia                      : row['Referencia'],
              Sap_Rut                             : row['Número RUT'],
              Sap_Nombre                          : row['Nombre 1'], 
              Sap_Monto                           : formatDecimal(row['Importe en moneda doc.']),
              Sap_Texto                           : row['Texto'], 
              Sap_IndicadorCME                    : row['Indicador CME'], 
              Sap_Asignacion                      : row['Asignación'],
              Sap_Periodo                         : row['Periodo'],
              Sap_Ano                             : formatDecimal(row['Año']),
              Sap_Estado                          : row['18 Estado solicitud'],
              Sap_Comentario1                     : row['19 comentario'],
              Sap_Comentario2                     : row['20 comentario'],
              Sap_Comentario3                     : row['21 comentario'],
              Sap_Contabilizada                   : row['22 Contabilizada'],
                        
            };

            updatedRow.Encontrado="NO";
            // Realiza una solicitud a la API para obtener el correo
            // Verificar si row['Referencia'] contiene solo caracteres numéricos
            if (/^\d+$/.test(row['Referencia'].trim())) {
              try {
                const correoResponse = await fetch(`${API_URL}/api/Flujo/DevolverCorreo`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({ FOLIO: row['Referencia'].trim() }),
                });

                if (correoResponse.ok) {
                  const correoData = await correoResponse.json();
                  // Agrega el correo al objeto de la fila
                  updatedRow.CORREO_SOLICITANTE = correoData.correo;
                  updatedRow.Encontrado = correoData.correo.length > 0 ? "Si" : "NO";
                } else {
                  console.error(`Error al obtener el correo para el folio ${row['Referencia']}: ${correoResponse.statusText}`);
                }
              } catch (error) {
                console.error(`Error al obtener el correo para el folio ${row['Referencia']}: ${error}`);
              }
            } else {
              console.error(`El valor en 'Referencia' no contiene solo caracteres numéricos: ${row['Referencia']}`);
            }

            return updatedRow;
          })
        );

        // Actualiza 'rows' con los datos modificados que incluyen el campo 'CORREO_SOLICITANTE'
        setRows(updatedRows);
        setopenAlertaCargarGrilla(true);
      };
      reader.readAsArrayBuffer(file);
    }
  };
  
  // Función de utilidad para formatear fechas
  function formatFecha(fecha) {
    if (fecha && fecha.trim() !== '') {
      const fechaParts = fecha.split('/');
      return `${fechaParts[0].padStart(2, '0')}/${fechaParts[1].padStart(2, '0')}/${fechaParts[2].padStart(4, '20')}`;
    }
    return null;
  }

  const handleProcesarDatos = async () => {
    try {
      if (rowSelectionModel.length === 0) {
        setOpenAlertaError(true);
        return;
      }
      setProcessing(true);

      // Llama a obtenerToken para obtener el token
      const token = await obtenerToken();

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
        "NombreUsuarioSubida": NombreUsuario,
        "NickProcesado": "",
        "NombreUsuarioProcesado": "",
        "Procesado": 0,
        "FechaProcesado": null
      };

        const dataResponseCabecera = await fetch(`${API_URL}/api/Sap/CrearCabecera`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(dataToCreateCabecera),
        });

        if (!dataResponseCabecera.ok) {
          console.error('Error:', dataResponseCabecera.statusText);
          throw new Error('Error obtener los datos de CrearCabecera');
        }else{
          // Captura el Cabecera_Id generado en la respuesta
          const datosCabecera = await dataResponseCabecera.json();
          const generatedCabeceraId = datosCabecera.Cabecera_Id;
          // Almacena el Cabecera_Id en el estado
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
              Sap_FechaContabilizacion              : formatFecha(selectedRow.Sap_FechaContabilizacion),
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

          // Enviar el lote actual a la API
          const datosSapResponse = await fetch(
            `${API_URL}/api/Sap/SubirSapDetalle`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(batch),
            }
          );

          if (!datosSapResponse.ok) {
            console.error('Error de red:', datosSapResponse.statusText);
            setOpenAlertaErrorApi(true);
            throw new Error('Error de red al crear los datos de prueba');
          }
        }
        setOpenAlertaImportarDatosNube(true);
      }

    } catch (error) {
      setOpenAlertaErrorApi(true);
      console.error('Error al obtener datos:', error);
    } finally {
      setProcessing(false); // Deshabilita el estado "processing" al final del proceso
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
      (total, row) => total + row.Sap_Monto,
      0
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
              vertical: 'center', // Centra verticalmente
              horizontal: 'center', // Centra horizontalmente
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