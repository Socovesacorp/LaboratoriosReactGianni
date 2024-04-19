import React, { useState, useEffect , useCallback}  from 'react';
import { DataGrid }                                 from '@mui/x-data-grid';
import { Button, Snackbar , Box}                    from '@mui/material';
import * as XLSX                                    from 'xlsx';
import LlamadosApis                                 from '../ManejarDatosApis/LlamadosApis';
import TrabajarConTrabajadoresHistorico             from './TrabajarConTrabajadoresHistorico';
import TrabajarConDescuentosHistorico               from './TrabajarConDescuentosHistorico';
import TrabajarConCobroAseguradoraHistorico         from './TrabajarConCobroAseguradoraHistorico';
import TrabajarConFacturasHistorico                 from './TrabajarConFacturasHistorico';
import TrabajarConLoFacturadoHistorico              from './TrabajarConLoFacturadoHistorico';
import TrabajarConLaDistribucionHistorico           from './TrabajarConLaDistribucionHistorico';
import CustomActionButton                           from './CustomActionButton';
import ManejoDatosGrillaMaterialUi                  from '../ManejarDatosGrilla/ManejoDatosGrillaMaterialUi';
import { format } from 'date-fns';

import '../../hojas-de-estilo/MantenedorExcels.css';

const TrabajarConHistoricosSeguros = (props) => {
    const {textoNick, NombreUsuario , CodPerfil, CorreoUsuario} = props;
    const [rowSelectionModel, setRowSelectionModel] = useState([]);
    const [rows, setRows] = useState([]);
    const [isDataLoaded, setIsDataLoaded] = useState(false); 
    const [openAlertaError, setOpenAlertaError] = useState(false);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [Accion, setAccion] = useState("");
    const [openAlertaOK, setOpenAlertaOK] = useState({ open: false, message: "" });

    const closePopup = (puedo) => {
        setIsPopupOpen(false);
        if (puedo === 1) {
            setOpenAlertaOK({
                open: true,
                message: "Se ha asignado el PEP correctamente.",
            });
            setRowSelectionModel([]);
        }
        cargarDatos(); 
    };

    const CustomModal = ({ closeFunction, contentComponent, popupWidth }) => {
        const [dragging, setDragging] = useState(false);
        const [posX, setPosX] = useState(0);
        const [posY, setPosY] = useState(0);

        const handleMouseDown = (e) => {
            setDragging(true);
            setPosX(e.clientX - e.target.getBoundingClientRect().left);
            setPosY(e.clientY - e.target.getBoundingClientRect().top);
        };

        const handleMouseUp = () => {
            setDragging(false);
        };

        const handleMouseMove = (e) => {
            if (dragging) {
                const newX = e.clientX - posX;
                const newY = e.clientY - posY;
                e.target.parentNode.style.left = newX + 'px';
                e.target.parentNode.style.top = newY + 'px';
            }
        };

        return (
            <div className="custom-modal" style={{ background: 'white', width: `${popupWidth}px`, position: 'absolute', top: '50px', left: '50px' }} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
                <div className="modal-header" style={{ cursor: 'move' }} onMouseDown={handleMouseDown}>
                <div style={{ height: 20, display: 'flex',  alignItems: 'center' }}>
                </div>
                    <button onClick={closeFunction} style={{
                                position: 'absolute',
                                top: '10px',
                                right: '10px',
                                zIndex: 1,
                                backgroundColor: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '1.5rem',
                                color: '#333',// Color del ícono de cierre
                            }}>
                        &#x2716;
                    </button>
                </div>
                <div className="modal-content" style={{ width: '100%' }}>
                    {contentComponent}
                </div>
            </div>
        );
    };

    const cargarDatos = async () => {
        try {
            const token = await LlamadosApis.ObtenerToken();
            try {
                const data = await LlamadosApis.ObtenerSegurosCabeceras(token);
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

    const handleAction = (actionType) => {
        //console.log(`Row ID: ${id} - Action Type: ${actionType}`);
        if (actionType === 'Trabajadores') {
            setAccion(1)
            setIsPopupOpen(true);
        }
        if (actionType === 'Descuentos') {
            setAccion(2)
            setIsPopupOpen(true);
        }
        if (actionType === 'Cobros') {
            setAccion(3)
            setIsPopupOpen(true);
        }
        if (actionType === 'Facturas') {
            setAccion(4)
            setIsPopupOpen(true);
        }
        if (actionType === 'VisualizarFacturado') {
            setAccion(5)
            setIsPopupOpen(true);
        }
        if (actionType === 'VisualizarDistribuido') {
            setAccion(6)
            setIsPopupOpen(true);
        }        
    };

    const columns = [
        { field: 'Cabecera_ID',                   type: 'number',       headerAlign: 'center',  headerName: 'Id', width: 80 , align: 'center' },
        { field: 'Cabecera_Referencia',                                 headerAlign: 'center',  headerName: 'Periodo Cerrado', width: 170,align: 'center'},
        { field: 'Cabecera_FechaSubida',          type: 'dateTime',     headerAlign: 'center',  headerName: 'Fecha Creación', width: 230 , align: 'center' , valueGetter: (params) => ManejoDatosGrillaMaterialUi.parseDateAndTimeDesdeSQL(params.value),},
        { field: 'Cabecera_NombreUsuarioSubida',                        headerAlign: 'left',  headerName: 'Responsable', width: 240,align: 'left'},
        {
            field: 'acciones',
            headerName: '',
            width: 150,
            align: 'center',
            renderCell: (params) => (
                <CustomActionButton
                    options={[
                        { actionType: 'Trabajadores', imageSrc: '/images/EstadoUNO.jpg', altText: 'Editar', text: 'Trabajadores' },
                        { actionType: 'Descuentos', imageSrc: '/images/EstadoUNO.jpg', altText: 'Eliminar', text: 'Descuentos a Trabajadores' },
                        { actionType: 'Cobros', imageSrc: '/images/EstadoUNO.jpg', altText: 'Eliminar', text: 'Cobros Aseguradora' },
                        { actionType: 'Facturas', imageSrc: '/images/EstadoUNO.jpg', altText: 'Eliminar', text: 'Facturas' },
                        { actionType: 'VisualizarFacturado', imageSrc: '/images/EstadoUNO.jpg', altText: 'Eliminar', text: 'Revisar lo Facturado' },
                        { actionType: 'VisualizarDistribuido', imageSrc: '/images/EstadoUNO.jpg', altText: 'Eliminar', text: 'Revisar lo Distribuido' },
                    ]}
                    onClick={(actionType) => handleAction(actionType)}
                    textoAcciones='Detalle'
                />
            ),
        },
    ];
  
    const getRowId = (row) => row.Cabecera_ID;

    const handleExportarAexcel = () => {
        const adjustedRowsData = rows.map((row) => ({
            Id: row.Cabecera_ID,
            'Fecha de Creación': format(new Date(row.Cabecera_FechaSubida), 'yyyy-MM-dd HH:mm:ss'),
            'Periodo cerrado': row.Cabecera_Referencia,
            'Responsable': row.Cabecera_NombreUsuarioSubida,
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
                <h1 style={{ marginTop: '40px', marginBottom: '40px', marginRight: '45px' }}>Histórico</h1>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <h4 style={{ marginTop: '0px', marginBottom: '40px', marginRight: '45px' }}>Seleccione el Detalle del Periodo a consultar</h4>
            </div>
            {Accion==1 && isPopupOpen && (
                <div className="popup-background">
                    <CustomModal closeFunction={closePopup} contentComponent={<TrabajarConTrabajadoresHistorico closePopup={closePopup} ID ={rowSelectionModel.length > 0 ? rows.find((row) => row.Cabecera_ID === rowSelectionModel[0]).Cabecera_ID : null} PERIODO = {rowSelectionModel.length > 0 ? rows.find((row) => row.Cabecera_ID === rowSelectionModel[0]).Cabecera_Referencia : null} textoNick={textoNick} NombreUsuario={NombreUsuario} CodPerfil={CodPerfil} CorreoUsuario={CorreoUsuario} />} /*popupWidth={1050}*/ />
                </div>
            )}
            {Accion==2 && isPopupOpen && (
                <div className="popup-background">
                    <CustomModal closeFunction={closePopup} contentComponent={<TrabajarConDescuentosHistorico closePopup={closePopup} ID ={rowSelectionModel.length > 0 ? rows.find((row) => row.Cabecera_ID === rowSelectionModel[0]).Cabecera_ID : null} PERIODO = {rowSelectionModel.length > 0 ? rows.find((row) => row.Cabecera_ID === rowSelectionModel[0]).Cabecera_Referencia : null} textoNick={textoNick} NombreUsuario={NombreUsuario} CodPerfil={CodPerfil} CorreoUsuario={CorreoUsuario} />} /*popupWidth={1050}*/ />
                </div>
            )}
            {Accion==3 && isPopupOpen && (
                <div className="popup-background">
                    <CustomModal closeFunction={closePopup} contentComponent={<TrabajarConCobroAseguradoraHistorico closePopup={closePopup} ID ={rowSelectionModel.length > 0 ? rows.find((row) => row.Cabecera_ID === rowSelectionModel[0]).Cabecera_ID : null} PERIODO = {rowSelectionModel.length > 0 ? rows.find((row) => row.Cabecera_ID === rowSelectionModel[0]).Cabecera_Referencia : null} textoNick={textoNick} NombreUsuario={NombreUsuario} CodPerfil={CodPerfil} CorreoUsuario={CorreoUsuario} />} /*popupWidth={1050}*/ />
                </div>
            )}
            {Accion==4 && isPopupOpen && (
                <div className="popup-background">
                    <CustomModal closeFunction={closePopup} contentComponent={<TrabajarConFacturasHistorico closePopup={closePopup} ID ={rowSelectionModel.length > 0 ? rows.find((row) => row.Cabecera_ID === rowSelectionModel[0]).Cabecera_ID : null} PERIODO = {rowSelectionModel.length > 0 ? rows.find((row) => row.Cabecera_ID === rowSelectionModel[0]).Cabecera_Referencia : null} textoNick={textoNick} NombreUsuario={NombreUsuario} CodPerfil={CodPerfil} CorreoUsuario={CorreoUsuario} />} /*popupWidth={1050}*/ />
                </div>
            )}
            {Accion==5 && isPopupOpen && (
                <div className="popup-background">
                    <CustomModal closeFunction={closePopup} contentComponent={<TrabajarConLoFacturadoHistorico closePopup={closePopup} ID ={rowSelectionModel.length > 0 ? rows.find((row) => row.Cabecera_ID === rowSelectionModel[0]).Cabecera_ID : null} PERIODO = {rowSelectionModel.length > 0 ? rows.find((row) => row.Cabecera_ID === rowSelectionModel[0]).Cabecera_Referencia : null} textoNick={textoNick} NombreUsuario={NombreUsuario} CodPerfil={CodPerfil} CorreoUsuario={CorreoUsuario} />} /*popupWidth={1050}*/ />
                </div>
            )}
            {Accion==6 && isPopupOpen && (
                <div className="popup-background">
                    <CustomModal closeFunction={closePopup} contentComponent={<TrabajarConLaDistribucionHistorico closePopup={closePopup} ID ={rowSelectionModel.length > 0 ? rows.find((row) => row.Cabecera_ID === rowSelectionModel[0]).Cabecera_ID : null} PERIODO = {rowSelectionModel.length > 0 ? rows.find((row) => row.Cabecera_ID === rowSelectionModel[0]).Cabecera_Referencia : null} textoNick={textoNick} NombreUsuario={NombreUsuario} CodPerfil={CodPerfil} CorreoUsuario={CorreoUsuario} />} /*popupWidth={1050}*/ />
                </div>
            )}
            <Button
                variant="contained"
                color="primary"
                onClick={handleExportarAexcel}
                style={{ marginLeft: '0px' ,  marginBottom:"5px"}}
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
                <div className="custom-data-grid-container" style={{ height: '400px', width: '900px' }}>
                <DataGrid
                    rows={rows}
                    columns={columns}
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
                            
                            {spaces}
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

export default TrabajarConHistoricosSeguros;