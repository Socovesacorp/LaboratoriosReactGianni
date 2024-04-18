import React, { useState , useEffect }            from 'react';
import * as XLSX                                  from 'xlsx';
import { DataGrid }                               from '@mui/x-data-grid';
import { Button, Snackbar, Input, Box }           from '@mui/material';
import LlamadosApis                               from '../ManejarDatosApis/LlamadosApis';
import ManejoDatosExcel                           from '../ManejarDatosGrilla/ManejoDatosExcel';
import '../../hojas-de-estilo/MantenedorExcels.css';

const SubirFacturas = (props) => {
  const {textoNick, NombreUsuario , CodPerfil, CorreoUsuario} = props;
  const [openAlertaOK, setOpenAlertaOK] = useState(false);
  const [openAlertaError, setOpenAlertaError] = useState(false);

  const [rowSelectionModel, setRowSelectionModel] = useState([]);
  const [rows, setRows] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [CantFacts, setCantFacts] = useState(null);
  const [totalSinRut, setTotalSinRut] = useState(0);
  const [totalConMontos, setTotalConMontos] = useState(0);

  const API_URL = ''; 

  const cargarDatos = async () => {
    try {
      const token = await LlamadosApis.ObtenerToken();
      try {
        const CantidadF = await LlamadosApis.obtenerCantidadFacturasExcel(token);
        setCantFacts(CantidadF);
      } catch (errorCantidadF) {
        setOpenAlertaError({//gianni
          open: true,
          message: "Error en Api. Consultar a T.I.",
        });
      }
    } catch (errorToken) {
        setOpenAlertaError({//gianni
          open: true,
          message: "Error en Api. Consultar a T.I.",
        });
    }
  };

  useEffect(() => {
    cargarDatos();
    const totalConMontos = rows.reduce((total, row) => {
      return row.TotalN > 0 ? total + 1 : total;
    }, 0);
    
    setTotalConMontos(totalConMontos);
  }, [rows]);

  const columns = [
    { field: 'ID',                  headerAlign: 'center',  headerName: 'Id.', width: 80 , align: 'center' },
    { field: 'Empresa',             headerAlign: 'center',  headerName: 'Empresa', width: 380 , align: 'left'},
    { field: 'Rut',                 headerAlign: 'center',  headerName: 'Rut', width: 100 , align: 'CENTER'},
    { field: 'Factura',      type: 'number',       headerAlign: 'center',  headerName: 'Factura', width: 100 , align: 'center' , valueFormatter: (params) => {   if (params.value !== null && params.value !== undefined && !isNaN(params.value)  ) { return params.value.toLocaleString('en-US');   } else {  return 0; } }, },
    { field: 'ExentoN',      type: 'number',       headerAlign: 'right',  headerName: 'Exento', width: 100 , align: 'right' , valueFormatter: (params) => {   if (params.value !== null && params.value !== undefined && !isNaN(params.value)  ) { return params.value.toLocaleString('en-US');   } else {  return 0; } }, },
    { field: 'NetoN',        type: 'number',       headerAlign: 'right',  headerName: 'Neto', width: 100 , align: 'right' , valueFormatter: (params) => {   if (params.value !== null && params.value !== undefined && !isNaN(params.value)  ) { return params.value.toLocaleString('en-US');   } else {  return 0; } }, },
    { field: 'IvaN',         type: 'number',       headerAlign: 'right',  headerName: 'Iva', width: 100 , align: 'right' , valueFormatter: (params) => {   if (params.value !== null && params.value !== undefined && !isNaN(params.value)  ) { return params.value.toLocaleString('en-US');   } else {  return 0; } }, },
    { field: 'TotalN',       type: 'number',       headerAlign: 'right',  headerName: 'Total', width: 100 , align: 'right' , valueFormatter: (params) => {   if (params.value !== null && params.value !== undefined && !isNaN(params.value) ) { return params.value.toLocaleString('en-US');   } else {  return 0; } }, },
  ];

  const getRowId = (row) => row.ID;




  //Leo Excel seleccionado por el usuario y lo muestro por pantalla...
  const handleFileUpload = (e) => {
    setProcessing(true);
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
        range.s.r = 3; // Fila 4
        const dataRows = XLSX.utils.sheet_to_json(sheet, {
          range: range,
          raw: false, // Evita que los valores se interpreten como fechas
        });
        const filteredRows = dataRows.filter((row) => row['RUT'] && row['TOTAL'] );
        if (filteredRows.length > 0) {
          const updatedRows = filteredRows.map((row, index) => ({
            ID: index + 1,
            Empresa: row['EMPRESA'],
            Rut: row['RUT'],
            RutN: ManejoDatosExcel.obtenerRutTrabajadorSinDV(row['RUT']),
            DVc: ManejoDatosExcel.obtenerDVTrabajador(row['RUT']),
            Factura: row['FACTURA'],
            ExentoN: parseFloat(ManejoDatosExcel.obtenerSoloNumeros(row['EXENTO'])),
            Exento: row['EXENTO'],
            NetoN: parseFloat(ManejoDatosExcel.obtenerSoloNumeros(row['NETO'])),
            Neto: row['NETO'],
            IvaN: parseFloat(ManejoDatosExcel.obtenerSoloNumeros(row['IVA'])),
            Iva: row['IVA'],
            TotalN: parseFloat(ManejoDatosExcel.obtenerSoloNumeros(row['TOTAL'])),
            Total: row['TOTAL'],
          }));
  
          setRows(updatedRows);
          setOpenAlertaOK({
            open: true,
            message: "Se han importado a la Grilla los datos del Excel seleccionado...",
          });
        } else {
          setOpenAlertaError({
            open: true,
            message: "El archivo seleccionado no contiene filas con valor en el campo 'RUT'.",
          });
        }
  
        setProcessing(false);
      };
      reader.readAsArrayBuffer(file);
    }
  };
  
  //Llevo los datos seleccionados a la Nube...
  const handleProcesarDatos = async () => {
    try {
      if (rowSelectionModel.length === 0) {
          setOpenAlertaError({//gianni
            open: true,
            message: "Debe seleccionar al menos un registro para procesar.",
          });
        return;
      }
      setProcessing(true);
      const token = await LlamadosApis.ObtenerToken();
  
      let ResultadoEliminar;
      try {
        ResultadoEliminar = await LlamadosApis.EliminarFacturasExcel(token);
      } catch (errorResultadoEliminar) {
          setOpenAlertaError({//gianni
            open: true,
            message: "Error en Api. Consultar a T.I.",
          });
      }


      if(ResultadoEliminar==='OK'){
        const recordsToInsert = [];
        const batchSize = 1000; // Tamaño del lote
    
        // Dividir los registros en lotes de a batchSize
        for (let i = 0; i < rowSelectionModel.length; i += batchSize) {
          const batchSelection = rowSelectionModel.slice(i, i + batchSize);
          const batch = batchSelection.map((selectedRowId) => {
            const selectedRow = rows.find((row) => row.ID === selectedRowId);
            return {
              Rut                         : selectedRow.Rut,
              Empresa                     : selectedRow.Empresa,
              RutN                        : selectedRow.RutN,  
              DVc                         : selectedRow.DVc,
              Factura                     : selectedRow.Factura,
              ExentoN                     : selectedRow.ExentoN,
              NetoN                       : selectedRow.NetoN,
              IvaN                        : selectedRow.IvaN,
              TotalN                      : selectedRow.TotalN
            };
          });
          recordsToInsert.push(...batch);

          // Enviar el lote actual a la API
          const datosPruebaResponse = await fetch(`${API_URL}/api/Seguros/SubirFacturasExcel`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(batch),
          });

          if (!datosPruebaResponse.ok) {
            setOpenAlertaError({//gianni
              open: true,
              message: "Error en Api. Consultar a T.I.",
            });
            throw new Error('Error de red al subir datos de las Facturas Excel');
          }
        }
      }
      //await cargarDatos();
      //setOpenAlertaImportarDatosNube(true);
      props.closePopup(1);
    } catch (error) {
        setOpenAlertaError({//gianni
          open: true,
          message: "Error en Api. Consultar a T.I.",
        });
      console.error('Error al subir datos de las Facturas Excel:', error);
    } finally {
      setProcessing(false); // Deshabilita el estado "processing" al final del proceso
      setRowSelectionModel([]);
    }
  };

  const handleExportarAexcel = () => {
    const selectedRowsData = rows.filter((row) =>
      rowSelectionModel.includes(row.ID)
    );
  
    if (rowSelectionModel.length === 0) {
      console.error('No se han seleccionado filas para exportar.');
      setOpenAlertaError({
        open: true,
        message: "No se han seleccionado filas para exportar.",
      });
      return;
    }
  
    const adjustedRowsData = selectedRowsData.map((row) => ({
      Empresa: row.Empresa,
      Rut: row.Rut,
      Factura: row.Factura,
      Exento: row.ExentoN,
      Neto: row.NetoN,
      Iva: row.IvaN,
      Total: row.TotalN,
    }));
  
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(adjustedRowsData);
    XLSX.utils.book_append_sheet(wb, ws, 'Datos Seleccionados');
    const fileName = 'ArchivoMío.xlsx';
    XLSX.writeFile(wb, fileName);
  
    setOpenAlertaOK({
      open: true,
      message: "Se han exportado los datos seleccionados a Excel...",
    });
  };

  const handleRowSelectionModelChange = (newRowSelectionModel) => {
    setRowSelectionModel(newRowSelectionModel);
    const selectedRowsData = rows.filter((row) =>
      newRowSelectionModel.includes(row.ID)
    );
  };
  
  return (
    <div style={{ marginLeft: '15px', marginRight: '15px' , background: 'white' }}>
      <h1 style={{ marginTop: '20px', marginBottom: '40px' }}>
        Subir información de Facturas
      </h1>
      <h4 style={{ marginTop: '0px', marginBottom: '40px' }}>
        {CantFacts === null
             ? 'Actualmente no existe información de Facturas Recibidas.'
             : `Existen ${CantFacts.toLocaleString('en-US')} Facturas Recibidas.`}
      </h4>
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
              ? 'Cargar archivo'
              : `Archivo cargado: ${rows.length} filas`}
          </Button>
        </label>
        <Button
          variant="contained"
          color="primary"
          onClick={handleExportarAexcel}
          disabled={rows.length === 0}
          style={{ marginLeft: '5px' }}
        >
          Exportar a Excel
        </Button>

      <Snackbar
        open={openAlertaError.open}
        autoHideDuration={3000}
        onClose={() => setOpenAlertaError({ open: false, message: "" })}
        message={openAlertaError.message}
        ContentProps={{
            style: {
                backgroundColor: "red",
                color: "white",
                marginLeft: "-10px",
            },
        }}
        anchorOrigin={{
            vertical: 'center', // Centra verticalmente
            horizontal: 'center', // Centra horizontalmente
        }}
        style={{
            position: 'absolute',
            bottom: '10px',
        }}
      />
      <Snackbar
          open={openAlertaOK.open}
          autoHideDuration={3000}
          onClose={() => setOpenAlertaOK({ open: false, message: "" })}
          message={openAlertaOK.message}
          ContentProps={{
              style: {
                  marginLeft: "-10px",
              },
          }}
          anchorOrigin={{
              vertical: 'center', // Centra verticalmente
              horizontal: 'center', // Centra horizontalmente
          }}
          style={{
              position: 'absolute',
              bottom: '10px',
          }}
      />
      <div style={{ marginTop: '5px' }}>
        <div
          className="custom-data-grid-container"
          style={{ height: '350px', width: '1130px' }}
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
                  const spaces2 = '\u00A0'.repeat(55);
                  return (
                    <div>
                      <span style={{ color: '#1976D2' , textShadow: '0.25px 0 0 #1976D2, 0 0.25px 0 #1976D2, -0.25px 0 0 #1976D2, 0 -0.25px 0 #1976D2' }}>

                      {spaces1}
                      Facturas a Procesar: {totalConMontos.toLocaleString('en-US')} 
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
      
      
    </div>
  );
};

export default SubirFacturas;