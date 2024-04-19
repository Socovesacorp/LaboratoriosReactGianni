import React, { useState, useEffect , useCallback}  from 'react';
import { DataGrid }                                 from '@mui/x-data-grid';
import { Button, Snackbar , Box}                    from '@mui/material';
import * as XLSX                                    from 'xlsx';
import LlamadosApis                                 from '../ManejarDatosApis/LlamadosApis';

import '../../hojas-de-estilo/MantenedorExcels.css';

const TrabajarConDescuentos = (props) => {
    const {textoNick, NombreUsuario , CodPerfil, CorreoUsuario, ID , PERIODO} = props;
    const [rowSelectionModel1, setRowSelectionModel1] = useState([]);
    const [rowSelectionModel2, setRowSelectionModel2] = useState([]);
    const [rows, setRows] = useState([]);
    const [isDataLoaded, setIsDataLoaded] = useState(false); 
    const [openAlertaError, setOpenAlertaError] = useState({ open: false, message: "" });
    const [openAlertaOK, setOpenAlertaOK] = useState({ open: false, message: "" });
    const [CantDescE, setCantDescE] = useState(null);
    const [rowsAgrupados, setRowsAgrupados] = useState([]);

    const cargarDatos = async () => {
        try {
            const token = await LlamadosApis.ObtenerToken();
            try {
                const CantidadD = await LlamadosApis.ObtenerCantidadDescuentos(token,ID);
                setCantDescE(CantidadD);
                const data = await LlamadosApis.ObtenerDatosDescuentos(token,ID);
                setRows(data);
                setIsDataLoaded(true);
                
                const dataAgrupados = await LlamadosApis.ObtenerDatosDescuentosAgrupados(token,ID);
                const dataAgrupadosConId = dataAgrupados.map((row, index) => ({ ...row, id: index + 1 }));
                setRowsAgrupados(dataAgrupadosConId);
                
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
        { field: 'DescuentosAlPersonal_ID',        headerAlign: 'center',  headerName: 'Id.', width: 80 , align: 'center' , renderCell: (params) => (
            <div style={{ height: 50, display: 'flex',  alignItems: 'center' }}>
                {params.value}
            </div>
        ),},
        { field: 'Apellido_Nombre',                     headerAlign: 'left',    headerName: 'Nombre', width: 180,align: 'left'},
        { field: 'NIF',                                 headerAlign: 'center',  headerName: 'NIF', width: 100 , align: 'center'},
        { field: 'Sociedad',       type: 'number',      headerAlign: 'center',  headerName: 'Sociedad', width: 100 , align: 'center'},
        { field: 'NombreEmpresa',                       headerAlign: 'left',    headerName: 'Empresa', width: 160 , align: 'left'},
        { field: 'CentroCoste',                         headerAlign: 'left',    headerName: 'C. Costo', width: 160 , align: 'left'},
        { field: 'Denominacion',                        headerAlign: 'left',    headerName: 'Denominación', width: 160 , align: 'left'},
        { field: 'Periodo',                             headerAlign: 'center',  headerName: 'Periodo', width: 80 , align: 'center'},       
        { field: 'Importe',        type: 'number',      headerAlign: 'right',  headerName: 'Importe', width: 105 , align: 'right', valueFormatter: (params) => {   return params.value.toLocaleString('en-US'); }, },
        { field: 'TipoSeguro',                          headerAlign: 'left',    headerName: 'Tipo de Seguro', width: 205 , align: 'left'},
    ];
  
    const columnsAgrupados = [
        { field: 'TipoSeguro',                          headerAlign: 'left', headerName:  'Tipo de Seguro', width: 250, align: 'left' , renderCell: (params) => (
            <div style={{ height: 50, display: 'flex',  alignItems: 'center' }}>
                {params.value}
            </div>
        ),},
        { field: 'RutDistintos',   type: 'number',      headerAlign: 'right', headerName: 'Trabajadores', width: 120, align: 'right', valueFormatter: (params) => {   return params.value.toLocaleString('en-US'); }, },
        { field: 'SumaImporte',    type: 'number',      headerAlign: 'right', headerName: 'Importe', width: 200, align: 'right' , valueFormatter: (params) => {   return params.value.toLocaleString('en-US'); }, },
    ];

    const getRowId = (row) => row.DescuentosAlPersonal_ID;
    const getRowId2 = (row) => row.id;

    const handleExportarAexcel = () => {
        const selectedRowsData = rows;
        
        if (rows.length === 0) {
            console.error('No hay datos para exportar.');
            setOpenAlertaError({
                open: true,
                message: "No hay datos para exportar.",
            });
            return;
        }

        const adjustedRowsData = selectedRowsData.map((row) => ({
            'Id.': row.DescuentosAlPersonal_ID,
            'Nombre': row.Apellido_Nombre,
            'NIF': row.NIF,
            'Sociedad': row.Sociedad,
            'Empresa': row.NombreEmpresa,
            'C. Costo': row.CentroCoste,
            'Denominación': row.Denominacion,
            'Periodo': row.Periodo,
            'Importe': row.Importe,
            'Tipo de Seguro': row.TipoSeguro,
        }));

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(adjustedRowsData);
        XLSX.utils.book_append_sheet(wb, ws, 'Datos Seleccionados');
        const fileName = 'ArchivoMío.xlsx';
        XLSX.writeFile(wb, fileName);
        handleOpenAlertaOK();
    };
    
    const handleExportarAexcel2 = () => {
        const selectedRowsData = rowsAgrupados;
    
        if (rowsAgrupados.length === 0) {
            console.error('No hay datos para exportar.');
            setOpenAlertaError({
                open: true,
                message: "No hay datos para exportar.",
            });
            return;
        }
    
        const adjustedRowsData = selectedRowsData.map((row) => ({
            'Tipo de Seguro': row.TipoSeguro,
            'Trabajadores': row.RutDistintos,
            'Importe': row.SumaImporte,
        }));
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(adjustedRowsData);
        XLSX.utils.book_append_sheet(wb, ws, 'Datos Seleccionados');
        const fileName = 'ArchivoMío.xlsx';
        XLSX.writeFile(wb, fileName);
        handleOpenAlertaOK();
    };

    const handleOpenAlertaOK = () => {
        setOpenAlertaOK({
            open: true,
            message: "Se han exportado los registros seleccionados al Excel.",
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

    const handleRowSelectionModelChange2 = (newRowSelectionModel2) => {
        setRowSelectionModel2(newRowSelectionModel2);
    };

    return (
        <div style={{ marginLeft: '15px' }}>
            <h1 style={{ marginTop: '0px', marginBottom: '40px' }}>Descuentos a Trabajadores del Periodo: {PERIODO}</h1>
            <h4 style={{ marginTop: '0px', marginBottom: '40px' }}>
                {CantDescE === null
                ? 'Actualmente no existe información de Descuentos a los Trabajadores.'
                : `Existen ${CantDescE.toLocaleString('en-US')} Descuentos a Trabajadores procesados.`}
            </h4>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleExportarAexcel}
                    disabled={!isDataLoaded} // Deshabilitar si rows está vacío
                >
                    Exportar a Excel
                </Button>
            </div>
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
            <div style={{ marginTop: '5px' , marginRight:'15px'}}>
                <div className="custom-data-grid-container" style={{ height: '300px', width: '1500px' }}>
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
            <div >
                <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center' }}>
                    <h1 style={{ margin: '0', marginRight: '290px' , marginBottom: '5px'}}>Resumen</h1>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleExportarAexcel2}
                        disabled={!isDataLoaded}
                    >
                        Exportar a Excel
                    </Button>
                </div>
                <div className="custom-data-grid-container" style={{ height: '200px', width: '632px', marginBottom: '15px' }}>
                    <DataGrid
                        rows={rowsAgrupados}
                        columns={columnsAgrupados}
                        getRowId={getRowId2}
                        //checkboxSelection
                        onRowSelectionModelChange={handleRowSelectionModelChange2}
                        rowSelectionModel={rowSelectionModel2}
                        getRowHeight={() => 'auto'}
                        resizable
                        className="custom-data-grid"
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
        </div>
    );
};

export default TrabajarConDescuentos;