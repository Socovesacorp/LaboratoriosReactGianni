import React, { useState , useEffect }              from 'react';
import * as XLSX                                    from 'xlsx';
import { DataGrid }                                 from '@mui/x-data-grid';
import { Button, Snackbar, Input, Box }             from '@mui/material';
import ManejoDatosGrillaMaterialUi                  from '../ManejarDatosGrilla/ManejoDatosGrillaMaterialUi';
import LlamadosApis                                 from '../ManejarDatosApis/LlamadosApis';
import ManejoDatosExcel                             from '../ManejarDatosGrilla/ManejoDatosExcel';
import '../../hojas-de-estilo/MantenedorExcels.css';

const VisualizarCorreo = (props) => {
  const {IdCorreo} = props;
  const [Body, setBody] = useState('Cargando...');
  
  const cargarDatos = async () => {
    try {
        const token = await LlamadosApis.ObtenerToken();
        try {
            const data = await LlamadosApis.ObtenerDatosBodyCorreo(token,props.IdCorreo);
            setBody(data[0].Correo_body);
        } catch (errordata) {
            console.error('Error al obtener Cuerpo del Correo:', errordata);
        }
    } catch (errorToken) {
        console.error('Error al Obtener Token:', errorToken);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  
  return (
    <div style={{ marginLeft: '15px', marginRight: '15px', background: 'white' }}>
      <h1 style={{ marginTop: '20px', marginBottom: '40px' }}></h1>
      <div
        style={{
          maxHeight: '700px',
          maxWidth: '100%', // Establece la altura máxima deseada
          overflowY: 'auto', // Agrega desbordamiento vertical
          overflowX: 'hidden'
        }}
        dangerouslySetInnerHTML={{ __html: Body }}
      />
      <p>&nbsp;</p>
    </div>
  );
};

export default VisualizarCorreo;