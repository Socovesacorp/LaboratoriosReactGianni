import React, { useState, useEffect , useCallback}  from 'react';
import { DataGrid }                                 from '@mui/x-data-grid';
import { Button, Snackbar , Box}                    from '@mui/material';
import * as XLSX                                    from 'xlsx';
import LlamadosApis                                 from '../ManejarDatosApis/LlamadosApis';
import SubirTrabajadoresExcel                       from './SubirTrabajadoresExcel';
import '../../hojas-de-estilo/MantenedorExcels.css';

const TrabajarConTrabajadores = (props) => {
    const {textoNick, NombreUsuario , CodPerfil, CorreoUsuario} = props;
    const [rowSelectionModel, setRowSelectionModel] = useState([]);
    const [rows, setRows] = useState([]);
    const [isDataLoaded, setIsDataLoaded] = useState(false); 
    const [openAlertaError, setOpenAlertaError] = useState(false);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [CantTrabE, setCantTrabE] = useState(null);
    const [openAlertaOK, setOpenAlertaOK] = useState({ open: false, message: "" });
    const [SubidaTrabajadores , setSubidaTrabajadores]=useState(null);
    const [SubidaDescuentosTrabajadores , setSubidaDescuentosTrabajadores]=useState(null);
    const [SubidaCobroAseguradora , setSubidaCobroAseguradora]=useState(null);
    const [FacturadoValido , setFacturadoValido]=useState(null);
    const [DistribucionValido , setDistribucionValido]=useState(null);

    const openPopup = () => {
        setIsPopupOpen(true);
    };

    const closePopup = (puedo) => {
        setIsPopupOpen(false);
        if (puedo === 1) {
            setOpenAlertaOK({
                open: true,
                message: "Se ha procesado la información de los Descuentos a los Trabajadores.",
            });
            setRowSelectionModel([]);
        }
        cargarDatos(); 
    };

    const CustomModal = ({ closeFunction, contentComponent, popupWidth }) => {
        return (
            <div className="custom-modal" style={{ background: 'white', width: `${popupWidth}px` }}>
                <div className="modal-content">
                    {/* Aquí puedes agregar el contenido personalizado */}
                    {/*<h2>Título del Popup</h2>*/}
                    {/*<p>Contenido personalizado</p>*/}
                    <button
                        onClick={closeFunction}
                        style={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            zIndex: 1,
                            backgroundColor: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '1.5rem',
                            color: '#333',// Color del ícono de cierre
                        }}
                    >
                        &#x2716; {/* Este es el símbolo de la equis (X) como ícono de cierre */}
                    </button>
                    <div style={{ width: '100%' }}>
                        {contentComponent}
                    </div>
                </div>
            </div>
        );
    };

    const cargarDatos = async () => {
        try {
            const token = await LlamadosApis.ObtenerToken();
            try {
                const dataEstadoSubidaExcel = await LlamadosApis.ObtenerEstadoSubidaExcel(token);
                const { SubidaTrabajadores, SubidaDescuentosTrabajadores, SubidaCobroAseguradora, FacturadoValido, DistribucionValido } = dataEstadoSubidaExcel;
                setSubidaTrabajadores(SubidaTrabajadores)
                setSubidaDescuentosTrabajadores(SubidaDescuentosTrabajadores)
                setSubidaCobroAseguradora(SubidaCobroAseguradora)
                setFacturadoValido(FacturadoValido)
                setDistribucionValido(DistribucionValido)

                const CantidadT = await LlamadosApis.obtenerCantidadTrabajadoresExcel(token);
                setCantTrabE(CantidadT);
                const data = await LlamadosApis.ObtenerDatosTrabajadoresExcel(token);
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
        { field: 'TrabajadoresExcel_ID',                headerAlign: 'center',  headerName: 'Id.', width: 80 , align: 'center' , renderCell: (params) => (
            <div style={{ height: 50, display: 'flex',  alignItems: 'center' }}>
                {params.value}
            </div>
        ),},
        { field: 'Estado',                              headerAlign: 'left',  headerName: 'Estado', width: 80,align: 'left'},
        { field: 'NIF',                                 headerAlign: 'center',  headerName: 'NIF', width: 100 , align: 'center'},
        { field: 'Nombres',                             headerAlign: 'left',  headerName: 'Nombre', width: 180 , align: 'left'},
        { field: 'ApellidoPaterno',                     headerAlign: 'left',  headerName: 'Apellido Paterno', width: 140 , align: 'left'},
        { field: 'ApellidoMaterno',                     headerAlign: 'left',  headerName: 'Apellido Materno', width: 140 , align: 'left'},
        { field: 'CentroCoste',                         headerAlign: 'left',  headerName: 'C. Costo', width: 180 , align: 'left'},
        { field: 'Denominacion',                        headerAlign: 'left',  headerName: 'Denominación', width: 140 , align: 'left'},
        { field: 'NombreProyecto',                      headerAlign: 'left',  headerName: 'Proyecto', width: 160 , align: 'left'},
        { field: 'CodigoProyecto',                      headerAlign: 'center',  headerName: 'Código del Proyecto', width: 180 , align: 'center'},
    ];
  
    const getRowId = (row) => row.TrabajadoresExcel_ID;

    const handleExportarAexcel = () => {
        const adjustedRowsData = rows.map((row) => ({
            'Id.': row.TrabajadoresExcel_ID,
            'Estado': row.Estado,
            'NIF': row.NIF,
            'Nombre': row.Nombres,
            'Apellido Paterno': row.ApellidoPaterno,
            'Apellido Materno': row.ApellidoMaterno,
            'C. Costo': row.CentroCoste,
            'Denominación': row.Denominacion,
            'Proyecto': row.NombreProyecto,
            'Código del Proyecto': row.CodigoProyecto,
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
            <h1 style={{ marginTop: '40px', marginBottom: '40px', marginRight: '700px' }}>Trabajadores</h1>
            <table style={{ borderCollapse: 'collapse' }}>
                <tr>
                    <td style={{ padding: '8px' , textAlign: 'center'}}>
                        {SubidaTrabajadores === 1 ?
                            <img src="/images/EstadoUNO.jpg" width={50} height={50} alt='Estado UNO'/> :
                            <img src="/images/EstadoCERO.jpg" width={50} height={50} alt='Estado CERO'/>}
                    </td>
                    <td style={{ padding: '8px' , textAlign: 'center'}}>
                        {SubidaDescuentosTrabajadores === 1 ?
                            <img src="/images/EstadoUNO.jpg" width={50} height={50} alt='Estado UNO'/> :
                            <img src="/images/EstadoCERO.jpg" width={50} height={50} alt='Estado CERO'/>}
                    </td>
                    <td style={{ padding: '8px' , textAlign: 'center'}}>
                        {SubidaCobroAseguradora === 1 ?
                            <img src="/images/EstadoUNO.jpg" width={50} height={50} alt='Estado UNO'/> :
                            <img src="/images/EstadoCERO.jpg" width={50} height={50} alt='Estado CERO'/>}
                    </td>
                    <td style={{ padding: '8px' , textAlign: 'center'}}>
                        {FacturadoValido === 1 ?
                            <img src="/images/EstadoUNO.jpg" width={50} height={50} alt='Estado UNO'/> :
                            <img src="/images/EstadoCERO.jpg" width={50} height={50} alt='Estado CERO'/>}
                    </td>
                    <td style={{ padding: '8px' , textAlign: 'center'}}>
                        {DistribucionValido === 1 ?
                            <img src="/images/EstadoUNO.jpg" width={50} height={50} alt='Estado UNO'/> :
                            <img src="/images/EstadoCERO.jpg" width={50} height={50} alt='Estado CERO'/>}
                    </td>
                </tr>
                <tr>
                    <td style={{ padding: '8px', color: SubidaTrabajadores === 1 ? 'green' : '#CC0000', fontWeight: 'bold' }}>
                        Trabajadores
                    </td>
                    <td style={{ padding: '8px', color: SubidaDescuentosTrabajadores === 1 ? 'green' : '#CC0000', fontWeight: 'bold' }}>
                        Descuentos
                    </td>
                    <td style={{ padding: '8px', color: SubidaCobroAseguradora === 1 ? 'green' : '#CC0000', fontWeight: 'bold' }}>
                        Aseguradora
                    </td>
                    <td style={{ padding: '8px', color: FacturadoValido === 1 ? 'green' : '#CC0000', fontWeight: 'bold' }}>
                        Facturas
                    </td>
                    <td style={{ padding: '8px', color: DistribucionValido === 1 ? 'green' : '#CC0000', fontWeight: 'bold' }}>
                        Distribuido
                    </td>
                </tr>
            </table>
        </div>
        <h4 style={{ marginTop: '0px', marginBottom: '40px' }}>
            {CantTrabE === null
            ? 'Actualmente no existe información de Trabajadores.'
            : `Existen ${CantTrabE.toLocaleString('en-US')} Trabajadores procesados.`}
        </h4>
        <Box
            display="flex"
            justifyContent="space-between" // Alinea los elementos a los lados
            alignItems="center"
            marginBottom="10px"
            marginLeft="0px"
            marginRight="20px"
            >
            <div style={{ display: 'flex', alignItems: 'center' }}>
                {CodPerfil === '10' || CodPerfil === '3102' ? (
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={openPopup}
                        disabled={!isDataLoaded}
                    >
                        Subir Trabajadores
                    </Button>
                ):null}
                {isPopupOpen && (
                    <div className="popup-background">
                        <CustomModal closeFunction={closePopup} contentComponent={<SubirTrabajadoresExcel closePopup={closePopup} textoNick={textoNick} NombreUsuario={NombreUsuario} CodPerfil={CodPerfil} CorreoUsuario={CorreoUsuario} />} popupWidth={1500} />
                    </div>
                )}
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleExportarAexcel}
                    disabled={!isDataLoaded} // Deshabilitar si rows está vacío
                    style={{ marginLeft: CodPerfil === '10' || CodPerfil === '3102' ? '5px' : '0', }}
                >
                    Exportar a Excel
                </Button>
            </div>
        </Box>
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
            <div className="custom-data-grid-container" style={{ height: '400px', width: '1430px' }}>
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
            />
            </div>
        </div>
        </div>
    );
};

export default TrabajarConTrabajadores;