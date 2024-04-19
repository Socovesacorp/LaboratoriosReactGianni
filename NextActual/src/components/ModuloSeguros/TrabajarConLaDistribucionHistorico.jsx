import React, { useState, useEffect , useCallback}  from 'react';
import { DataGrid }                                 from '@mui/x-data-grid';
import { Button, Snackbar , Box}                    from '@mui/material';
import * as XLSX                                    from 'xlsx';
import LlamadosApis                                 from '../ManejarDatosApis/LlamadosApis';
import '../../hojas-de-estilo/MantenedorExcels.css';

const TrabajarConLaDistribucion = (props) => {
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
                const data = await LlamadosApis.ObtenerDistribuciones(token,ID);
                setRows(data);
                setIsDataLoaded(true);
            } catch (errorObtenerDatos) {
                setOpenAlertaError({
                    open: true,
                    message: "Error en API. Consultar a T.I.",
                });
                console.error('Error al obtener Datos de los Distribuciones:', errorObtenerDatos);
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
        { field: 'Id',                                                  headerAlign: 'center',  headerName: 'Id', width: 50 , align: 'center' },
        { field: 'Sociedad_Cod',                                        headerAlign: 'center',  headerName: 'Sociedad', width: 100 , align: 'center' },
        { field: 'Sociedad_RazonSocial',                                headerAlign: 'left',  headerName: 'Razón Social', width: 205,align: 'left'},
        { field: 'CentroCoste',                                         headerAlign: 'center',  headerName: 'Centro', width: 105,align: 'left'},
        { field: 'Denominacion',                                        headerAlign: 'left',  headerName: 'Denominación', width: 195,align: 'left'},
        { field: 'NroTrabajadoresDescuento',            type: 'number', headerAlign: 'center',    headerName: '# Desc.', width: 90 , align: 'center' , valueFormatter: (params) => {
            if (params.value === 0) {
              return ' ';
            }
            return params.value.toLocaleString('en-US');
        },},
        { field: 'TotalDescuentos',                     type: 'number', headerAlign: 'center',    headerName: '$ Desc.', width: 90 , align: 'right' , valueFormatter: (params) => {
            if (params.value === 0) {
              return ' ';
            }
            return params.value.toLocaleString('en-US');
        },},
        { field: 'NroTrabajadoresCobroAseguradora',     type: 'number', headerAlign: 'center',    headerName: '# Cob.', width: 90 , align: 'center' , valueFormatter: (params) => {
            if (params.value === 0) {
              return ' ';
            }
            return params.value.toLocaleString('en-US');
        },},
        { field: 'TotalCobroAseguradora',               type: 'number', headerAlign: 'center',    headerName: '$ Cob.', width: 90 , align: 'right' , valueFormatter: (params) => {   return params.value.toLocaleString('en-US'); }, },
        { field: 'TotalExentoCobroAseguradora',         type: 'number', headerAlign: 'center',    headerName: '$ Exento', width: 90 , align: 'right' , valueFormatter: (params) => {   return params.value.toLocaleString('en-US'); }, },
        { field: 'TotalAfectoCobroAseguradora',         type: 'number', headerAlign: 'center',    headerName: '$ Afecto', width: 90 , align: 'right' , valueFormatter: (params) => {   return params.value.toLocaleString('en-US'); }, },
        { field: 'TotalIvaCobroAseguradora',            type: 'number', headerAlign: 'center',    headerName: '$ Iva', width: 90 , align: 'right' , valueFormatter: (params) => {   return params.value.toLocaleString('en-US'); }, },
        { field: 'CostoEmpresa',                        type: 'number', headerAlign: 'center',    headerName: '$ Costo Empresa', width: 140 , align: 'right' , valueFormatter: (params) => {   return params.value.toLocaleString('en-US'); }, },
        { field: 'Existe',                                              headerAlign: 'center',    headerName: '¿Existe?', width: 180 , align: 'center' ,
        renderCell: (params) => {
            if (params.row.CentroCoste === 'PEP NO ENCONTRADO') {
                return (
                    <div style={{ height: 50, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        No
                    </div>
                );
            } else {
                return (
                    <div style={{ height: 50, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        Si
                    </div>
                );
            }
        },
    },
    ];
  
    const getRowId = (row) => row.Id;

    const handleExportarAexcel = () => {
        const adjustedRowsData = rows.map((row) => ({
            Id: row.Id,
            'Sociedad': row.Sociedad_Cod,
            'Razón Social': row.Sociedad_RazonSocial,
            'Centro': row.CentroCoste,
            'Denominación': row.Denominacion,
            'Cantidad Descuentos': row.NroTrabajadoresDescuento,
            'Monto Descuento': row.TotalDescuentos,
            'Cantidad Cobranzas': row.NroTrabajadoresCobroAseguradora,
            'Monto Cobranza': row.TotalCobroAseguradora,
            'Exento': row.TotalExentoCobroAseguradora,
            'Afecto': row.TotalAfectoCobroAseguradora,
            'IVA': row.TotalIvaCobroAseguradora,
            'Costo Empresa': row.CostoEmpresa,
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
    }
    return (
        <div style={{ marginLeft: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <h1 style={{ marginTop: '40px', marginBottom: '40px', marginRight: '905px' }}>Distribuido en Periodo: {PERIODO}</h1>
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
            <div style={{ marginTop: '5px' , marginRight:'15px' , marginBottom:'15px' }}>
                <div className="custom-data-grid-container" style={{ height: '500px', width: '1609px' }}>
                    <Box
                        sx={{
                            height: '100%',
                            width: '100%',
                            '& .NoIluminar': {
                            
                            },
                            '& .Iluminar': {
                            backgroundColor: '#B8E5F6',
                            color: '#1a3e72',
                            fontWeight: 'bold'
                            },
                            '& .IluminarAmarilloError': {
                            backgroundColor: '#FFFFCC',
                            color: '#ff0000',
                            },
                            '& .IluminarVerde': {
                                backgroundColor: '#D7E9CC',
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
                            pageSizeOptions={[]}getCellClassName={(params) => {
                                if (params.row.CentroCoste === 'TOTAL' ) {
                                    return 'Iluminar'; // Clase para toda la fila
                                }
                                if (params.row.CentroCoste === 'FACTURA' && params.row.NroTrabajadoresDescuento === 0) {
                                    return 'IluminarVerde'; // Clase para la celda con espacio en blanco
                                }
                                if (params.row.CentroCoste === 'DIFERENCIA' ) {
                                    return 'IluminarAmarilloError'; // Clase para toda la fila
                                }
                                if (params.field === 'CentroCoste' && params.row.CentroCoste.substring(0, 1).match(/\d/) && params.row.CentroCoste.substring(0, 4) !== params.row.Sociedad_Cod.toString().substring(0, 4)) {
                                    return 'IluminarAmarilloError'; 
                                }
                                return 'NoIluminar'; // Sin clase para la fila
                            }}
                        />
                    </Box>
                </div>
            </div>
        </div>
    );
};

export default TrabajarConLaDistribucion;