import React, { useState, useEffect , useCallback}  from 'react';
import { DataGrid }                                 from '@mui/x-data-grid';
import { Button, Snackbar , Box}                    from '@mui/material';
import * as XLSX                                    from 'xlsx';
import LlamadosApis                                 from '../ManejarDatosApis/LlamadosApis';
import '../../hojas-de-estilo/MantenedorExcels.css';

const TrabajarConLoFacturadoHistorico = (props) => {
    const {textoNick, NombreUsuario , CodPerfil, CorreoUsuario, ID , PERIODO} = props;
    const [rowSelectionModel, setRowSelectionModel] = useState([]);
    const [rows, setRows] = useState([]);
    const [isDataLoaded, setIsDataLoaded] = useState(false); 
    const [openAlertaError, setOpenAlertaError] = useState(false);
    const [CantTrabE, setCantTrabE] = useState(null);
    const [openAlertaOK, setOpenAlertaOK] = useState({ open: false, message: "" });

    const cargarDatos = async () => {
        try {
            const token = await LlamadosApis.ObtenerToken();
            try {
                const CantidadT = await LlamadosApis.ObtenerCantidadSociedadesFacturadasH(token,ID);
                setCantTrabE(CantidadT);
                const data = await LlamadosApis.ObtenerSociedadesFacturadasH(token,ID);
                setRows(data);
                setIsDataLoaded(true);
            } catch (errorObtenerDatos) {
                setOpenAlertaError({
                    open: true,
                    message: "Error en API. Consultar a T.I.",
                });
                console.error('Error al obtener Datos de los Trabajadores:', errorObtenerDatos);
            }
        } catch (errorToken) {
            setOpenAlertaError({
                open: true,
                message: "Error en API. Consultar a T.I.",
            });
            console.error('Error al Obtener Token:', errorToken);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    const columns = [
        { field: 'Sociedad_Cod',                                        headerAlign: 'center',  headerName: 'Soc', width: 60 , align: 'center' },
        { field: 'Sociedad_RazonSocial',                                headerAlign: 'left',  headerName: 'Razón Social', width: 195,align: 'left'},
        { field: 'NroTrabajadoresDescuento',            type: 'number', headerAlign: 'center',    headerName: '# Desc.', width: 80 , align: 'right' , valueFormatter: (params) => {   return params.value.toLocaleString('en-US'); }, },
        { field: 'TotalDescuentos',                     type: 'number', headerAlign: 'center',    headerName: '$ Desc.', width: 80 , align: 'right' , valueFormatter: (params) => {   return params.value.toLocaleString('en-US'); }, },
        { field: 'NroTrabajadoresCobroAseguradora',     type: 'number', headerAlign: 'center',    headerName: '# Cobros', width: 100 , align: 'right' , valueFormatter: (params) => {   return params.value.toLocaleString('en-US'); }, },
        { field: 'TotalCobroAseguradora',               type: 'number', headerAlign: 'center',    headerName: '$ Cobro', width: 100 , align: 'right' , valueFormatter: (params) => {   return params.value.toLocaleString('en-US'); }, description: 'Cobro Total calculado por el Sistema.'},
        { field: 'TotalFactura',                        type: 'number', headerAlign: 'center',    headerName: '(Sura)', width: 100 , align: 'right' , valueFormatter: (params) => {   return params.value.toLocaleString('en-US'); }, },
        { field: 'TotalDiferencia',                          type: 'number', headerAlign: 'center',    headerName: '', width: 65 , align: 'right' , valueFormatter: (params) => {   return params.value.toLocaleString('en-US'); }, },
        { field: 'TotalExentoCobroAseguradora',         type: 'number', headerAlign: 'center',    headerName: '$ Exento', width: 100 , align: 'right' , valueFormatter: (params) => {   return params.value.toLocaleString('en-US'); }, },
        { field: 'TotalExento',                         type: 'number', headerAlign: 'center',    headerName: '(Sura)', width: 100 , align: 'right' , valueFormatter: (params) => {   return params.value.toLocaleString('en-US'); }, description: 'Monto Exento que figura en la Factura.' },
        { field: 'TotalDiferenciaExento',                         type: 'number', headerAlign: 'center',    headerName: '', width: 65 , align: 'right' , valueFormatter: (params) => {   return params.value.toLocaleString('en-US'); }, },
        { field: 'TotalAfectoCobroAseguradora',         type: 'number', headerAlign: 'center',    headerName: '$ Afecto', width: 100 , align: 'right' , valueFormatter: (params) => {   return params.value.toLocaleString('en-US'); }, },
        { field: 'TotalAfecto',                         type: 'number', headerAlign: 'center',    headerName: '(Sura)', width: 100 , align: 'right' , valueFormatter: (params) => {   return params.value.toLocaleString('en-US'); }, description: 'Monto Afecto que figura en la Factura.' },
        { field: 'TotalDiferenciaAfecto',                         type: 'number', headerAlign: 'center',    headerName: '', width: 65 , align: 'right' , valueFormatter: (params) => {   return params.value.toLocaleString('en-US'); }, },
        { field: 'TotalIvaCobroAseguradora',            type: 'number', headerAlign: 'center',    headerName: '$ Iva', width: 100 , align: 'right' , valueFormatter: (params) => {   return params.value.toLocaleString('en-US'); }, },
        { field: 'TotalIva',                            type: 'number', headerAlign: 'center',    headerName: '(Sura)', width: 100 , align: 'right' , valueFormatter: (params) => {   return params.value.toLocaleString('en-US'); }, description: 'Monto del IVA que figura en la Factura.' },
        { field: 'TotalDiferenciaIva',                            type: 'number', headerAlign: 'center',    headerName: '', width: 65 , align: 'right' , valueFormatter: (params) => {   return params.value.toLocaleString('en-US'); }, },
        { field: 'TotalCalculadoCostoEmpresa',                        type: 'number', headerAlign: 'center',    headerName: '$ C. Empresa', width: 120 , align: 'right' , valueFormatter: (params) => {   return params.value.toLocaleString('en-US'); }, },
        { field: 'TotalCostoEmpresaFactura',                             type: 'number', headerAlign: 'center',    headerName: '', width: 100 , align: 'right' , valueFormatter: (params) => {   return params.value.toLocaleString('en-US'); }, },
        { field: 'TotalDiferenciaCostoEmpresa',                             type: 'number', headerAlign: 'center',    headerName: '', width: 80 , align: 'right' , renderCell: (params) => (
            <div style={{ height: 50, display: 'flex',  alignItems: 'center' }}>
                {params.value.toLocaleString('en-US')}
            </div>
        ),}
    ];
  
    const getRowId = (row) => row.Sociedad_Cod;

    const handleExportarAexcel = () => {
        const adjustedRowsData = rows.map((row) => ({
            'Sociedad': row.Sociedad_Cod,
            'Razón Social': row.Sociedad_RazonSocial,
            'Cantidad Trabajadores Descuento': row.NroTrabajadoresDescuento,
            'Monto Descuentos': row.TotalDescuentos,
            'Cantidad de Cobros': row.NroTrabajadoresCobroAseguradora,
            'Monto Cobro Calculado': row.TotalCobroAseguradora,
            'Monto Cobro Factura': row.TotalFactura,
            'Diferencia Cobro': row.TotalDiferencia,
            'Monto Exento Calculado': row.TotalExentoCobroAseguradora,
            'Monto Exento Factura': row.TotalExento,
            'Diferencia Exento': row.TotalDiferenciaExento,
            'Monto Afecto Calculado': row.TotalAfectoCobroAseguradora,
            'Monto Afecto Factura': row.TotalAfecto,
            'Diferencia Afecto': row.TotalDiferenciaAfecto,
            'Monto IVA Calculado': row.TotalIvaCobroAseguradora,
            'Monto IVA Factura': row.TotalIva,
            'Diferencia IVA': row.TotalDiferenciaIva,
            'Costo Empresa Calculado': row.TotalCalculadoCostoEmpresa,
            'Costo Empresa según Factura': row.TotalCostoEmpresaFactura,
            'Diferencia Costo Empresa': row.TotalDiferenciaCostoEmpresa,
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

    const handleRowSelectionModelChange = (newRowSelectionModel) => {
        setRowSelectionModel(newRowSelectionModel);
        
    };

    return (
        <div style={{ marginLeft: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <h1 style={{ marginTop: '0px', marginBottom: '40px', marginRight: '0px' }}>Revisar lo Facturado del Periodo: {PERIODO}</h1>
            </div>
            <h4 style={{ marginTop: '0px', marginBottom: '40px' }}>
                {CantTrabE === null
                ? 'Actualmente no existe información de Sociedades a Facturar (Información Aseguradora).'
                : `Existen ${CantTrabE.toLocaleString('en-US')} Sociedades a Facturar (Información Aseguradora).`}
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
            <div style={{ marginTop: '5px' , width: '1400px', marginBottom: '15px' }}>
                <div className="custom-data-grid-container" style={{ height: '470px', width: '99%' }}>
                    <Box
                        sx={{
                            height: '100%',
                            width: '100%',
                            '& .NoIluminar': {
                            
                            },
                            '& .IluminarAzul': {
                            backgroundColor: '#D7E9CC',
                            //color: '#1a3e72',
                            },
                            '& .IluminarAmarillo': {
                            backgroundColor: '#FFFFCC',
                            color: '#ff0000',
                            },
                        }}
                    >
                        <DataGrid
                            rows={rows}
                            columns={columns}
                            //checkboxSelection
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
                            getCellClassName={(params) => {
                                if (params.field === 'TotalFactura') {
                                    return 'IluminarAzul';
                                }
                                if (params.field === 'TotalDiferencia') {
                                    return 'IluminarAmarillo';
                                }
                                if (params.field === 'TotalExento') {
                                    return 'IluminarAzul';
                                }
                                if (params.field === 'TotalDiferenciaExento') {
                                    return 'IluminarAmarillo';
                                }
                                if (params.field === 'TotalAfecto') {
                                    return 'IluminarAzul';
                                }
                                if (params.field === 'TotalDiferenciaAfecto') {
                                    return 'IluminarAmarillo';
                                }
                                if (params.field === 'TotalIva') {
                                    return 'IluminarAzul';
                                }
                                if (params.field === 'TotalDiferenciaIva') {
                                    return 'IluminarAmarillo';
                                }
                                if (params.field === 'TotalCostoEmpresaFactura') {
                                    return 'IluminarAzul';
                                }
                                if (params.field === 'TotalDiferenciaCostoEmpresa') {
                                    return 'IluminarAmarillo';
                                }
                                return '';
                            }}
                        />
                    </Box>
                </div>
            </div>
        </div>
    );
};

export default TrabajarConLoFacturadoHistorico;