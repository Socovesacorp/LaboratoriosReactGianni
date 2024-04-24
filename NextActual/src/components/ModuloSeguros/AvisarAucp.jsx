import React, { useState, useEffect , useCallback , useRef }               from 'react';
import TextField                                    from '@mui/material/TextField';
import { Button, Snackbar , Box}                    from '@mui/material';
import LlamadosApis                                 from '../ManejarDatosApis/LlamadosApis';
import '../../hojas-de-estilo/MantenedorExcels.css';

const AvisarAucp = (props) => {
    const {textoNick, NombreUsuario , CodPerfil, CorreoUsuario, CorreosEncargadosUCP , CorreosEncargadosSocial} = props;
    
    const GrabarAccion = async () => {
        const token = await LlamadosApis.ObtenerToken();
        try {
            const CodigoRetornoGuardarPEP = await LlamadosApis.GuardarPEP( token , PEP , props.Sociedad_Cod , props.Proyecto_Nombre );
            if(CodigoRetornoGuardarPEP.resultado === 1){
                  setOpenAlertaError({
                    open: true,
                    message: "Se asignó PEP correctamente al Proyecto.",
                });
                props.closePopup(1);
            }
        } catch (error) {
            setOpenAlertaError({
                open: true,
                message: "*1***Error en Api. Consultar a T.I.",
            });
        }
    };

    return (
        <div style={{ marginLeft: '15px' }}>
            <h1 style={{ marginTop: '40px', marginBottom: '40px' }}>un mensaje {CorreoUsuario} {CorreosEncargadosUCP} {CorreosEncargadosSocial}</h1>
            <div style={{ marginBottom: '20px' }}>
                
            </div>

            

                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={GrabarAccion}
                        
                        style={{ marginLeft: '5px' }}
                    >
                        Confirmar
                    </Button>

                </div>
        </div>
    );
};

export default AvisarAucp;