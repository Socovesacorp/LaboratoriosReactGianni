import React, { useState, useEffect , useCallback}  from 'react';
import { DataGrid }                                 from '@mui/x-data-grid';
import { Button, Snackbar , Box}                    from '@mui/material';
import * as XLSX                                    from 'xlsx';
import LlamadosApis                                 from '../ManejarDatosApis/LlamadosApis';
import '../../hojas-de-estilo/MantenedorExcels.css';

const TrabajarConCobroAseguradoraHistorico = (props) => {
    const {textoNick, NombreUsuario , CodPerfil, CorreoUsuario, ID, PERIODO} = props;
    const [rowSelectionModel1, setRowSelectionModel1] = useState([]);
    const [rows, setRows] = useState([]);
    const [isDataLoaded, setIsDataLoaded] = useState(false); 
    const [openAlertaError, setOpenAlertaError] = useState({ open: false, message: "" });
    const [openAlertaOK, setOpenAlertaOK] = useState({ open: false, message: "" });
    const [CantDescA, setCantDescA] = useState(null);

    const cargarDatos = async () => {
        try {
            const token = await LlamadosApis.ObtenerToken();
            try {
                const CantidadA = await LlamadosApis.ObtenerCantidadCobroAseguradora(token,ID);
                setCantDescA(CantidadA);
                const data = await LlamadosApis.ObtenerDatosCobroAseguradora(token,ID);
                setRows(data);
                setIsDataLoaded(true);
            } catch (errorObtenerDatos) {
                setOpenAlertaError({
                    open: true,
                    message: "Error en Api. Consultar a T.I.",
                });
                console.error('Error al obtener Datos de Cobro Aseguradora:', errorObtenerDatos);
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
        { field: 'CobroAseguradora_ID',                 headerAlign: 'center',  headerName: 'Id.', width: 80 , align: 'center' , renderCell: (params) => (
            <div style={{ height: 50, display: 'flex',  alignItems: 'center' }}>
                {params.value}
            </div>
        ),},
        { field: 'Apellido_Nombre',                     headerAlign: 'left',    headerName: 'Nombre', width: 220,align: 'left'},
        { field: 'NIF',                                 headerAlign: 'center',  headerName: 'NIF', width: 100 , align: 'center'},
        { field: 'NombreEmpresa',                       headerAlign: 'left',    headerName: 'Empresa', width: 280 , align: 'left'},
        { field: 'CentroCoste',                         headerAlign: 'left',    headerName: 'C. Costo', width: 200 , align: 'left'},
        { field: 'Denominacion',                        headerAlign: 'left',    headerName: 'Denominación', width: 185 , align: 'left'},
        { field: 'Periodo',                             headerAlign: 'center',  headerName: 'Periodo', width: 80 , align: 'center'},       
        { field: 'Importe',        type: 'number',      headerAlign: 'right',   headerName: 'Importe', width: 98 , align: 'right', valueFormatter: (params) => {   return params.value.toLocaleString('en-US'); }, },
        { field: 'TipoSeguro',                          headerAlign: 'center',  headerName: 'Tipo Asegurado', width: 158 , align: 'center'},
    ];
  
    const getRowId = (row) => row.CobroAseguradora_ID;

    const handleExportarAexcel = () => {
        const adjustedRowsData = rows.map((row) => ({
            'Id.': row.CobroAseguradora_ID,
            'Nombre': row.Apellido_Nombre,
            'NIF': row.NIF,
            'Empresa': row.NombreEmpresa,
            'C. Costo': row.CentroCoste,
            'Denominación': row.Denominacion,
            'Periodo': row.Periodo,
            'Importe': row.Importe,
            'Tipo Asegurado': row.TipoSeguro,
          }));
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(adjustedRowsData);
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
            <h1 style={{ marginTop: '0px', marginBottom: '40px', marginRight: '388px' }}>Cobros por parte de la Aseguradora del Periodo: {PERIODO}</h1>
        </div>
        <h4 style={{ marginTop: '0px', marginBottom: '40px' }}>
            {CantDescA === null
            ? 'Actualmente no existe información de Cobros por parte de la Aseguradora.'
            : `Existen ${CantDescA.toLocaleString('en-US')} Cobros de la Aseguradora procesados.`}
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
         <div style={{ marginTop: '5px' , marginRight:'15px' , marginBottom: '15px' }}>
            <div className="custom-data-grid-container" style={{ height: '450px', width: '1443px' }}>
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

export default TrabajarConCobroAseguradoraHistorico;