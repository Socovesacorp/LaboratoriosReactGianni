//Real...
//Esto tiene que cargar una grilla y si se confirma llevarse la data seleccionada a la nube...

import React, { useState , useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Button, Snackbar, Input, Box } from '@mui/material';
import * as XLSX from 'xlsx';
import { format } from 'date-fns'; // Importa la función format de date-fns
import '../hojas-de-estilo/MantenedorExcels.css';

const SubirSolicitudesFlujo = (props) => {
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
  }, []);

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

  // Función para parsear una cadena de fecha y hora en un objeto Date
  function parseDateAndTime(value) {
    //console.log('****recibo: '+value)
    if (value) {
      const dateTimeParts = value.split(' ');
      if (dateTimeParts.length === 2) {
        const dateParts = dateTimeParts[0].split('/');
        const timePart = dateTimeParts[1];
        if (dateParts.length === 3 && timePart) {
          const year = parseInt(dateParts[2]);
          const fullYear = year < 1000 ? 2000 + year : year;
          const month = parseInt(dateParts[1]) - 1;
          const day = parseInt(dateParts[0]);
          const timeParts = timePart.split(':');
          const hours = parseInt(timeParts[0]);
          const minutes = parseInt(timeParts[1]);
          const seconds = timeParts.length > 2 ? parseInt(timeParts[2]) : 0;
          //console.log('*****aquí voy: '+new Date(fullYear, month, day, hours, minutes, seconds))
          return new Date(fullYear, month, day, hours, minutes, seconds);
        }
      }
    }
    return null;
  }



  const columns = [
    { field: 'ID',                                                           headerAlign: 'center', headerName: 'Id.', width: 80 , align: 'center' },
    { field: 'FOLIO',                                                        headerAlign: 'center', headerName: 'Folio', width: 80 , align: 'center'},
    { field: 'NOMBREAUTOMATICO_SOLICITANTE',              headerAlign: 'left', headerName: 'Solicitante', width: 300 , align: 'left'},
    { field: 'TAREA',                                                                               headerName: 'Tarea', width: 150 },
    { field: 'ESTADO',                                                                              headerName: 'Estado', width: 100 },
    { field: 'NOMBRE_BENEFICIARIO',                       headerAlign: 'left', headerName: 'Beneficiario', width: 200 , align: 'left'},
    { field: 'MONTO_SOLICITADO',        type: 'number',   headerAlign: 'right', headerName: 'Monto Solicitado', width: 200 , align: 'right' ,valueFormatter: (params) => {   return params.value.toLocaleString('en-US'); }, },
    { field: 'FECHA_INGRESO',                           type: 'date',        headerAlign: 'center', headerName: 'Fecha Ingreso', width: 150, align: 'center',   valueGetter: (params) => parseDate(params.value),},
    { field: 'FECHA_INICIO',                            type: 'date',        headerAlign: 'center', headerName: 'Fecha Inicio', width: 150 , align: 'center',   valueGetter: (params) => parseDate(params.value),},
    { field: 'FECHA_TERMINO',                           type: 'date',        headerAlign: 'center', headerName: 'Fecha Término', width: 150 , align: 'center',  valueGetter: (params) => parseDate(params.value),},
    { field: 'Aprobador_Recepcion',                     type: 'dateTime',    headerAlign: 'center', headerName: 'Aprobador Recepcionó', width: 200,align: 'center', valueGetter: (params) => parseDateAndTime(params.value),},
    
    { field: 'Aprobador_Aprobacion',                    type: 'dateTime',    headerAlign: 'center', headerName: 'Aprobador Aprobó', width: 200,align: 'center', valueGetter: (params) => parseDateAndTime(params.value),},
    { field: 'Enviado_a_Tesoreria_Recepcion',           type: 'dateTime',    headerAlign: 'center', headerName: 'Tesorería Recepcionó', width: 200,align: 'center', valueGetter: (params) => parseDateAndTime(params.value),},
    { field: 'Enviado_a_Tesoreria_Aprobacion',          type: 'dateTime',    headerAlign: 'center', headerName: 'Tesorería Aprobó', width: 200,align: 'center', valueGetter: (params) => parseDateAndTime(params.value),},
    { field: 'Pendiente_de_Rendicion_Recepcion',        type: 'dateTime',    headerAlign: 'center', headerName: 'Pendiente Rendición Recepción', width: 250,align: 'center', valueGetter: (params) => parseDateAndTime(params.value),},
    { field: 'Pendiente_de_Rendicion_Aprobacion',       type: 'dateTime',    headerAlign: 'center', headerName: 'Pendiente Rendición Aprobación', width: 280,align: 'center', valueGetter: (params) => parseDateAndTime(params.value),},
    { field: 'Cerrado_Recepcion',                       type: 'dateTime',    headerAlign: 'center', headerName: 'Cerrado Recepción', width: 200,align: 'center', valueGetter: (params) => parseDateAndTime(params.value),},
    { field: 'Cerrado_Aprobacion',                      type: 'dateTime',    headerAlign: 'center', headerName: 'Cerrado Aprobación', width: 200,align: 'center', valueGetter: (params) => parseDateAndTime(params.value),},




    { field: 'APROBADOR',                                 headerAlign: 'left', headerName: 'Aprobador', width: 300 , align: 'left'},
    { field: 'RUTAUTOMATICO_SOLICITANTE',                 headerAlign: 'center', headerName: 'Rut Automático Solicitante', width: 250 , align: 'center'},
    { field: 'CARGOAUTOMATICO_SOLICITANTE',               headerAlign: 'left', headerName: 'Cargo Automático Solicitante', width: 300 , align: 'left'},
    { field: 'EMAILAUTOMATICO_SOLICITANTE',               headerAlign: 'left', headerName: 'Correo Automático Solicitante', width: 300 , align: 'left'},
    { field: 'ANEXOAUTOMATICO_SOLICITANTE',               headerAlign: 'center', headerName: 'Anexo Automático Solicitante', width: 300 , align: 'center'},
    { field: 'TIPO_DE_SOLICITUD',                         headerAlign: 'left', headerName: 'Tipo Solicitud', width: 150 , align: 'left'},
    { field: 'TIPO_MONEDA',                               headerAlign: 'center', headerName: 'Tipo Moneda', width: 150 , align: 'center'},
    { field: 'MOTIVO_DE_SOLICITUD',                       headerAlign: 'left', headerName: 'Motivo Solicitud', width: 600 , align: 'left'},
    { field: 'FECHA_DE_RENDICION',   type: 'date',        headerAlign: 'center', headerName: 'Fecha Rendición', width: 150, align: 'center',   valueGetter: (params) => parseDate(params.value),},
    { field: 'TIPO_DE_RESPALDO',                          headerAlign: 'left', headerName: 'Tipo Respaldo', width: 200 , align: 'left'},
    { field: 'RESPALDO',                                  headerAlign: 'left', headerName: 'Respaldo', width: 200 , align: 'left'},
    { field: 'RUT_BEN',                                   headerAlign: 'center', headerName: 'Rut Beneficiario', width: 150 , align: 'center'},
    { field: 'TIPO_DE_CUENTA',                            headerAlign: 'left', headerName: 'Tipo Cuenta', width: 150 , align: 'left'},
    { field: 'N_CUENTA',                                  headerAlign: 'left', headerName: 'Número Cuenta', width: 200 , align: 'left'},
    { field: 'BANCO',                                     headerAlign: 'left', headerName: 'Banco', width: 200 , align: 'left'},
    { field: 'EMAIL_BENEFICIARIO',                        headerAlign: 'left', headerName: 'Correo Beneficiario', width: 200 , align: 'left'},
    { field: 'FECHA_PAGO',           type: 'date',        headerAlign: 'center', headerName: 'Fecha Pago', width: 150, align: 'center',   valueGetter: (params) => parseDate(params.value),},
    { field: 'EMPRESA',                                   headerAlign: 'left', headerName: 'Empresa', width: 400 , align: 'left'},
    { field: 'CENTRO_DE_COSTO',                           headerAlign: 'left', headerName: 'Centro Costo', width: 200 , align: 'left'},

    

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

  
  
  
  
  




  // Función de utilidad para formatear fechas y horas
  const formatLecturaDateTime = (dateTimeString) => {
    if (!dateTimeString) {
      return null;
    }

    const dateParts = dateTimeString.split(' ')[0].split('/'); // Separa la fecha y el tiempo
    const timePart = dateTimeString.split(' ')[1]; // Obtiene la parte del tiempo

    if (dateParts.length === 3 && timePart) {
      const timeParts = timePart.split(':'); // Separa las partes del tiempo (horas, minutos, segundos)

      // Verifica si la parte del tiempo contiene segundos
      if (timeParts.length === 3) {
        // Si hay segundos, usa la parte del tiempo tal como está
        return dateParts[1] + '/' + dateParts[0] + '/' + dateParts[2] + ' ' + timePart;
      } else {
        // Si no hay segundos, agrega ":00" a la parte del tiempo
        return dateParts[1] + '/' + dateParts[0] + '/' + dateParts[2] + ' ' + timePart + ':00';
      }
    }

    // Si no tiene el formato esperado o falta el tiempo, dejarla sin cambios
    return dateTimeString;
  };

  function IntercalaDiaMes(fecha) {
    const parts = fecha.split('/');
    if (parts.length === 3) {
      // Intercambiar el día y el mes y devolver la nueva fecha
      return parts[1] + '/' + parts[0] + '/' + parts[2];
    }
    // Si no tiene el formato esperado, dejarla sin cambios
    return fecha;
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
  
        // Obtener los datos desde la fila 5
        const range = XLSX.utils.decode_range(sheet['!ref']);
        range.s.r = 4; // Fila 5 (0-based index)
        const dataRows = XLSX.utils.sheet_to_json(sheet, {
          range: range,
          raw: false, // Evita que los valores se interpreten como fechas
        });
        //console.log(dataRows)
        // Asignar IDs autonuméricos a las filas y buscar 'FOLIO'
        const updatedRows = dataRows.map((row, index) => ({
          ID                                  : index + 1, // Comenzar desde 1 en lugar de nextId
          FOLIO                               : row['FOLIO'],
          INGRESADO_POR                       : row['INGRESADO POR'],
          FECHA_INGRESO                       : row['FECHA INGRESO'] ? IntercalaDiaMes(row['FECHA INGRESO']) : null,
          TAREA                               : row['TAREA'],
          ESTADO                              : row['ESTADO'],
          FECHA_INICIO                        : row['FECHA INICIO'] ? IntercalaDiaMes(row['FECHA INICIO']) : null,
          FECHA_TERMINO                       : row['FECHA TERMINO'] ? IntercalaDiaMes(row['FECHA TERMINO']) : null,
          Aprobador_Recepcion                 : formatLecturaDateTime(row['Aprobador Recepcion']),
          Aprobador_Aprobacion                : formatLecturaDateTime(row['Aprobador Aprobacion']),
          Enviado_a_Tesoreria_Recepcion       : formatLecturaDateTime(row['Enviado a Tesorería Recepcion']),
          Enviado_a_Tesoreria_Aprobacion      : formatLecturaDateTime(row['Enviado a Tesorería Aprobacion']), 
          Pendiente_de_Rendicion_Recepcion    : formatLecturaDateTime(row['Pendiente de Rendición Recepcion']),
          Pendiente_de_Rendicion_Aprobacion   : formatLecturaDateTime(row['Pendiente de Rendición Aprobacion']), 
          Cerrado_Recepcion                   : formatLecturaDateTime(row['Cerrado Recepcion']), 
          Cerrado_Aprobacion                  : formatLecturaDateTime(row['Cerrado Aprobacion']),
          APROBADOR                           : row['APROBADOR'],
          NOMBREAUTOMATICO_SOLICITANTE        : row['NOMBREAUTOMATICO_SOLICITANTE'],
          RUTAUTOMATICO_SOLICITANTE           : row['RUTAUTOMATICO_SOLICITANTE'],
          CARGOAUTOMATICO_SOLICITANTE         : row['CARGOAUTOMATICO_SOLICITANTE'],
          EMAILAUTOMATICO_SOLICITANTE         : row['EMAILAUTOMATICO_SOLICITANTE'],
          ANEXOAUTOMATICO_SOLICITANTE         : row['ANEXOAUTOMATICO_SOLICITANTE'],
          TIPO_DE_SOLICITUD                   : row['TIPO_DE_SOLICITUD'],
          TIPO_MONEDA                         : row['TIPO_MONEDA'],
          MOTIVO_DE_SOLICITUD                 : row['MOTIVO_DE_SOLICITUD'],
          FECHA_DE_RENDICION                  : row['FECHA_DE_RENDICION'] ? IntercalaDiaMes(row['FECHA_DE_RENDICION']) : null,
          TIPO_DE_RESPALDO                    : row['TIPO_DE_RESPALDO'],
          RESPALDO                            : row['RESPALDO'],
          NOMBRE_BENEFICIARIO                 : row['NOMBRE_BENEFICIARIO'],
          RUT_BEN                             : row['RUT_BEN'],
          TIPO_DE_CUENTA                      : row['TIPO_DE_CUENTA'],
          N_CUENTA                            : row['N_CUENTA'],
          BANCO                               : row['BANCO'],
          EMAIL_BENEFICIARIO                  : row['EMAIL_BENEFICIARIO'],
          FECHA_PAGO                          : row['FECHA_PAGO'] ? IntercalaDiaMes(row['FECHA_PAGO']) : null,
          EMPRESA                             : row['EMPRESA'],
          CENTRO_DE_COSTO                     : row['CENTRO_DE_COSTO'],
          MONTO_SOLICITADO                    : formatDecimal(row['MONTO_SOLICITADO']),


          
           
        }));
        setRows(updatedRows); // Actualiza rows con los datos modificados
        setopenAlertaCargarGrilla(true);
      };
      reader.readAsArrayBuffer(file);
    }
  };
  
  // Función para formatear fechas y horas
  function formatDateTime(dateTimeString) {
    if (!dateTimeString || dateTimeString.trim() === '') {
      return null;
    }
    const dateTimeParts = dateTimeString.split(' ');
    if (dateTimeParts.length !== 2) {
      return null;
    }
    const [fechaPart, horaPart] = dateTimeParts;
    const fechaParts = fechaPart.split('/');
    const horaParts = horaPart.split(':');
    if (fechaParts.length !== 3 || horaParts.length < 2) {
      return null;
    }
    const year = parseInt(fechaParts[2]);
    const fullYear = year < 1000 ? 2000 + year : year;
    const month = parseInt(fechaParts[1]) - 1;
    const day = parseInt(fechaParts[0]);
    const hours = parseInt(horaParts[0]);
    const minutes = parseInt(horaParts[1]);
    const seconds = horaParts.length > 2 ? parseInt(horaParts[2]) : 0;
    return `${day.toString().padStart(2, '0')}/${(month + 1).toString().padStart(2, '0')}/${fullYear} ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

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
  
      const recordsToInsert = [];
      const batchSize = 100; // Tamaño del lote
  
      // Dividir los registros en lotes de 100
      for (let i = 0; i < rowSelectionModel.length; i += batchSize) {
        const batchSelection = rowSelectionModel.slice(i, i + batchSize);
        const batch = batchSelection.map((selectedRowId) => {
          const selectedRow = rows.find((row) => row.ID === selectedRowId);

          return {
          //ID: selectedRow.ID,
          nickSubidoPor                         : textoNick,
          usuarioSubidoPor                      : NombreUsuario,
          fechaHoraSubido                       : horaActual,
          FOLIO                                 : selectedRow.FOLIO,
          INGRESADO_POR                         : selectedRow.INGRESADO_POR,
          FECHA_INGRESO                         : formatFecha(selectedRow.FECHA_INGRESO),
          TAREA                                 : selectedRow.TAREA,
          ESTADO                                : selectedRow.ESTADO,
          FECHA_INICIO                          : formatFecha(selectedRow.FECHA_INICIO),
          FECHA_TERMINO                         : formatFecha(selectedRow.FECHA_TERMINO),
          Aprobador_Recepcion                   : formatDateTime(selectedRow.Aprobador_Recepcion),

          Aprobador_Aprobacion                  : formatDateTime(selectedRow.Aprobador_Aprobacion),
          Enviado_a_Tesoreria_Recepcion         : formatDateTime(selectedRow.Enviado_a_Tesoreria_Recepcion),
          Enviado_a_Tesoreria_Aprobacion        : formatDateTime(selectedRow.Enviado_a_Tesoreria_Aprobacion),
          Pendiente_de_Rendicion_Recepcion      : formatDateTime(selectedRow.Pendiente_de_Rendicion_Recepcion),
          Pendiente_de_Rendicion_Aprobacion     : formatDateTime(selectedRow.Pendiente_de_Rendicion_Aprobacion),
          Cerrado_Recepcion                     : formatDateTime(selectedRow.Cerrado_Recepcion),
          Cerrado_Aprobacion                    : formatDateTime(selectedRow.Cerrado_Aprobacion),


          APROBADOR                             : selectedRow.APROBADOR,
          NOMBREAUTOMATICO_SOLICITANTE          : selectedRow.NOMBREAUTOMATICO_SOLICITANTE,
          RUTAUTOMATICO_SOLICITANTE             : selectedRow.RUTAUTOMATICO_SOLICITANTE,
          CARGOAUTOMATICO_SOLICITANTE           : selectedRow.CARGOAUTOMATICO_SOLICITANTE,
          EMAILAUTOMATICO_SOLICITANTE           : selectedRow.EMAILAUTOMATICO_SOLICITANTE,
          ANEXOAUTOMATICO_SOLICITANTE           : selectedRow.ANEXOAUTOMATICO_SOLICITANTE,
          TIPO_DE_SOLICITUD                     : selectedRow.TIPO_DE_SOLICITUD,
          TIPO_MONEDA                           : selectedRow.TIPO_MONEDA,
          MOTIVO_DE_SOLICITUD                   : selectedRow.MOTIVO_DE_SOLICITUD,
          FECHA_DE_RENDICION                    : formatFecha(selectedRow.FECHA_DE_RENDICION),
          TIPO_DE_RESPALDO                      : selectedRow.TIPO_DE_RESPALDO,
          RESPALDO                              : selectedRow.RESPALDO,
          NOMBRE_BENEFICIARIO                   : selectedRow.NOMBRE_BENEFICIARIO,
          RUT_BEN                               : selectedRow.RUT_BEN,
          TIPO_DE_CUENTA                        : selectedRow.TIPO_DE_CUENTA,
          N_CUENTA                              : selectedRow.N_CUENTA,
          BANCO                                 : selectedRow.BANCO,
          EMAIL_BENEFICIARIO                    : selectedRow.EMAIL_BENEFICIARIO,
          FECHA_PAGO                            : formatFecha(selectedRow.FECHA_PAGO),
          EMPRESA                               : selectedRow.EMPRESA,
          CENTRO_DE_COSTO                       : selectedRow.CENTRO_DE_COSTO,
          MONTO_SOLICITADO                      : selectedRow.MONTO_SOLICITADO,
        };
      });
      recordsToInsert.push(...batch);

      // Enviar el lote actual a la API
      const datosPruebaResponse = await fetch(
        `${API_URL}/api/Flujo/SubirSolicitudes`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(batch),
        }
      );

      if (!datosPruebaResponse.ok) {
        console.error('Error de red:', datosPruebaResponse.statusText);
        setOpenAlertaErrorApi(true);
        throw new Error('Error de red al crear los datos de prueba');
      }
    }

    setOpenAlertaImportarDatosNube(true);
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
    
  
  };
  
  
  
  
  

  return (
    <div style={{ marginLeft: '15px', marginRight: '15px' , background: 'white' }}>
      <h1 style={{ marginTop: '20px', marginBottom: '40px' }}>
        Subir información de Solicitudes 
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
              ? 'Cargar archivo Flujo'
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
                  const spaces = '\u00A0'.repeat(50); // Utiliza el carácter especial para espacio no rompible
                  return (
                    <div>
                      {/*Monto Seleccionado: {totalMontoSeleccionado}*/}
                      {spaces}
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

export default SubirSolicitudesFlujo;