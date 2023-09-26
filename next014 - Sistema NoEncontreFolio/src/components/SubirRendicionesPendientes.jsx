
//Eliminar...
//Esto tiene que cargar una grilla y si se confirma llevarse la data seleccionada a la nube...

import React, { useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Button, Snackbar, Input, Box } from '@mui/material';
import * as XLSX from 'xlsx';
import { format } from 'date-fns'; // Importa la función format de date-fns
import '../hojas-de-estilo/MantenedorExcels.css';

const SubirRendicionesPendientes = (props) => {
  const {textoNick, NombreUsuario , CodPerfil} = props;
  const [openAlertaExcel, setOpenAlertaExcel] = useState(false);
  const [OpenAlertaImportarDatosNube, setOpenAlertaImportarDatosNube] = useState(false);
  const [openAlertaCargarGrilla, setopenAlertaCargarGrilla] = useState(false);
  const [openAlertaError, setOpenAlertaError] = useState(false);
  const [rowSelectionModel, setRowSelectionModel] = useState([]);
  const [rows, setRows] = useState([]);
  const [token, setToken] = useState('');
  const [cabeceraIdGenerado, setCabeceraIdGenerado] = useState(null); 
  const [processing, setProcessing] = useState(false);
  const [totalMontoSeleccionado, setTotalMontoSeleccionado] = useState(0);

  const API_URL = ''; 

  const columns = [
    { field: 'ID', headerAlign: 'center', headerName: <span style={{ fontWeight: 'bold', color: '#1976D2' }}>ID</span>, width: 50 , align: 'center' },
    { field: 'SolCheq_Sociedad', headerAlign: 'center', headerName: <span style={{ fontWeight: 'bold', color: '#1976D2' }}>SOCIEDAD</span>, width: 100 , align: 'center'},
    { field: 'SolCheq_NroSolicitud', headerAlign: 'center', headerName: <span style={{ fontWeight: 'bold', color: '#1976D2' }}>N°SOL.</span>, width: 80 , align: 'center'},
    { field: 'SolCheq_FechaAprobacion', headerAlign: 'center', headerName: <span style={{ fontWeight: 'bold', color: '#1976D2' }}>FECHA APROBACIÓN</span>, width: 180 , align: 'center'},
    { field: 'SolCheq_FechaDicitacion', headerAlign: 'center', headerName: <span style={{ fontWeight: 'bold', color: '#1976D2' }}>FECHA DIGITACIÓN</span>, width: 180 , align: 'center'},
    { field: 'SolCheq_Solicitante', headerName: <span style={{ fontWeight: 'bold', color: '#1976D2' }}>SOLICITANTE</span>, width: 300 },
    { field: 'SolCheq_TipoFondo', headerName: <span style={{ fontWeight: 'bold', color: '#1976D2' }}>TIPO DE FONDO</span>, width: 200 },
    { field: 'SolCheq_Proveedor', headerName: <span style={{ fontWeight: 'bold', color: '#1976D2' }}>PROVEEDOR</span>, width: 300 },
    { field: 'SolCheq_Rut', headerAlign: 'center', headerName: <span style={{ fontWeight: 'bold', color: '#1976D2' }}>RUT PROVEEDOR</span>, width: 150 , align: 'center'},
    { field: 'SelCheq_Monto', headerAlign: 'right', headerName: <span style={{ fontWeight: 'bold', color: '#1976D2' }}>MONTO ($)</span>, width: 150 , align: 'right' },
    { field: 'SelCheq_NroSap', headerName: 'N°SAP', width: 150 },
    { field: 'SelCheq_EntregadoA', headerName: 'ENTREGADO A: ', width: 200 },
    { field: 'SelCheq_FechaEntrega', headerName: 'FECHA ENTREGA', width: 200 },
    { field: 'SelCheq_CorreoSolicitante', headerName: 'CORREO SOLICITANTE', width: 200 },
    { field: 'SelCheq_ControlInterno', headerName: 'CONTROL INTERNO', width: 350 },
    { field: 'SelCheq_FechaRendicion', headerName: 'FECHA RENDICIÓN ', width: 300 }
  ];

  const getRowId = (row) => row.ID;

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const excelData = XLSX.utils.sheet_to_json(sheet);
  
        // Asignar IDs autonuméricos a las filas y actualizar el estado
        const updatedRows = XLSX.utils.sheet_to_json(sheet, {
          raw: false, // Evita que los valores se interpreten como fechas
        }).map((row, index) => ({
          ID: index + 1, // Comenzar desde 1 en lugar de nextId
          SolCheq_Sociedad: row['SOCIEDAD'],
          SolCheq_NroSolicitud: row['N°SOL.'],
          SolCheq_FechaAprobacion: row['FECHA APROBACIÓN'] ? format(new Date(row['FECHA APROBACIÓN']), 'dd/MM/yyyy') : null,
          SolCheq_FechaDicitacion: row['FECHA DIGITACIÓN'] ? format(new Date(row['FECHA DIGITACIÓN']), 'dd/MM/yyyy') : null,
          SolCheq_Solicitante: row['SOLICITANTE'],
          SolCheq_TipoFondo: row['TIPO DE FONDO'],
          SolCheq_Proveedor: row['PROVEEDOR'],
          SolCheq_Rut: row['RUT PROVEEDOR'],
          SelCheq_Monto: row['MONTO ($)'],
          SelCheq_NroSap: row['N°SAP'],
          SelCheq_EntregadoA: row['ENTREGADO A: '],
          SelCheq_FechaEntrega: row['FECHA ENTREGA'] ? format(new Date(row['FECHA ENTREGA']), 'dd/MM/yyyy') : null,
          SelCheq_CorreoSolicitante: row['CORREO SOLICITANTE'],
          SelCheq_ControlInterno: row['CONTROL INTERNO'],
          SelCheq_FechaRendicion: row['FECHA RENDICIÓN '],
        }));
  
        setRows(updatedRows); // Actualiza rows con los datos modificados
        setopenAlertaCargarGrilla(true);
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
        console.error('Error de red:', tokenResponse.statusText);
        throw new Error('Error de red al obtener el token');
      }

      const tokenData = await tokenResponse.json();
      setToken(tokenData.token);

      const horaActual = new Date();
      horaActual.setHours(horaActual.getHours() - 3); 

      const dataToCreate = {
        "FechaSubida": horaActual,
        "NickSubida": textoNick,
        "NombreUsuarioSubida": NombreUsuario,
        "NickProcesado": "",
        "NombreUsuarioProcesado": "",
        "Procesado": 0,
        "FechaProcesado": null
      };

      const dataResponse = await fetch(`${API_URL}/api/Cabecera/CrearCabecera`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenData.token}`,
        },
        body: JSON.stringify(dataToCreate),
      });

      if (!dataResponse.ok) {
        console.error('Error:', dataResponse.statusText);
        throw new Error('Error obtener los datos de CrearCabecera');
      }

      // Captura el Cabecera_Id generado en la respuesta
      const datosPruebaData = await dataResponse.json();
      const generatedCabeceraId = datosPruebaData.Cabecera_Id;
      // Almacena el Cabecera_Id en el estado
      setCabeceraIdGenerado(generatedCabeceraId);

      // Recorre las filas seleccionadas y llama a la API CrearDatosPrueba para cada una
      const recordsToInsert = [];
      for (const selectedRowId of rowSelectionModel) {
        const selectedRow = rows.find((row) => row.ID === selectedRowId);
        recordsToInsert.push({
          //ID: selectedRow.ID,
          Cabecera_ID: generatedCabeceraId,
          SolCheq_Sociedad: selectedRow.SolCheq_Sociedad,
          SolCheq_NroSolicitud: selectedRow.SolCheq_NroSolicitud,
          SolCheq_FechaAprobacion: selectedRow.SolCheq_FechaAprobacion,
          SolCheq_FechaDicitacion: selectedRow.SolCheq_FechaDicitacion,
          SolCheq_Solicitante: selectedRow.SolCheq_Solicitante,
          SolCheq_TipoFondo: selectedRow.SolCheq_TipoFondo,
          SolCheq_Proveedor: selectedRow.SolCheq_Proveedor,
          SolCheq_Rut: selectedRow.SolCheq_Rut,
          SelCheq_Monto: selectedRow.SelCheq_Monto
          // SelCheq_NroSap: selectedRow.SelCheq_NroSap,
          // SelCheq_EntregadoA: selectedRow.SelCheq_EntregadoA,
          // SelCheq_FechaEntrega: selectedRow.SelCheq_FechaEntrega,
          // SelCheq_CorreoSolicitante: selectedRow.SelCheq_CorreoSolicitante,
          // SelCheq_ControlInterno: selectedRow.SelCheq_ControlInterno,
          // SelCheq_FechaRendicion: selectedRow.SelCheq_FechaRendicion


        });
      }

      // Ordena los registros por ID en orden ascendente
      recordsToInsert.sort((a, b) => a.ID - b.ID);
      
      const datosPruebaResponse = await fetch(`${API_URL}/api/Cabecera/CrearDatosSolicitudCheques`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenData.token}`,
        },
        body: JSON.stringify(recordsToInsert),
      });

      if (!datosPruebaResponse.ok) {
        console.error('Error de red:', datosPruebaResponse.statusText);
        throw new Error('Error de red al crear los datos de prueba');
      }
      
      setOpenAlertaImportarDatosNube(true);
    } catch (error) {
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
    const total = selectedRowsData.reduce((acc, row) => {
      // Aplicar la expresión regular a cada valor del monto antes de sumarlo
      const monto = parseFloat((row.SelCheq_Monto || 0).replace(/\D/g, ''));
      return acc + monto;
    }, 0);
  
    // Formatear el total con signo de dólar y separador de miles
    const totalFormateado = total.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0, // Establecer mínimo de decimales a 0
      maximumFractionDigits: 2, // Establecer máximo de decimales a 2
    });
  
    // Eliminar los decimales ".00" si existen
    const totalSinDecimales = totalFormateado.replace(/\.00$/, '');
  
    setTotalMontoSeleccionado(totalSinDecimales);
  };
  
  
  
  
  

  return (
    <div style={{ marginLeft: '15px', marginRight: '15px' }}>
      <h1 style={{ marginTop: '40px', marginBottom: '40px' }}>
        Subir información de Rendiciones Pendientes 
      </h1>
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
      />
      <Snackbar
        open={openAlertaError}
        autoHideDuration={3000}
        onClose={() => setOpenAlertaError(false)}
        message="No se han seleccionado registros. Acción inválida."
        ContentProps={{
          style: {
            backgroundColor: 'red',
            color: 'white',
          },
        }}
      />
      <div style={{ marginTop: '5px' }}>
        <div
          className="custom-data-grid-container"
          style={{ height: '300px', width: '100%' }}
        >
          <DataGrid
            rows={rows}
            columns={columns}
            checkboxSelection
            onRowSelectionModelChange={handleRowSelectionModelChange}
            rowSelectionModel={rowSelectionModel}
            getRowHeight={() => 'auto'}
            //pagination={false} // Desactivar paginación
            //pageSize={100} // Mostrar todos los registros en una página
            //hideFooterPagination
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
                      Monto Seleccionado: {totalMontoSeleccionado}
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
        style={{ marginTop: '20px' }}
        disabled={processing}
      >
      Procesar Datos
      </Button>
      <Snackbar
        open={OpenAlertaImportarDatosNube}
        autoHideDuration={3000}
        onClose={() => setOpenAlertaImportarDatosNube(false)}
        message="Se han exportado los datos seleccionados a la Nube..."
      />
      <Snackbar
        open={openAlertaError}
        autoHideDuration={3000}
        onClose={() => setOpenAlertaError(false)}
        message="No se han seleccionado registros. Acción inválida."
        ContentProps={{
          style: {
            backgroundColor: 'red',
            color: 'white',
          },
        }}
      />
    </div>
  );
};

export default SubirRendicionesPendientes;