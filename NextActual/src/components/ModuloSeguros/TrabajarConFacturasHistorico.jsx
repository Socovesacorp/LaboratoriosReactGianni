import React, { useState, useEffect , useCallback}  from 'react';
import { DataGrid }                                 from '@mui/x-data-grid';
import { Button, Snackbar , Box}                    from '@mui/material';
import * as XLSX                                    from 'xlsx';
import LlamadosApis                                 from '../ManejarDatosApis/LlamadosApis';
import SubirFacturas                                from './SubirFacturas';
import '../../hojas-de-estilo/MantenedorExcels.css';

const TrabajarConFacturasHistorico = (props) => {
    const {textoNick, NombreUsuario , CodPerfil, CorreoUsuario, ID , PERIODO} = props;
    const [rowSelectionModel1, setRowSelectionModel1] = useState([]);
    const [rows, setRows] = useState([]);
    const [isDataLoaded, setIsDataLoaded] = useState(false); 
    const [openAlertaError, setOpenAlertaError] = useState({ open: false, message: "" });
    const [openAlertaOK, setOpenAlertaOK] = useState({ open: false, message: "" });
    const [CantFacts, setCantFacts] = useState(null);

    const cargarDatos = async () => {
        try {
            const token = await LlamadosApis.ObtenerToken();
            try {
                const Cantidad = await LlamadosApis.ObtenerCantidadFacturas(token,ID);
                setCantFacts(Cantidad);
                const data = await LlamadosApis.ObtenerDatosFacturas(token,ID);
                setRows(data);
                setIsDataLoaded(true);
            } catch (errorObtenerDatos) {
                setOpenAlertaError({
                    open: true,
                    message: "Error en Api. Consultar a T.I.",
                });
                console.error('Error al obtener Datos de los Descuentos Excel:', errorObtenerDatos);
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
    }, []);

    const columns = [
        { field: 'Facturas_Id',            headerAlign: 'center',  headerName: 'Id.', width: 80 , align: 'center' , renderCell: (params) => (
            <div style={{ height: 50, display: 'flex',  alignItems: 'center' }}>
                {params.value.toLocaleString('en-US')}
            </div>
        ),},
        { field: 'Sociedad_RazonSocial',        headerAlign: 'center',  headerName: 'Empresa', width: 380 , align: 'left'},
        { field: 'Sociedad_Rut',                headerAlign: 'center',  headerName: 'Rut', width: 100 , align: 'CENTER'},
        { field: 'Factura_Nro',                 headerAlign: 'center',  headerName: 'Factura', width: 100 , align: 'center' },
        { field: 'Factura_Exento',        type: 'number',      headerAlign: 'right',  headerName: 'Exento', width: 100 ,    align: 'right' , valueFormatter: (params) => {   if (params.value !== null && params.value !== undefined) { return params.value.toLocaleString('en-US');   } else {  return 0; } }, },
        { field: 'Factura_Neto',          type: 'number',      headerAlign: 'right',  headerName: 'Neto', width: 100 ,      align: 'right' , valueFormatter: (params) => {   if (params.value !== null && params.value !== undefined) { return params.value.toLocaleString('en-US');   } else {  return 0; } }, },
        { field: 'Factura_Iva',           type: 'number',      headerAlign: 'right',  headerName: 'Iva', width: 100 ,       align: 'right' , valueFormatter: (params) => {   if (params.value !== null && params.value !== undefined) { return params.value.toLocaleString('en-US');   } else {  return 0; } }, },
        { field: 'Factura_Total',         type: 'number',      headerAlign: 'right',  headerName: 'Total', width: 104 ,     align: 'right' , valueFormatter: (params) => {   if (params.value !== null && params.value !== undefined) { return params.value.toLocaleString('en-US');   } else {  return 0; } }, },
      ];
  
    const getRowId = (row) => row.Facturas_Id;

    const handleExportarAexcel = () => {
        const adjustedRowsData = rows.map((row) => ({
            Id: row.Facturas_Id,
            Empresa: row.Sociedad_RazonSocial,
            Rut: row.Sociedad_Rut,
            Factura: row.Factura_Nro,
            Exento: row.Factura_Exento,
            Neto: row.Factura_Neto,
            Iva: row.Factura_Iva,
            Total: row.Factura_Total,
          }));
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(adjustedRowsData); // Exporta todas las filas
        XLSX.utils.book_append_sheet(wb, ws, 'Datos Seleccionados');
        const fileName = 'ArchivoMío.xlsx';
        XLSX.writeFile(wb, fileName);
        setOpenAlertaOK({
            open: true,
            message: "Se han exportado todos los registros al Excel.",
        });
    };

    const handleCloseAlertaOK = () => {
        setOpenAlertaOK({
            open: false,
            message: "",
        });
    };

    const handleRowSelectionModelChange1 = (newRowSelectionModel1) => {
        setRowSelectionModel1(newRowSelectionModel1);
    };

    return (
        <div style={{ marginLeft: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <h1 style={{ marginTop: '0px', marginBottom: '40px', marginRight: '450px' }}>Facturas del Periodo: {PERIODO}</h1>
        </div>
        <h4 style={{ marginTop: '0px', marginBottom: '40px' }}>
            {CantFacts === null
            ? 'Actualmente no existe información de Facturas Recibidas.'
            : `Existen ${CantFacts.toLocaleString('en-US')} Facturas Recibidas.`}
        </h4>
        <Button
            variant="contained"
            color="primary"
            onClick={handleExportarAexcel}
            disabled={!isDataLoaded} // Deshabilitar si rows está vacío
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
        />
        <Snackbar
            open={openAlertaOK.open}
            autoHideDuration={3000}
            onClose={handleCloseAlertaOK}
            message={openAlertaOK.message}
            ContentProps={{
                style: {
                marginLeft: '-10px'
                },
            }}
        />
        <div style={{ marginTop: '5px' }}>
            <div className="custom-data-grid-container" style={{ height: '450px', width: '1100px' , marginRight: '15px' , marginBottom:'15px' }}>
            <DataGrid
                rows={rows}
                columns={columns}
                //checkboxSelection
                onRowSelectionModelChange={handleRowSelectionModelChange1}
                rowSelectionModel={rowSelectionModel1}
                getRowHeight={() => 'auto'}
                resizable
                className="custom-data-grid"
                getRowId={getRowId}
                localeText={{
                noRowsLabel: 'No hay filas para mostrar',
                MuiTablePagination: {
                    labelDisplayedRows: ({ from, to, count }) => {
                    return (
                        <div>
                            {from} - {to} de un total de {count}
                        </div>
                    );
                    },
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

    </div>
    );
};

export default TrabajarConFacturasHistorico;