import React, { useState, useEffect , useCallback , useRef }               from 'react';
import TextField                                    from '@mui/material/TextField';
import { Button, Snackbar , Box}                    from '@mui/material';
import LlamadosApis                                 from '../ManejarDatosApis/LlamadosApis';
import '../../hojas-de-estilo/MantenedorExcels.css';
import filtroFunctions from '../ManejarDatosApis/filtroFunctions'; 

const CerrarProceso = (props) => {
    const {textoNick, NombreUsuario , CodPerfil, CorreoUsuario, TodoAlDia} = props;
    const [openAlertaError, setOpenAlertaError] = useState({ open: false, message: "" }); 

    const cargarDatos = async (puedo) => {
        
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    const GrabarAccion = async () => {
        const token = await LlamadosApis.ObtenerToken();
        try {
            const data = await LlamadosApis.CerrarPeriodo( token , textoNick , NombreUsuario);
            if(data.resultado.error !== 0){
                  setOpenAlertaError({
                    open: true,
                    message: data.resultado.descripcionError,
                });
            }
            else{props.closePopupCerrar(1);}
        } catch (error) {
            if (error.response && error.response.data && error.response.data.resultado && error.response.data.resultado.error === 999) {
                setOpenAlertaError({
                    open: true,
                    message: error.response.data.resultado.descripcionError,
                });
            } else {
                setOpenAlertaError({
                    open: true,
                    message: 'Error en Api. Consultar a T.I.' + error,
                });
            }
        }
   
        cargarDatos();
    };

    return (
        <div style={{ marginLeft: '15px' }}>
            <h1 style={{ marginTop: '4px', marginBottom: '40px' }}>Cerrar Proceso Mensual</h1>
            <h4 style={{ marginTop: '0px', marginBottom: '40px' }}>
            {props.TodoAlDia === 1
            ? '¿Confirma finalizar el proceso completo, almacenando toda la información actual en un Histórico y dando inicio a un nuevo periodo?'
            : 'No es posible Finalizar el proceso completo porque existe al menos un estado sin su visto bueno. Verifique.'}
        </h4>
        {props.TodoAlDia === 1 && (
                <>
                    <div style={{ marginBottom: '100px' }}>
                        {/* Contenido que se ejecutará solo si props.TodoAlDia === 1 */}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={GrabarAccion}
                            style={{
                                width: '100%',
                                marginBottom: '10px',
                                display: 'block',
                                marginLeft: '0px',
                                marginRight: '15px',
                            }}
                        >
                            Confirmar
                        </Button>
                        <Snackbar
                            open={openAlertaError.open}
                            autoHideDuration={5000}
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
                    </div>
                </>
            )}
        </div>
    );
};

export default CerrarProceso;