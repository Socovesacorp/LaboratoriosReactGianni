import React, { useState, useEffect , useCallback , useRef }               from 'react';
import TextField                                    from '@mui/material/TextField';
import { Button, Snackbar , Box}                    from '@mui/material';
import LlamadosApis                                 from '../ManejarDatosApis/LlamadosApis';
import '../../hojas-de-estilo/MantenedorExcels.css';
import filtroFunctions from '../ManejarDatosApis/filtroFunctions'; 

const ABM_PEP = (props) => {
    const {textoNick, NombreUsuario , CodPerfil, CorreoUsuario, Accion, Proyecto_Id , Sociedad_Cod , Proyecto_Nombre , Proyecto_Pep} = props;
    const [openAlertaError, setOpenAlertaError] = useState({ open: false, message: "" }); 
    const [PEP, setPEP] = useState(Proyecto_Pep);
    const [Sociedad, setSociedad] = useState(Sociedad_Cod);
    const [Proyecto, setProyecto] = useState(Proyecto_Nombre);
    const [Titulo, setTitulo] = useState('');
    const [Id, setId] = useState(Proyecto_Id);

    const cargarDatos = async (puedo) => {
        
    };

    const getTitulo = () => {
        switch (Accion) {
            case 1:
                return 'Agregar PEP';
            case 2:
                return 'Editar PEP';
            case 3:
                return 'Eliminar PEP';
            default:
                return 'Título predeterminado';
        }
    };

    useEffect(() => {
        cargarDatos();
        setTitulo(getTitulo());
    }, []);

    const GrabarAccion = async () => {
        const token = await LlamadosApis.ObtenerToken();
        try {
            const CodigoRetornoGuardarPEP = await LlamadosApis.ABM_PEP( token , props.Accion , Id, PEP , Sociedad , Proyecto );
            if(CodigoRetornoGuardarPEP.resultado === 1){
                props.closePopup(1);
            }
            if(CodigoRetornoGuardarPEP.resultado === 2){
                setOpenAlertaError({
                    open: true,
                    message: "La Sociedad digitada NO EXISTE. Favor verificar.",
                });
            }
        } catch (error) {
            setOpenAlertaError({
                open: true,
                message: "*1***Error en Api. Consultar a T.I.",
            });
        }
   
        cargarDatos();
    };

    return (
        <div style={{ marginLeft: '15px' }}>
            <h1 style={{ marginTop: '5px', marginBottom: '40px' }}>{Titulo}</h1>
            <div style={{ marginBottom: '20px' }}>
                <TextField
                    label="Sociedad"
                    onChange={(e) => setSociedad(e.target.value)}
                    value={Sociedad}
                    style={{ width: '120px', marginBottom: '10px'}}
                    InputProps={{
                        readOnly: Accion === 3 ? true : false,
                        style: { color: '#1976d2' } // Personaliza el color aquí
                    }}
                    InputLabelProps={{ 
                        style: { color: '#1976d2' }
                    }}
                    autoComplete="off"
                />
                <TextField
                    label="Nombre del Proyecto"
                    onChange={(e) => setProyecto(e.target.value)}
                    value={Proyecto}
                    style={{ width: '400px', marginBottom: '10px' , marginLeft: '50px'}}
                    InputProps={{
                        readOnly: Accion === 3 ? true : false,
                        style: { color: '#1976d2' } // Personaliza el color aquí
                    }}
                    InputLabelProps={{ 
                        style: { color: '#1976d2' }
                    }}
                    autoComplete="off"
                />
                <TextField
                    label="PEP"
                    onChange={(e) => setPEP(e.target.value)}
                    value={PEP}
                    style={{ width: '400px', marginBottom: '10px' , marginLeft: '50px'}}
                    InputProps={{
                        readOnly: Accion === 3 ? true : false,
                        style: { color: '#1976d2' , textAlign: 'center'} // Personaliza el color aquí
                    }}
                    InputLabelProps={{ 
                        style: { color: '#1976d2' }
                    }}
                    autoComplete="off"
                />
            </div>

            
            <Box
                display="flex"
                justifyContent="space-between" // Alinea los elementos a los lados
                alignItems="center"
                marginTop="40px"
                marginBottom="10px"
                marginLeft="-5px"
                marginRight="20px"
                >
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
    );
};

export default ABM_PEP;