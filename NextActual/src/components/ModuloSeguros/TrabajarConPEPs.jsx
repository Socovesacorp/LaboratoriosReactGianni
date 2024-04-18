import React, { useState, useEffect , useCallback}  from 'react';
import { DataGrid }                                 from '@mui/x-data-grid';
import { Button, Snackbar , Box}                    from '@mui/material';
import * as XLSX                                    from 'xlsx';
import LlamadosApis                                 from '../ManejarDatosApis/LlamadosApis';
import ABM_PEP                                      from './ABM_PEP';
import CustomActionButton                           from './CustomActionButton';
import '../../hojas-de-estilo/MantenedorExcels.css';

const TrabajarConPEPs = (props) => {
    const {textoNick, NombreUsuario , CodPerfil, CorreoUsuario} = props;
    const [rowSelectionModel, setRowSelectionModel] = useState([]);
    const [rows, setRows] = useState([]);
    const [isDataLoaded, setIsDataLoaded] = useState(false); 
    const [openAlertaError, setOpenAlertaError] = useState(false);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [Accion, setAccion] = useState("");
    const [openAlertaOK, setOpenAlertaOK] = useState({ open: false, message: "" });

    const openPopup = (Accion) => {
        setAccion(Accion)
        setIsPopupOpen(true);
    };

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
                const data = await LlamadosApis.ObtenerPEPs(token);
                setRows(data);
                setIsDataLoaded(true);
            } catch (errorObtenerDatos) {
                setOpenAlertaError({
                    open: true,
                    message: "Error en API. Consultar a T.I.",
                });
                console.error('Error al obtener Datos de los PEPs:', errorObtenerDatos);
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

    const handleAction = (id, actionType) => {
        //console.log(`Row ID: ${id} - Action Type: ${actionType}`);
        if (actionType === 'Modificar') {
            openPopup(2);
        }
        if (actionType === 'Eliminar') {
            openPopup(3);
        }
    };

    const columns = [
        { field: 'Proyecto_Id',                                         headerAlign: 'center',  headerName: 'Id', width: 80 , align: 'center' , renderCell: (params) => (
            <div style={{ height: 50, display: 'flex',  alignItems: 'center' }}>
                {params.value}
            </div>
        ),},
        { field: 'Sociedad_Cod',                                        headerAlign: 'center',  headerName: 'Sociedad', width: 100 , align: 'center' },
        { field: 'Proyecto_Nombre',                                     headerAlign: 'left',    headerName: 'Proyecto', width: 300,align: 'left'},
        { field: 'Proyecto_Pep',                                        headerAlign: 'center',  headerName: 'PEP', width: 150,align: 'center'},
    ];

    if (CodPerfil === '10' || CodPerfil === '3101') {
        columns.push({
            field: 'acciones',
            headerName: '',
            width: 150,
            align: 'center',
            renderCell: (params) => (
                <CustomActionButton
                    options={[
                        { actionType: 'Modificar', imageSrc: '/images/Modificar.jpg', altText: 'Editar', text: 'Editar' },
                        { actionType: 'Eliminar', imageSrc: '/images/Eliminar.jpg', altText: 'Eliminar', text: 'Eliminar' },
                    ]}
                    onClick={(actionType) => handleAction(params.row.Proyecto_Id, actionType)}
                    textoAcciones='Acciones'
                />
            ),
        });
    }
  
    const getRowId = (row) => row.Proyecto_Id;

    const handleExportarAexcel = () => {
        const adjustedRowsData = rows.map((row) => ({
            'Id': row.Proyecto_Id,
            'Sociedad': row.Sociedad_Cod,
            'Proyecto': row.Proyecto_Nombre,
            'PEP': row.Proyecto_Pep,
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
                <h1 style={{ marginTop: '40px', marginBottom: '40px', marginRight: '45px' }}>Trabajar con PEPs</h1>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                {CodPerfil === '10' || CodPerfil === '3101' ? (
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => openPopup(1)}
                        disabled={!isDataLoaded}
                    >
                        Agregar
                    </Button>
                ):null}
                {Accion==1 && isPopupOpen && (
                    <div className="popup-background">
                        <CustomModal closeFunction={closePopup} contentComponent={<ABM_PEP closePopup={closePopup} textoNick={textoNick} NombreUsuario={NombreUsuario} CodPerfil={CodPerfil} CorreoUsuario={CorreoUsuario} Accion={1} Proyecto_Id={0} Sociedad_Cod={""} Proyecto_Nombre={""} Proyecto_Pep={""} />} popupWidth={1050} />
                    </div>
                )}
                {Accion==2 && isPopupOpen &&(
                    <div className="popup-background">
                        <CustomModal closeFunction={closePopup} contentComponent={<ABM_PEP closePopup={closePopup} textoNick={textoNick} NombreUsuario={NombreUsuario} CodPerfil={CodPerfil} CorreoUsuario={CorreoUsuario} Accion={2} Proyecto_Id ={rowSelectionModel.length > 0 ? rows.find((row) => row.Proyecto_Id === rowSelectionModel[0]).Proyecto_Id : null} Sociedad_Cod ={rowSelectionModel.length > 0 ? rows.find((row) => row.Proyecto_Id === rowSelectionModel[0]).Sociedad_Cod : null} Proyecto_Nombre={rowSelectionModel.length > 0 ? rows.find((row) => row.Proyecto_Id === rowSelectionModel[0]).Proyecto_Nombre : null} Proyecto_Pep ={rowSelectionModel.length > 0 ? rows.find((row) => row.Proyecto_Id === rowSelectionModel[0]).Proyecto_Pep : null} />} popupWidth={1050} />
                    </div>
                )}
                {Accion==3 && isPopupOpen &&(
                    <div className="popup-background">
                        <CustomModal closeFunction={closePopup} contentComponent={<ABM_PEP closePopup={closePopup} textoNick={textoNick} NombreUsuario={NombreUsuario} CodPerfil={CodPerfil} CorreoUsuario={CorreoUsuario} Accion={3} Proyecto_Id ={rowSelectionModel.length > 0 ? rows.find((row) => row.Proyecto_Id === rowSelectionModel[0]).Proyecto_Id : null} Sociedad_Cod ={rowSelectionModel.length > 0 ? rows.find((row) => row.Proyecto_Id === rowSelectionModel[0]).Sociedad_Cod : null} Proyecto_Nombre={rowSelectionModel.length > 0 ? rows.find((row) => row.Proyecto_Id === rowSelectionModel[0]).Proyecto_Nombre : null} Proyecto_Pep ={rowSelectionModel.length > 0 ? rows.find((row) => row.Proyecto_Id === rowSelectionModel[0]).Proyecto_Pep : null} />} popupWidth={1050} />
                    </div>
                )}
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleExportarAexcel}
                    style={{ marginLeft: CodPerfil === '10' || CodPerfil === '3101' ? '5px' : '0', }}
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
            <div style={{ marginTop: '5px' }}>
                <div className="custom-data-grid-container" style={{ height: '500px', width: '804px' }}>
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

export default TrabajarConPEPs;