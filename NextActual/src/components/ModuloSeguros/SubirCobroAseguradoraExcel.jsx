import React, { useState , useEffect }            from 'react';
import * as XLSX                                  from 'xlsx';
import { DataGrid }                               from '@mui/x-data-grid';
import { Button, Snackbar, Input, Box }           from '@mui/material';
import LlamadosApis                               from '../ManejarDatosApis/LlamadosApis';
import ManejoDatosExcel                           from '../ManejarDatosGrilla/ManejoDatosExcel';
import '../../hojas-de-estilo/MantenedorExcels.css';

const SubirCobroAseguradoraExcel = (props) => {
  const {Seg1, Seg2, textoNick, NombreUsuario , CodPerfil, CorreoUsuario} = props;
  const [openAlertaOK, setOpenAlertaOK]           = useState(false);
  const [openAlertaError, setOpenAlertaError]     = useState(false);
  const [rowSelectionModel, setRowSelectionModel] = useState([]);
  const [rowsA, setRowsA]                         = useState([]);
  const [processing, setProcessing]               = useState(false);
  const [CantAportesE, setCantAportesE]           = useState(null);
  const [totalSinRut, setTotalSinRut]             = useState(0);
  const [totalConRut, setTotalConRut]             = useState(0);

  const API_URL = ''; 

  const cargarDatos = async () => {
    try {
      const token = await LlamadosApis.ObtenerToken();
      try {
        const CantidadD = await LlamadosApis.obtenerCantidadCobroAseguradoraExcel(token);
        setCantAportesE(CantidadD);
      } catch (errorCantidadD) {
        setOpenAlertaError({
          open: true,
          message: "Error en Api. Consultar a T.I.",
        });
        
      }
    } catch (errorToken) {
      setOpenAlertaError({
        open: true,
        message: "Error en Api. Consultar a T.I.",
      });
      console.error('Error al Obtener Token:', errorToken);
    }
  };

  useEffect(() => {
    cargarDatos();
    const totalSinRutCount = rowsA.filter((row) => row.RutTrabajadorSinDV<999999).length;
    setTotalSinRut(totalSinRutCount);
    const totalConRutCount = rowsA.filter((row) => row.RutTrabajadorSinDV>999999).length;
    setTotalConRut(totalConRutCount);
  }, [rowsA]);

  const columns = [
    { field: 'ID',                           headerAlign: 'center',  headerName: 'Id.', width: 80 , align: 'center' },
    { field: 'Contratante_Principal',        headerAlign: 'left',    headerName: 'Contratante_Principal', width: 230 , align: 'left'},
    { field: 'RutEmpresa',         type: 'number', headerAlign: 'center', headerName: 'Rut Empresa', width: 110 , align: 'center' },
    { field: 'DVEmpresa',                    headerAlign: 'center',  headerName: 'Dv', width: 50 , align: 'center' },
    { field: 'TipoAseg',                     headerAlign: 'center',  headerName: 'Asegurado', width: 100 , align: 'center'},
    { field: 'RutTrabajadorSinDV',  type: 'number', headerAlign: 'center', headerName: 'Rut', width: 100 , align: 'center' },
    { field: 'DVTrabajador',                 headerAlign: 'center',  headerName: 'Dv', width: 1 , align: 'center' },

    { field: 'Nombres',                      headerAlign: 'left',    headerName: 'Nombres', width: 200 , align: 'left' },
    { field: 'ApePaterno',                   headerAlign: 'left',    headerName: 'Apellido Paterno', width: 140 , align: 'left' },
    { field: 'ApeMaterno',                   headerAlign: 'left',    headerName: 'Apellido Materno', width: 140, align: 'left' },
    
    { field: 'Total',                        headerAlign: 'right',  headerName: 'Total $', width: 117,align: 'right', valueFormatter: (params) => {   return params.value.toLocaleString('en-US'); }, },
    { field: 'Periodo',                      headerAlign: 'center',    headerName: 'Periodo', width: 102,align: 'center' },
  ];

  const getRowId = (row) => row.ID;

  // Función para contar el número de celdas con valor en una columna específica para una fila dada
  function contarCeldasConValorEnColumna(row, columna) {
    let count = 0;
    for (let i = 0; i < 7; i++) {
      const columnName = obtenerNombreColumna(i); // Función para obtener el nombre de la columna según el índice
      const value = row[columnName];
      //console.log(`Valor en ${columnName}:`, value);
      //console.log(`Longitud del valor en ${columnName}:`, value ? value.trim().length : undefined);
      if (value && value.trim().length >= 1) {
        count++;
        //console.log(`Celda en ${columnName} tiene valor y se cuenta.`);
      } else {
        //console.log(`Celda en ${columnName} no tiene valor o tiene una longitud menor a 1.`);
      }
    }
    //console.log('Total de celdas con valor:', count);
    return columna - 7 +count;
  }

  function obtenerNombreColumna(indice) {
    //debo colocar estas 7 columnas como fijas porque algunas viajan sin valor...
    const nombresColumnas = ['Fec.Ini.Vi','Fec.Fin.Vi','Estado','Movimiento','Num.Cargas','Tipo Aseg.','Num.Gru']; // Ejemplo de nombres de columnas
    const sufijo = nombresColumnas.lastIndexOf(nombresColumnas[indice]) - nombresColumnas.indexOf(nombresColumnas[indice]) > 0 ? `_${nombresColumnas.lastIndexOf(nombresColumnas[indice]) - nombresColumnas.indexOf(nombresColumnas[indice])}` : ''; // Se agrega un sufijo numérico si el nombre de la columna está duplicado
    return `${nombresColumnas[indice]}${sufijo}`;

  }

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
        //range.s.r = 4; // Fila 5
        range.s.r = 0; // Fila 1
        const dataRows = XLSX.utils.sheet_to_json(sheet, {
          range: range,
          raw: false, // Evita que los valores se interpreten como fechas
        });

        // Filtrar los datos según los valores de "CC-nómina" sean igual a props.Seg1 o props.Seg2
        const filteredRows = dataRows.filter(row =>
          row['Tipo Aseg.'] === 'T' 
        );
  
        const updatedRows = filteredRows.map((row, index) => ({
          ID                        : index + 1, 
          Contratante_Principal     : row['Contratante Principal'],
          RutEmpresa                : ManejoDatosExcel.formatDecimal(row[Object.keys(row)[2]]), // Valor de la primera columna "Rut" (columna 3)
          DVEmpresa                 : row[Object.keys(row)[3]], // Valor de la columna 4
          TipoAseg                  : row['Tipo Aseg.'],
          RutTrabajadorSinDV        : obtenerRutTrabajadorSinDV(row),
          DVTrabajador              : obtenerTrabajadorDV(row),
          RUT                       : row['RUT'],
          Nombres                   : row['Nombres'],
          ApePaterno                : row['Ape.Paterno'],
          ApeMaterno                : row['Ape.Materno'].toUpperCase(),
          Periodo                   : ManejoDatosExcel.formatoYYYYmm(row['FECVAL']),
          Total                     : ManejoDatosExcel.formatDecimal(row['TOTAL $']),
          TotalUF                   : ManejoDatosExcel.formatDecimal(row['TOTAL']),
          EXENTO                    : ManejoDatosExcel.formatDecimal(row['EXENTO']),
          AFECTO                    : ManejoDatosExcel.formatDecimal(row['AFECTO']),
          IVA                       : ManejoDatosExcel.formatDecimal(row['IVA']),

        }));
        setRowsA(updatedRows);
        setOpenAlertaOK({
          open: true,
          message: "Se han importado a la Grilla los datos del Excel seleccionado...",
        });
        setProcessing(false);
      };
      reader.readAsArrayBuffer(file);
    }
  };
  
  const obtenerRutTrabajadorSinDV = (row) => {
    const valorSinDV = ManejoDatosExcel.formatDecimal(row[Object.keys(row)[contarCeldasConValorEnColumna(row, 11)]]);
    return !isNaN(valorSinDV) && valorSinDV > 999999 ? valorSinDV : '';
  };
  const obtenerTrabajadorDV = (row) => {
    const DV = row[Object.keys(row)[contarCeldasConValorEnColumna(row, 12) ]]; // Valor de la columna 13
    return DV.trim().length == 1 ? DV : '';
  };

  //Llevo los datos seleccionados a la Nube...
  const handleProcesarDatos = async () => {
    try {
      if (rowSelectionModel.length === 0) {
        setOpenAlertaError({
          open: true,
          message: "No se han seleccionado registros para procesar. Acción inválida.",
        });
        return;
      }
      setProcessing(true);
      const token = await LlamadosApis.ObtenerToken();
  
      let ResultadoEliminar;
      try {
        ResultadoEliminar = await LlamadosApis.EliminarCobroAseguradoraExcel(token);
      } catch (errorResultadoEliminar) {
        setOpenAlertaError({
          open: true,
          message: "Error en Api de EliminarCobroAseguradoraExcel. Consultar con T.I.",
        });
      }


      if(ResultadoEliminar==='OK'){
        const recordsToInsert = [];
        const batchSize = 1000; // Tamaño del lote
    
        // Dividir los registros en lotes de a batchSize
        for (let i = 0; i < rowSelectionModel.length; i += batchSize) {
          const batchSelection = rowSelectionModel.slice(i, i + batchSize);
          const batch = batchSelection.map((selectedRowId) => {
            const selectedRow = rowsA.find((row) => row.ID === selectedRowId);
            return {
              //ID: selectedRow.ID,
              
              Contratante_Principal         : selectedRow.Contratante_Principal,
              RutTrabajadorSinDV            : selectedRow.RutTrabajadorSinDV,
              DVTrabajador                  : selectedRow.DVTrabajador,
              Periodo                       : selectedRow.Periodo,
              Nombres                       : selectedRow.Nombres,
              ApePaterno                    : selectedRow.ApePaterno,
              ApeMaterno                    : selectedRow.ApeMaterno,
              
              RutEmpresa                    : selectedRow.RutEmpresa,
              DVEmpresa                     : selectedRow.DVEmpresa,
              TipoAseg                      : selectedRow.TipoAseg,
              Total                         : selectedRow.Total,
              Exento                        : selectedRow.EXENTO,
              TotalUF                       : selectedRow.TotalUF,
              Afecto                        : selectedRow.AFECTO,
              Iva                           : selectedRow.IVA,
            };
          });
          recordsToInsert.push(...batch);

          // Enviar el lote actual a la API
          const datosPruebaResponse = await fetch(`${API_URL}/api/Seguros/SubirCobroAseguradoraExcel`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(batch),
          });


          if (!datosPruebaResponse.ok) {
            console.error('Error de red:', datosPruebaResponse.statusText);
            setOpenAlertaError({
              open: true,
              message: "Error en Api. Consultar a T.I.",
            });
            throw new Error('Error de red al subir datos de los CobroAseguradora Excel');
          }
        }
        
      }
      props.closePopup(1);
    } catch (error) {
      setOpenAlertaError({
        open: true,
        message: "Error en Api. Consultar a T.I.",
      });
      
    } finally {
      setProcessing(false); // Deshabilita el estado "processing" al final del proceso
      setRowSelectionModel([]);
    }
  };

  const handleExportarAexcel = () => {
    const selectedRowsData = rowsA.filter((row) =>
      rowSelectionModel.includes(row.ID)
    );
    if (rowSelectionModel.length === 0) {
      setOpenAlertaError({
        open: true,
        message: "No se han seleccionado registros para exportar.",
      });
      return;
    }
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(selectedRowsData);
    //ws['!cols'] = [{ width: 10 }, { width: 20 }, { width: 100 }];
    XLSX.utils.book_append_sheet(wb, ws, 'Datos Seleccionados');
    const fileName = 'ArchivoMío.xlsx';
    XLSX.writeFile(wb, fileName);
    setOpenAlertaOK({
      open: true,
      message: "Se han exportado a Excel los registros seleccionados.",
    });
  };

  const handleRowSelectionModelChange = (newRowSelectionModel) => {
    setRowSelectionModel(newRowSelectionModel);
    const selectedRowsData = rowsA.filter((row) =>
      newRowSelectionModel.includes(row.ID)
    );
  };
  
  return (
    <div style={{ marginLeft: '15px', marginRight: '15px' , background: 'white' }}>
      <h1 style={{ marginTop: '20px', marginBottom: '40px' }}>
        Subir información de Cobros recibido por la Aseguradora 
      </h1>
      <h4 style={{ marginTop: '0px', marginBottom: '40px' }}>
        {CantAportesE === null
          ? 'Actualmente no existe información de Cobros por parte de la Aseguradora.'
          : `Existen ${CantAportesE.toLocaleString('en-US')} Cobros de la Aseguradora procesados.`}
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
            {rowsA.length === 0
              ? 'Cargar archivo'
              : `Archivo cargado: ${rowsA.length} filas`}
          </Button>
        </label>
        <Button
          variant="contained"
          color="primary"
          onClick={handleExportarAexcel}
          disabled={rowsA.length === 0}
        >
          Exportar a Excel
        </Button>
      </Box>
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
      <div style={{ marginTop: '5px' }}>
        <div
          className="custom-data-grid-container"
          style={{ height: '350px', width: '100%' }}
        >
          <DataGrid
            rows={rowsA}
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
                  const spaces2 = '\u00A0'.repeat(40);
                  return (
                    <div>
                      <span style={{ color: '#1976D2' , textShadow: '0.25px 0 0 #1976D2, 0 0.25px 0 #1976D2, -0.25px 0 0 #1976D2, 0 -0.25px 0 #1976D2' }}>
                      Trabajadores sin Rut: {totalSinRut}
                      {spaces1}
                      Cobros a Procesar: {totalConRut.toLocaleString('en-US')} 
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

export default SubirCobroAseguradoraExcel;