// LlamadosApis.jsx

const API_URL = ''; // Reemplaza con la URL correcta de tu API

async function ObtenerToken() {
    try {
        const tokenResponse = await fetch(`${API_URL}/api/ObtenerToken`, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({
            username: 'User_UCP',
            password: 'Cobranz@s_UCP.2023',
            }),
            timeout: 120000, // Establece un timeout de 2 minutos
        });
  
        if (!tokenResponse.ok) {
            console.error('Error de red:', tokenResponse.statusText);
            throw new Error('Error de red al obtener el token');
        }
  
        const tokenData = await tokenResponse.json();
        return tokenData.token;
    } catch (error) {
      console.error('Error desde LlamadosApis, Función ObtenerToken, al intentar obtener el Token:', error);
      throw error;
    }
};
  
async function obtenerFechaMaxima(token) {
    try {
        const response = await fetch(`${API_URL}/api/Flujo/ObtenerMaximaFecha`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            timeout: 120000, // Establece un timeout de 2 minutos
        });
  
        if (response.ok) {
            const data = await response.json();
            if (data.maxFechaInicio) {
                return data.maxFechaInicio;
            } else {
                console.error('Error desde LlamadosApis. Función obtenerFechaMaxima. La respuesta de la API no contiene el campo: maxFechaInicio:', data);
            }
        } else {
            console.error('Error desde LlamadosApis. Función ObtenerFechaMaxima. No se pudo obtenerToken:', response.statusText);
        }
    } catch (error) {
        console.error('Error desde LlamadosApis. Función obtenerFechaMaxima. Error al obtener la fecha máxima:', error);
    }
    return null;
};

const GuardarPEP = async (token,PEP,Sociedad_Cod,Proyecto_Nombre) => {
    try {
        const response = await fetch(`${API_URL}/api/Seguros/GuardarPEP?PEP=${PEP}&Sociedad_Cod=${Sociedad_Cod}&Proyecto_Nombre=${Proyecto_Nombre}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`, // Usar el token obtenido internamente
            },
            timeout: 240000, // Establecer un timeout de 2 minutos (ajustar según tus necesidades)
        });

        if (!response.ok) {
            // Manejar errores de la respuesta de la API aquí
            console.error('Error desde LlamadosApis. Función GuardarPEP:', response.statusText);
            throw new Error('Error en la respuesta de la API');
        }

        const data = await response.json();
        // Devolver los datos obtenidos de la API
        return data;
    } catch (error) {
        // Manejar errores de la solicitud aquí
        console.error('Error desde LlamadosApis. Función GuardarPEP:', error);
        throw error;
    }
};

const ABM_PEP = async (token,Accion,Proyecto_Id,PEP,Sociedad_Cod,Proyecto_Nombre) => {
    try {
        const response = await fetch(`${API_URL}/api/Seguros/ABM_PEP?Proyecto_Id=${Proyecto_Id}&Accion=${Accion}&PEP=${PEP}&Sociedad_Cod=${Sociedad_Cod}&Proyecto_Nombre=${Proyecto_Nombre}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`, // Usar el token obtenido internamente
            },
            timeout: 240000, // Establecer un timeout de 2 minutos (ajustar según tus necesidades)
        });

        if (!response.ok) {
            // Manejar errores de la respuesta de la API aquí
            console.error('Error desde LlamadosApis. Función GuardarPEP:', response.statusText);
            throw new Error('Error en la respuesta de la API');
        }

        const data = await response.json();
        // Devolver los datos obtenidos de la API
        return data;
    } catch (error) {
        // Manejar errores de la solicitud aquí
        console.error('Error desde LlamadosApis. Función GuardarPEP:', error);
        throw error;
    }
};

const ABM_SOCIEDAD = async (token,Accion,Sociedad_Id , Sociedad_Cod , Sociedad_RazonSocial , Sociedad_Rut , Sociedad_Dv) => {
    try {
        const response = await fetch(`${API_URL}/api/Seguros/ABM_SOCIEDAD?Sociedad_Id=${Sociedad_Id}&Accion=${Accion}&Sociedad_Cod=${Sociedad_Cod}&Sociedad_RazonSocial=${Sociedad_RazonSocial}&Sociedad_Rut=${Sociedad_Rut}&Sociedad_Dv=${Sociedad_Dv}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`, // Usar el token obtenido internamente
            },
            timeout: 240000, // Establecer un timeout de 2 minutos (ajustar según tus necesidades)
        });

        if (!response.ok) {
            // Manejar errores de la respuesta de la API aquí
            console.error('Error desde LlamadosApis. Función GuardarSociedad:', response.statusText);
            throw new Error('Error en la respuesta de la API');
        }

        const data = await response.json();
        // Devolver los datos obtenidos de la API
        return data;
    } catch (error) {
        // Manejar errores de la solicitud aquí
        console.error('Error desde LlamadosApis. Función GuardarSociedad:', error);
        throw error;
    }
};

const ValidarYguardarCentroDeCosto = async (token,CentroCosto,IdExcel,Descuento1oAporte2) => {
    try {
        const response = await fetch(`${API_URL}/api/Seguros/ValidarYguardarCentroDeCosto?CentroDeCosto=${CentroCosto}&IdExcel=${IdExcel}&Descuento1oAporte2=${Descuento1oAporte2}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`, // Usar el token obtenido internamente
            },
            timeout: 240000, // Establecer un timeout de 2 minutos (ajustar según tus necesidades)
        });

        if (!response.ok) {
            // Manejar errores de la respuesta de la API aquí
            console.error('Error desde LlamadosApis. Función ValidarYguardarCentroDeCosto:', response.statusText);
            throw new Error('Error en la respuesta de la API');
        }

        const data = await response.json();
        // Devolver los datos obtenidos de la API
        return data;
    } catch (error) {
        // Manejar errores de la solicitud aquí
        console.error('Error desde LlamadosApis. Función ValidarYguardarCentroDeCosto:', error);
        throw error;
    }
};

const buscarSugerenciasSolicitanteDesdeAPI = async (solicitanteIngresado) => {
    try {
        // Obtener el token internamente
        const token = await ObtenerToken();

        // Hacer una solicitud a tu API para obtener sugerencias de nombres
        const response = await fetch(`${API_URL}/api/Flujo/buscarSugerenciasDeSolicitantes?nombre=${solicitanteIngresado}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`, // Usar el token obtenido internamente
            },
            timeout: 240000, // Establecer un timeout de 2 minutos (ajustar según tus necesidades)
        });

        if (!response.ok) {
            // Manejar errores de la respuesta de la API aquí
            console.error('Error desde LlamadosApis. Función buscarSugerenciasSolicitanteDesdeApi:', response.statusText);
            throw new Error('Error en la respuesta de la API');
        }

        const data = await response.json();
        // Devolver los datos obtenidos de la API
        return data;
    } catch (error) {
        // Manejar errores de la solicitud aquí
        console.error('Error desde LlamadosApis. Función buscarSugerenciasSolicitanteDesdeApi:', error);
        throw error;
    }
};

const buscarSugerenciasBeneficiarioDesdeAPI = async (beneficiarioIngresado) => {
    try {
        // Obtener el token internamente
        const token = await ObtenerToken();

        // Hacer una solicitud a tu API para obtener sugerencias de nombres
        const response = await fetch(`${API_URL}/api/Flujo/buscarSugerenciasDeBeneficiarios?nombre=${beneficiarioIngresado}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`, // Usar el token obtenido internamente
            },
            timeout: 240000, // Establecer un timeout de 2 minutos (ajustar según tus necesidades)
        });

        if (!response.ok) {
            // Manejar errores de la respuesta de la API aquí
            console.error('Error desde LlamadosApis. Función buscarSugerenciasBeneficiarioDesdeApi:', response.statusText);
            throw new Error('Error en la respuesta de la API');
        }

        const data = await response.json();
        // Devolver los datos obtenidos de la API
        return data;
    } catch (error) {
        // Manejar errores de la solicitud aquí
        console.error('Error desde LlamadosApis. Función buscarSugerenciasBeneficiarioDesdeApi:', error);
        throw error;
    }
};

const ObtenerEmpresaYnombreDadoIDexcel = async (token,IdIngresado,Descuento1oAporte2) => {
    try {
        // Hacer una solicitud a tu API para obtener sugerencias de nombres
        const response = await fetch(`${API_URL}/api/Seguros/ObtenerEmpresaYnombreDadoIDexcel?ID=${IdIngresado}&Descuento1oAporte2=${Descuento1oAporte2}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`, // Usar el token obtenido internamente
            },
            timeout: 240000, // Establecer un timeout de 2 minutos (ajustar según tus necesidades)
        });

        if (!response.ok) {
            // Manejar errores de la respuesta de la API aquí
            console.error('Error desde LlamadosApis. Función ObtenerEmpresaYnombreDadoIDexcel:', response.statusText);
            throw new Error('Error en la respuesta de la API');
        }

        const data = await response.json();
        // Devolver los datos obtenidos de la API
        return data;
    } catch (error) {
        // Manejar errores de la solicitud aquí
        console.error('Error desde LlamadosApis. Función ObtenerEmpresaYnombreDadoIDexcel:', error);
        throw error;
    }
};

const ObtenerEstadoSubidaExcel = async (token) => {
    try {
        // Hacer una solicitud a tu API para obtener sugerencias de nombres
        const response = await fetch(`${API_URL}/api/Seguros/ObtenerEstadoSubidaExcel`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`, // Usar el token obtenido internamente
            },
            timeout: 240000, // Establecer un timeout de 2 minutos (ajustar según tus necesidades)
        });

        if (!response.ok) {
            // Manejar errores de la respuesta de la API aquí
            console.error('Error desde LlamadosApis. Función ObtenerEstadoSubidaExcel:', response.statusText);
            throw new Error('Error en la respuesta de la API ObtenerEstadoSubidaExcel');
        }

        const data = await response.json();
        // Devolver los datos obtenidos de la API
        return data;
    } catch (error) {
        // Manejar errores de la solicitud aquí
        console.error('Error desde LlamadosApis. Función ObtenerEstadoSubidaExcel:', error);
        throw error;
    }
};

const buscarSugerenciasCentroDeCostoDesdeAPI = async (CentroDeCostoIngresado) => {
    try {
        // Obtener el token internamente
        const token = await ObtenerToken();

        // Hacer una solicitud a tu API para obtener sugerencias de nombres
        const response = await fetch(`${API_URL}/api/Seguros/buscarSugerenciasDeCentroDeCosto?CentroDeCosto=${CentroDeCostoIngresado}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`, // Usar el token obtenido internamente
            },
            timeout: 240000, // Establecer un timeout de 2 minutos (ajustar según tus necesidades)
        });

        if (!response.ok) {
            // Manejar errores de la respuesta de la API aquí
            console.error('Error desde LlamadosApis. Función buscarSugerenciasCentroDeCostoIngresadoDesdeApi:', response.statusText);
            throw new Error('Error en la respuesta de la API');
        }

        const data = await response.json();
        // Devolver los datos obtenidos de la API
        return data;
    } catch (error) {
        // Manejar errores de la solicitud aquí
        console.error('Error desde LlamadosApis. Función buscarSugerenciasCentroDeCostoIngresadoDesdeApi:', error);
        throw error;
    }
};

const buscarSugerenciasTareaDesdeAPI = async (tareaIngresado) => {
    try {
        // Obtener el token internamente
        const token = await ObtenerToken();

        // Hacer una solicitud a tu API para obtener sugerencias de nombres
        const response = await fetch(`${API_URL}/api/Flujo/buscarSugerenciasDeTareas?nombre=${tareaIngresado}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`, // Usar el token obtenido internamente
            },
            timeout: 240000, // Establecer un timeout de 2 minutos (ajustar según tus necesidades)
        });

        if (!response.ok) {
            // Manejar errores de la respuesta de la API aquí
            console.error('Error desde LlamadosApis. Función buscarSugerenciasTareaDesdeApi:', response.statusText);
            throw new Error('Error en la respuesta de la API');
        }

        const data = await response.json();
        // Devolver los datos obtenidos de la API
        return data;
    } catch (error) {
        // Manejar errores de la solicitud aquí
        console.error('Error desde LlamadosApis. Función buscarSugerenciasTareaDesdeApi:', error);
        throw error;
    }
};

const ObtenerDatosSolicitudes = async (token, folioFiltro, nombreSolicitanteFiltro, tareaFiltro, nombreBeneficiarioFiltro) => {
    if (
        (folioFiltro.trim() !== '' && folioFiltro !== '0') ||
        nombreSolicitanteFiltro.trim() !== '' ||
        tareaFiltro.trim() !== '' ||
        nombreBeneficiarioFiltro.trim() !== ''
    ) {
        try {
            const queryParams = new URLSearchParams();
            if (folioFiltro.trim() !== '' && folioFiltro !== '0') {
                queryParams.append('FOLIO', folioFiltro);
            }
            if (nombreSolicitanteFiltro.trim() !== '') {
                queryParams.append('NOMBREAUTOMATICO_SOLICITANTE', nombreSolicitanteFiltro);
            }
            if (tareaFiltro.trim() !== '') {
                queryParams.append('TAREA', tareaFiltro);
            }
            if (nombreBeneficiarioFiltro.trim() !== '') {
                queryParams.append('NOMBRE_BENEFICIARIO', nombreBeneficiarioFiltro);
            }
            const queryString = queryParams.toString();
            const dataResponse = await fetch(`${API_URL}/api/Flujo/ObtenerSolicitudes?${queryString}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                timeout: 120000, // Establece un timeout de 2 minutos
            });
            if (!dataResponse.ok) {
                console.error('Error de red:', dataResponse.statusText);
                throw new Error('Error de red al obtener los datos');
            }else{
                const data = await dataResponse.json();
                return data;
            }
        } catch (error) {
            console.error('Error al obtener datos:', error);
            throw error;
        }
    }
};

const ObtenerDatosCabeceras = async (token) => {
    try {
        const dataResponse = await fetch(`${API_URL}/api/Sap/ObtenerCabeceras`, {
            headers: {
            Authorization: `Bearer ${token}`,
            },
            timeout: 120000, // Establece un timeout de 2 minutos
        });

        if (!dataResponse.ok) {
            console.error('Error de red:', dataResponse.statusText);
            throw new Error('Error de red al obtener los datos de prueba');
        }else{                
            const data = await dataResponse.json();
            return data;
        }
    } catch (error) {
        console.error('Error al obtener datos:', error);
        throw error;
    }
};



const DevolverCorreo = async ( token, row, updatedRow, attempt ) => {
    //console.log('recibi: '+row['Referencia'])
    //if (row['Referencia'] !== undefined) {
        try {
            const correoResponse = await fetch(`${API_URL}/api/Flujo/DevolverCorreo`, {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ FOLIO: row['Referencia'].trim() }),
            });
    
            if (correoResponse.ok) {
                const correoData = await correoResponse.json();
                updatedRow.CORREO_SOLICITANTE = correoData.correo;
                updatedRow.Encontrado = correoData.correo.length > 0 ? "Si" : "NO";
            } else {
                // Si quedan intentos, reintenta después de 1 segundo
                if (attempt < 20) {
                await new Promise((resolve) => setTimeout(resolve, 100));
                console.log(`******Intento para folio ${row['Referencia']} (intentos restantes: ${20 - attempt})`);
                await DevolverCorreo(token, row, updatedRow, attempt + 1);
                }
            }
        } catch (error) {
            console.error(`******Error al obtener el correo para el folio ${row['Referencia']} (intentos restantes: ${20 - attempt}): ${error}`);
            // Si quedan intentos, reintenta después de 1 segundo
            if (attempt < 20) {
                await new Promise((resolve) => setTimeout(resolve, 100));
                await DevolverCorreo( token, row, updatedRow, attempt + 1);
            }
        }
    //}
};

const CrearSapCabecera = async ( token, dataToCreateCabecera) => {
    try {
        const response = await fetch(`${API_URL}/api/Sap/CrearCabecera`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dataToCreateCabecera),
        });

        if (!response.ok) {
        console.error('Error:', response.statusText);
        throw new Error('Error al crear la cabecera SAP');
        }

        const responseData = await response.json();
        const cabeceraId = responseData.Cabecera_Id;

        return cabeceraId;
    } catch (error) {
        console.error('****gianniError al crear la cabecera SAP:', error);
        throw error;
    }
};

const CrearCorreosParaCabecera = async ( token, dataToCreateCorreos) => {
    try {
        
        const response = await fetch(`${API_URL}/api/Sap/CrearCorreos`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dataToCreateCorreos),
        });

        if (!response.ok) {
        console.error('Error:', response.statusText);
        throw new Error('Error al crear los Correos de Una Cabecera:');
        }

        const responseData = await response.json();

        return responseData.CodigoRetorno;
    } catch (error) {
        console.error('****gianniError al crear la Correos para Una Cabecera:', error);
        throw error;
    }
};

const CrearAvisoAgerente = async ( token, dataToUpdateGerente) => {
    try {
        const response = await fetch(`${API_URL}/api/Sap/AvisarAgerente`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dataToUpdateGerente),
        });

        if (!response.ok) {
        console.error('Error:', response.statusText);
        throw new Error('Error al intentar copiar al Gerente en los correos');
        }

        const responseData = await response.json();

        return responseData.CodigoRetorno;
    } catch (error) {
        console.error('****gianniError al intentar copiar al Gerente en los correos:', error);
        throw error;
    }
};

const SubirSapDetalle = async (token, batch) => {
    try {
      const datosSapResponse = await fetch(
        `${API_URL}/api/Sap/SubirSapDetalle`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(batch),
        }
      );
  
      if (!datosSapResponse.ok) {
        console.error('Error de red:', datosSapResponse.statusText);
        throw new Error('Error de red al crear los datos de prueba');
      }
    } catch (error) {
      console.error('Error al enviar datos:', error);
      throw error;
    }
};

const ObtenerDatosCorreosParaCabecera = async (token, Cabecera_Id) => {
    try {
            const dataResponse = await fetch(`${API_URL}/api/Sap/ObtenerCorreosParaCabecera?Cabecera_Id=${Cabecera_Id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            timeout: 120000, // Establece un timeout de 2 minutos
        });
        if (!dataResponse.ok) {
            console.error('Error de red:', dataResponse.statusText);
            throw new Error('Error de red al obtener los datos');
        }else{
            const data = await dataResponse.json();
            return data;
        }
    } catch (error) {
        console.error('Error al obtener datos:', error);
        throw error;
    }
};


const ObtenerDatosBodyCorreo = async (token, Correo_Id) => {
    try {
            const dataResponse = await fetch(`${API_URL}/api/Sap/ObtenerBodyCorreo?Correo_Id=${Correo_Id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            timeout: 120000, // Establece un timeout de 2 minutos
        });
        if (!dataResponse.ok) {
            console.error('Error de red:', dataResponse.statusText);
            throw new Error('Error de red al obtener los datos');
        }else{
            const data = await dataResponse.json();
            return data;
        }
    } catch (error) {
        console.error('Error al obtener datos:', error);
        throw error;
    }
};

const EnviarCorreoValidado = async ( token, Correo_ID , attempt ) => {
    try {
        const response = await fetch(`${API_URL}/api/Sap/EnviarCorreo`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ Correo_ID: Correo_ID }),
        });

        if (!response.ok) {
            if (attempt < 20){
                await new Promise((resolve) => setTimeout(resolve, 100));
                await EnviarCorreoValidado(token, Correo_ID, attempt + 1);
            }
        }
    } catch (error) {
        console.error('****gianniError al actualizar el estado del correo:', error);
        if (attempt < 20) {
            await new Promise((resolve) => setTimeout(resolve, 100));
            await EnviarCorreoValidado(token, Correo_ID, attempt + 1);
        }
    }
};

const ObtenerDatosTrabajadoresExcel = async (token) => {
    try {
        const dataResponse = await fetch(`${API_URL}/api/Seguros/ObtenerTrabajadoresExcel`, {
            headers: {
            Authorization: `Bearer ${token}`,
            },
            timeout: 120000, // Establece un timeout de 2 minutos
        });

        if (!dataResponse.ok) {
            console.error('Error de red:', dataResponse.statusText);
            throw new Error('Error de red al obtener los datos de los Trabajadores');
        }else{                
            const data = await dataResponse.json();
            return data;
        }
    } catch (error) {
        console.error('Error al obtener datos de los Trabajadores:', error);
        throw error;
    }
};

const ObtenerDatosTrabajadores = async (token,Cabecera_Id) => {
    try {
        const dataResponse = await fetch(`${API_URL}/api/Seguros/ObtenerTrabajadores?Cabecera_Id=${Cabecera_Id}`, {
            headers: {
            Authorization: `Bearer ${token}`,
            },
            timeout: 120000, // Establece un timeout de 2 minutos
        });
        if (!dataResponse.ok) {
            console.error('Error de red:', dataResponse.statusText);
            throw new Error('Error de red al obtener los datos de los Trabajadores');
        }else{                
            const data = await dataResponse.json();
            return data;
        }
    } catch (error) {
        console.error('Error al obtener datos de los Trabajadores:', error);
        throw error;
    }
};

const ObtenerSociedadesFacturadasExcel = async (token) => {
    try {
        const dataResponse = await fetch(`${API_URL}/api/Seguros/ObtenerSociedadesFacturadasExcel`, {
            headers: {
            Authorization: `Bearer ${token}`,
            },
            timeout: 120000, // Establece un timeout de 2 minutos
        });

        if (!dataResponse.ok) {
            console.error('Error de red:', dataResponse.statusText);
            throw new Error('Error de red al obtener los datos de las SociedadesFacturadasExcel');
        }else{                
            const data = await dataResponse.json();
            return data;
        }
    } catch (error) {
        console.error('Error al obtener datos de las SociedadesFacturadasExcel:', error);
        throw error;
    }
};

const ObtenerSociedadesFacturadasH = async (token,Cabecera_Id) => {
    try {
        const dataResponse = await fetch(`${API_URL}/api/Seguros/ObtenerSociedadesFacturadasH?Cabecera_Id=${Cabecera_Id}`, {
            headers: {
            Authorization: `Bearer ${token}`,
            },
            timeout: 120000, // Establece un timeout de 2 minutos
        });

        if (!dataResponse.ok) {
            console.error('Error de red:', dataResponse.statusText);
            throw new Error('Error de red al obtener los datos de las SociedadesFacturadasH');
        }else{                
            const data = await dataResponse.json();
            return data;
        }
    } catch (error) {
        console.error('Error al obtener datos de las SociedadesFacturadasH:', error);
        throw error;
    }
};

const ObtenerDistribucionesExcel = async (token) => {
    try {
        const dataResponse = await fetch(`${API_URL}/api/Seguros/ObtenerDistribucionesExcel`, {
            headers: {
            Authorization: `Bearer ${token}`,
            },
            timeout: 120000, // Establece un timeout de 2 minutos
        });

        if (!dataResponse.ok) {
            console.error('Error de red:', dataResponse.statusText);
            throw new Error('Error de red al obtener los datos de las DistribucionesExcel');
        }else{                
            const data = await dataResponse.json();
            return data;
        }
    } catch (error) {
        console.error('Error al obtener datos de las DistribucionesExcel:', error);
        throw error;
    }
};

const ObtenerDistribuciones = async (token,Cabecera_Id) => {
    try {
        const dataResponse = await fetch(`${API_URL}/api/Seguros/ObtenerDistribuciones?Cabecera_Id=${Cabecera_Id}`, {
            headers: {
            Authorization: `Bearer ${token}`,
            },
            timeout: 120000,
        });

        if (!dataResponse.ok) {
            console.error('Error de red:', dataResponse.statusText);
            throw new Error('Error de red al obtener los datos de las Distribuciones');
        }else{                
            const data = await dataResponse.json();
            return data;
        }
    } catch (error) {
        console.error('Error al obtener datos de las Distribuciones:', error);
        throw error;
    }
};

const ObtenerPEPs = async (token) => {
    try {
        const dataResponse = await fetch(`${API_URL}/api/Seguros/ObtenerPEPs`, {
            headers: {
            Authorization: `Bearer ${token}`,
            },
            timeout: 120000, // Establece un timeout de 2 minutos
        });

        if (!dataResponse.ok) {
            console.error('Error de red:', dataResponse.statusText);
            throw new Error('Error de red al obtener los datos de los PEPs');
        }else{                
            const data = await dataResponse.json();
            return data;
        }
    } catch (error) {
        console.error('Error al obtener datos de los PEPs:', error);
        throw error;
    }
};

const ObtenerSociedades = async (token) => {
    try {
        const dataResponse = await fetch(`${API_URL}/api/Seguros/ObtenerSociedades`, {
            headers: {
            Authorization: `Bearer ${token}`,
            },
            timeout: 120000, // Establece un timeout de 2 minutos
        });

        if (!dataResponse.ok) {
            console.error('Error de red:', dataResponse.statusText);
            throw new Error('Error de red al obtener los datos de las Sociedades');
        }else{                
            const data = await dataResponse.json();
            return data;
        }
    } catch (error) {
        console.error('Error al obtener datos de las Sociedades:', error);
        throw error;
    }
};

async function obtenerCantidadTrabajadoresExcel(token) {
    try {
        const response = await fetch(`${API_URL}/api/Seguros/ObtenerCantidadTrabajadoresExcel`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            timeout: 120000, // Establece un timeout de 2 minutos
        });
  
        if (response.ok) {
            const data = await response.json();
            if (data.CantidadTrabajadoresExcel) {
                return data.CantidadTrabajadoresExcel;
            } else {
                console.error('Error desde LlamadosApis. Función ObtenerCantidadTrabajadoresExcel. La respuesta de la API no contiene el campo: CantidadTrabajadoresExcel:', data);
            }
        } else {
            console.error('Error desde LlamadosApis. Función ObtenerCantidadTrabajadoresExcel. No se pudo obtenerToken:', response.statusText);
        }
    } catch (error) {
        console.error('Error desde LlamadosApis. Función ObtenerCantidadTrabajadoresExcel. Error al obtener la cantidad de Trabajadores en Excel:', error);
    }
    return null;
}

async function ObtenerCantidadTrabajadores(token,Cabecera_Id) {
    try {
        const response = await fetch(`${API_URL}/api/Seguros/ObtenerCantidadTrabajadores?Cabecera_Id=${Cabecera_Id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            timeout: 120000, // Establece un timeout de 2 minutos
        });
  
        if (response.ok) {
            const data = await response.json();
            if (data.CantidadTrabajadores) {
                return data.CantidadTrabajadores;
            } else {
                console.error('Error desde LlamadosApis. Función ObtenerCantidadTrabajadores. La respuesta de la API no contiene el campo: CantidadTrabajadoresExcel:', data);
            }
        } else {
            console.error('Error desde LlamadosApis. Función ObtenerCantidadTrabajadores. No se pudo obtenerToken:', response.statusText);
        }
    } catch (error) {
        console.error('Error desde LlamadosApis. Función ObtenerCantidadTrabajadores. Error al obtener la cantidad de Trabajadores en Excel:', error);
    }
    return null;
}

async function ObtenerCantidadSociedadesFacturadas(token) {
    try {
        const response = await fetch(`${API_URL}/api/Seguros/ObtenerCantidadSociedadesFacturadas`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            timeout: 120000, // Establece un timeout de 2 minutos
        });
  
        if (response.ok) {
            const data = await response.json();
            if (data.CantidadSociedadesFacturadas) {
                return data.CantidadSociedadesFacturadas;
            } else {
                console.error('Error desde LlamadosApis. Función ObtenerCantidadSociedadesFacturadas. La respuesta de la API no contiene el campo: CantidadSociedadesFacturadas:', data);
            }
        } else {
            console.error('Error desde LlamadosApis. Función ObtenerCantidadSociedadesFacturadas. No se pudo obtenerToken:', response.statusText);
        }
    } catch (error) {
        console.error('Error desde LlamadosApis. Función ObtenerCantidadSociedadesFacturadas. Error al obtener la CantidadSociedadesFacturadas:', error);
    }
    return null;
}

async function ObtenerCantidadSociedadesFacturadasH(token,Cabecera_Id) {
    try {
        const response = await fetch(`${API_URL}/api/Seguros/ObtenerCantidadSociedadesFacturadasH?Cabecera_Id=${Cabecera_Id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            timeout: 120000, // Establece un timeout de 2 minutos
        });
  
        if (response.ok) {
            const data = await response.json();
            if (data.CantidadSociedadesFacturadas) {
                return data.CantidadSociedadesFacturadas;
            } else {
                console.error('Error desde LlamadosApis. Función ObtenerCantidadSociedadesFacturadasH. La respuesta de la API no contiene el campo: CantidadSociedadesFacturadas:', data);
            }
        } else {
            console.error('Error desde LlamadosApis. Función ObtenerCantidadSociedadesFacturadasH. No se pudo obtenerToken:', response.statusText);
        }
    } catch (error) {
        console.error('Error desde LlamadosApis. Función ObtenerCantidadSociedadesFacturadasH. Error al obtener la CantidadSociedadesFacturadas:', error);
    }
    return null;
}

async function EliminarTrabajadoresExcel(token) {
    try {
        const response = await fetch(`${API_URL}/api/Seguros/EliminarTrabajadoresExcel`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            timeout: 120000, // Establece un timeout de 2 minutos
        });
  
        if (response.ok) {
            const data = await response.json();
            if (data.message) {
                return data.message;
            } else {
                console.error('Error desde LlamadosApis. Función EliminarTrabajadoresExcel:', data);
            }
        } else {
            console.error('Error desde LlamadosApis. Función EliminarTrabajadoresExcel. No se pudo obtenerToken:', response.statusText);
        }
    } catch (error) {
        console.error('Error desde LlamadosApis. Función EliminarTrabajadoresExcel. Error al truncar Trabajadores en Excel:', error);
    }
    return null;
}

async function EliminarFacturasExcel(token) {
    try {
        const response = await fetch(`${API_URL}/api/Seguros/EliminarFacturasExcel`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            timeout: 120000, // Establece un timeout de 2 minutos
        });
  
        if (response.ok) {
            const data = await response.json();
            if (data.message) {
                return data.message;
            } else {
                console.error('Error desde LlamadosApis. Función EliminarFacturasExcel:', data);
            }
        } else {
            console.error('Error desde LlamadosApis. Función EliminarFacturasExcel. No se pudo obtenerToken:', response.statusText);
        }
    } catch (error) {
        console.error('Error desde LlamadosApis. Función EliminarFacturasExcel. Error al truncar Trabajadores en Excel:', error);
    }
    return null;
}

const ObtenerDatosDescuentosExcel_Existe = async (token) => {
    try {
        const dataResponse = await fetch(`${API_URL}/api/Seguros/ObtenerDescuentosExcel_Existe`, {
            headers: {
            Authorization: `Bearer ${token}`,
            },
            timeout: 120000, // Establece un timeout de 2 minutos
        });

        if (!dataResponse.ok) {
            console.error('Error de red:', dataResponse.statusText);
            throw new Error('Error de red al obtener los datos de los Descuentos Excel_Existe');
        }else{                
            const data = await dataResponse.json();
            return data;
        }
    } catch (error) {
        console.error('Error al obtener datos de los Descuentos Excel_Existe:', error);
        throw error;
    }
};

const ObtenerDatosDescuentos = async (token,Cabecera_Id) => {
    try {
        const dataResponse = await fetch(`${API_URL}/api/Seguros/ObtenerDescuentos?Cabecera_Id=${Cabecera_Id}`, {
            headers: {
            Authorization: `Bearer ${token}`,
            },
            timeout: 120000, // Establece un timeout de 2 minutos
        });

        if (!dataResponse.ok) {
            console.error('Error de red:', dataResponse.statusText);
            throw new Error('Error de red al obtener los datos de los Descuentos');
        }else{                
            const data = await dataResponse.json();
            return data;
        }
    } catch (error) {
        console.error('Error al obtener datos de los Descuentos:', error);
        throw error;
    }
};

const ObtenerDatosFacturasExcel = async (token) => {
    try {
        const dataResponse = await fetch(`${API_URL}/api/Seguros/ObtenerFacturasExcel`, {
            headers: {
            Authorization: `Bearer ${token}`,
            },
            timeout: 120000, // Establece un timeout de 2 minutos
        });

        if (!dataResponse.ok) {
            console.error('Error de red:', dataResponse.statusText);
            throw new Error('Error de red al obtener los datos de las Facturas Excel');
        }else{                
            const data = await dataResponse.json();
            return data;
        }
    } catch (error) {
        console.error('Error al obtener datos de las Facturas Excel:', error);
        throw error;
    }
};

const ObtenerDatosFacturas = async (token,Cabecera_Id) => {
    try {
        const dataResponse = await fetch(`${API_URL}/api/Seguros/ObtenerFacturas?Cabecera_Id=${Cabecera_Id}`, {
            headers: {
            Authorization: `Bearer ${token}`,
            },
            timeout: 120000, // Establece un timeout de 2 minutos
        });

        if (!dataResponse.ok) {
            console.error('Error de red:', dataResponse.statusText);
            throw new Error('Error de red al obtener los datos de las Facturas');
        }else{                
            const data = await dataResponse.json();
            return data;
        }
    } catch (error) {
        console.error('Error al obtener datos de las Facturas:', error);
        throw error;
    }
};

const ObtenerDatosDescuentosExcelAgrupados = async (token) => {
    try {
        const dataResponse = await fetch(`${API_URL}/api/Seguros/ObtenerDescuentosExcelAgrupados`, {
            headers: {
            Authorization: `Bearer ${token}`,
            },
            timeout: 120000, // Establece un timeout de 2 minutos
        });

        if (!dataResponse.ok) {
            console.error('Error de red:', dataResponse.statusText);
            throw new Error('Error de red al obtener los datos de los Descuentos Excel Agrupados');
        }else{                
            const data = await dataResponse.json();
            return data;
        }
    } catch (error) {
        console.error('Error al obtener datos de los Descuentos Excel Agrupados:', error);
        throw error;
    }
};

const ObtenerDatosDescuentosAgrupados = async (token,Cabecera_Id) => {
    try {
        const dataResponse = await fetch(`${API_URL}/api/Seguros/ObtenerDescuentosAgrupados?Cabecera_Id=${Cabecera_Id}`, {
            headers: {
            Authorization: `Bearer ${token}`,
            },
            timeout: 120000, // Establece un timeout de 2 minutos
        });

        if (!dataResponse.ok) {
            console.error('Error de red:', dataResponse.statusText);
            throw new Error('Error de red al obtener los datos de los Descuentos Agrupados');
        }else{                
            const data = await dataResponse.json();
            return data;
        }
    } catch (error) {
        console.error('Error al obtener datos de los Descuentos Agrupados:', error);
        throw error;
    }
};

const CerrarPeriodo = async (token,NICK,USUARIO) => {
    try {
        const dataResponse = await fetch(`${API_URL}/api/Seguros/CerrarPeriodo?NICK=${NICK}&USUARIO=${USUARIO}`, {
            headers: {
            Authorization: `Bearer ${token}`,
            },
            timeout: 120000, // Establece un timeout de 2 minutos
        });
        //Comenté cuando la api da error porque se controla en el programa con un código 999 (que es cuando sql arroja error)
        //if (!dataResponse.ok) {
            //console.error('Error de red:', dataResponse.statusText);
            //throw new Error('Error de red al Cerrar un Periodo');
        //}else{                
            const data = await dataResponse.json();
            return data;
        //}
    } catch (error) {
        console.error('Error al cerrar un periodo:', error);
        throw error;
    }
};

async function obtenerCantidadDescuentosExcel(token) {
    try {
        const response = await fetch(`${API_URL}/api/Seguros/ObtenerCantidadDescuentosExcel`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            timeout: 120000, // Establece un timeout de 2 minutos
        });
  
        if (response.ok) {
            const data = await response.json();
            if (data.CantidadDescuentosExcel) {
                return data.CantidadDescuentosExcel;
            } else {
                console.error('Error desde LlamadosApis. Función ObtenerCantidadDescuentosExcel. La respuesta de la API no contiene el campo: CantidadDescuentosExcel:', data);
            }
        } else {
            console.error('Error desde LlamadosApis. Función ObtenerCantidadDescuentosExcel. No se pudo obtenerToken:', response.statusText);
        }
    } catch (error) {
        console.error('Error desde LlamadosApis. Función ObtenerCantidadDescuentosExcel. Error al obtener la cantidad de Descuentos en Excel:', error);
    }
    return null;
}

async function ObtenerCantidadDescuentos(token,Cabecera_Id) {
    try {
        const response = await fetch(`${API_URL}/api/Seguros/ObtenerCantidadDescuentos?Cabecera_Id=${Cabecera_Id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            timeout: 120000, // Establece un timeout de 2 minutos
        });
  
        if (response.ok) {
            const data = await response.json();
            if (data.CantidadDescuentos) {
                return data.CantidadDescuentos;
            } else {
                console.error('Error desde LlamadosApis. Función ObtenerCantidadDescuentos. La respuesta de la API no contiene el campo: CantidadDescuentosExcel:', data);
            }
        } else {
            console.error('Error desde LlamadosApis. Función ObtenerCantidadDescuentos. No se pudo obtenerToken:', response.statusText);
        }
    } catch (error) {
        console.error('Error desde LlamadosApis. Función ObtenerCantidadDescuentos. Error al obtener la cantidad de Descuentos en Excel:', error);
    }
    return null;
}

async function obtenerCantidadFacturasExcel(token) {
    try {
        const response = await fetch(`${API_URL}/api/Seguros/ObtenerCantidadFacturasExcel`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            timeout: 120000, // Establece un timeout de 2 minutos
        });
  
        if (response.ok) {
            const data = await response.json();
            if (data.CantidadFacturasExcel) {
                return data.CantidadFacturasExcel;
            } else {
                console.error('Error desde LlamadosApis. Función ObtenerCantidadFacturasExcel. La respuesta de la API no contiene el campo: CantidadFacturasExcel:', data);
            }
        } else {
            console.error('Error desde LlamadosApis. Función ObtenerCantidadFacturasExcel. No se pudo obtenerToken:', response.statusText);
        }
    } catch (error) {
        console.error('Error desde LlamadosApis. Función ObtenerCantidadFacturasExcel. Error al obtener la cantidad de Facturas en Excel:', error);
    }
    return null;
}

async function ObtenerCantidadFacturas(token,Cabecera_Id) {
    try {
        const response = await fetch(`${API_URL}/api/Seguros/ObtenerCantidadFacturas?Cabecera_Id=${Cabecera_Id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            timeout: 120000, // Establece un timeout de 2 minutos
        });
  
        if (response.ok) {
            const data = await response.json();
            if (data.CantidadFacturas) {
                return data.CantidadFacturas;
            } else {
                console.error('Error desde LlamadosApis. Función ObtenerCantidadFacturas. La respuesta de la API no contiene el campo: CantidadFacturasExcel:', data);
            }
        } else {
            console.error('Error desde LlamadosApis. Función ObtenerCantidadFacturas. No se pudo obtenerToken:', response.statusText);
        }
    } catch (error) {
        console.error('Error desde LlamadosApis. Función ObtenerCantidadFacturas. Error al obtener la cantidad de Facturas en Excel:', error);
    }
    return null;
}

async function EliminarDescuentosExcel(token) {
    try {
        const response = await fetch(`${API_URL}/api/Seguros/EliminarDescuentosExcel`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            timeout: 120000, // Establece un timeout de 2 minutos
        });
  
        if (response.ok) {
            const data = await response.json();
            if (data.message) {
                return data.message;
            } else {
                console.error('Error desde LlamadosApis. Función EliminarDescuentosExcel:', data);
            }
        } else {
            console.error('Error desde LlamadosApis. Función EliminarDescuentosExcel. No se pudo obtenerToken:', response.statusText);
        }
    } catch (error) {
        console.error('Error desde LlamadosApis. Función EliminarDescuentosExcel. Error al truncar Descuentos en Excel:', error);
    }
    return null;
}

async function EliminarCobroAseguradoraExcel(token) {
    try {
        const response = await fetch(`${API_URL}/api/Seguros/EliminarCobroAseguradoraExcel`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            timeout: 120000, // Establece un timeout de 2 minutos
        });
  
        if (response.ok) {
            const data = await response.json();
            if (data.message) {
                return data.message;
            } else {
                console.error('Error desde LlamadosApis. Función EliminarCobroAseguradoraExcel:', data);
            }
        } else {
            console.error('Error desde LlamadosApis. Función EliminarCobroAseguradoraExcel. No se pudo obtenerToken:', response.statusText);
        }
    } catch (error) {
        console.error('Error desde LlamadosApis. Función EliminarCobroAseguradoraExcel. Error al truncar Descuentos en Excel:', error);
    }
    return null;
}

async function obtenerCantidadCobroAseguradoraExcel(token) {
    try {
        const response = await fetch(`${API_URL}/api/Seguros/ObtenerCantidadCobroAseguradoraExcel`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            timeout: 120000, // Establece un timeout de 2 minutos
        });
  
        if (response.ok) {
            const data = await response.json();
            if (data.CantidadCobroAseguradoraExcel) {
                return data.CantidadCobroAseguradoraExcel;
            } else {
                console.error('Error desde LlamadosApis. Función ObtenerCantidadCobroAseguradoraExcel. La respuesta de la API no contiene el campo: CantidadCobroAseguradoraExcel:', data);
            }
        } else {
            console.error('Error desde LlamadosApis. Función ObtenerCantidadCobroAseguradoraExcel. No se pudo obtenerToken:', response.statusText);
        }
    } catch (error) {
        console.error('Error desde LlamadosApis. Función ObtenerCantidadCobroAseguradoraExcel. Error al obtener la cantidad de CobroAseguradora en Excel:', error);
    }
    return null;
}

async function ObtenerCantidadCobroAseguradora(token,Cabecera_Id) {
    try {
        const response = await fetch(`${API_URL}/api/Seguros/ObtenerCantidadCobroAseguradora?Cabecera_Id=${Cabecera_Id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            timeout: 120000, // Establece un timeout de 2 minutos
        });
  
        if (response.ok) {
            const data = await response.json();
            if (data.CantidadCobroAseguradora) {
                return data.CantidadCobroAseguradora;
            } else {
                console.error('Error desde LlamadosApis. Función ObtenerCantidadCobroAseguradoraExcel. La respuesta de la API no contiene el campo: CantidadCobroAseguradoraExcel:', data);
            }
        } else {
            console.error('Error desde LlamadosApis. Función ObtenerCantidadCobroAseguradoraExcel. No se pudo obtenerToken:', response.statusText);
        }
    } catch (error) {
        console.error('Error desde LlamadosApis. Función ObtenerCantidadCobroAseguradoraExcel. Error al obtener la cantidad de CobroAseguradora en Excel:', error);
    }
    return null;
}

const ObtenerDatosCobroAseguradoraExcel_Existe = async (token) => {
    try {
        const dataResponse = await fetch(`${API_URL}/api/Seguros/ObtenerCobroAseguradoraExcel_Existe`, {
            headers: {
            Authorization: `Bearer ${token}`,
            },
            timeout: 120000, // Establece un timeout de 2 minutos
        });

        if (!dataResponse.ok) {
            console.error('Error de red:', dataResponse.statusText);
            throw new Error('Error de red al obtener los datos de los Cobro Aseguradora Excel_Existe');
        }else{                
            const data = await dataResponse.json();
            return data;
        }
    } catch (error) {
        console.error('Error al obtener datos de los Cobro Aseguradora Excel_Existe:', error);
        throw error;
    }
};

const ObtenerDatosCobroAseguradora = async (token,Cabecera_Id) => {
    try {
        const dataResponse = await fetch(`${API_URL}/api/Seguros/ObtenerCobroAseguradora?Cabecera_Id=${Cabecera_Id}`, {
            headers: {
            Authorization: `Bearer ${token}`,
            },
            timeout: 120000, // Establece un timeout de 2 minutos
        });

        if (!dataResponse.ok) {
            console.error('Error de red:', dataResponse.statusText);
            throw new Error('Error de red al obtener los datos de los Cobro Aseguradora');
        }else{                
            const data = await dataResponse.json();
            return data;
        }
    } catch (error) {
        console.error('Error al obtener datos de los Cobro Aseguradora:', error);
        throw error;
    }
};

const ObtenerSegurosCabeceras = async (token) => {
    try {
        const dataResponse = await fetch(`${API_URL}/api/Seguros/ObtenerSegurosCabeceras`, {
            headers: {
            Authorization: `Bearer ${token}`,
            },
            timeout: 120000, // Establece un timeout de 2 minutos
        });

        if (!dataResponse.ok) {
            console.error('Error de red:', dataResponse.statusText);
            throw new Error('Error de red al obtener los datos de las Cabeceras de los Seguros');
        }else{                
            const data = await dataResponse.json();
            return data;
        }
    } catch (error) {
        console.error('Error al obtener datos de los datos de las Cabeceras de los Seguros:', error);
        throw error;
    }
};

export default {
    ObtenerToken,
    obtenerFechaMaxima,
    buscarSugerenciasSolicitanteDesdeAPI,
    buscarSugerenciasBeneficiarioDesdeAPI,
    buscarSugerenciasTareaDesdeAPI,
    buscarSugerenciasCentroDeCostoDesdeAPI,
    ObtenerDatosSolicitudes,
    ObtenerDatosCabeceras,
    DevolverCorreo,
    CrearSapCabecera,
    SubirSapDetalle,
    CrearCorreosParaCabecera,
    CrearAvisoAgerente,
    ObtenerDatosCorreosParaCabecera,
    ObtenerDatosBodyCorreo,
    EnviarCorreoValidado,
    ObtenerDatosTrabajadoresExcel,
    ObtenerDatosTrabajadores,
    obtenerCantidadTrabajadoresExcel,
    ObtenerCantidadTrabajadores,
    EliminarTrabajadoresExcel,
    ObtenerDatosDescuentosExcel_Existe,
    ObtenerDatosDescuentos,
    ObtenerDatosDescuentosExcelAgrupados,
    ObtenerDatosDescuentosAgrupados,
    obtenerCantidadDescuentosExcel,
    ObtenerCantidadDescuentos,
    ObtenerCantidadFacturas,
    obtenerCantidadFacturasExcel,
    EliminarDescuentosExcel,
    ObtenerEmpresaYnombreDadoIDexcel,
    ObtenerEstadoSubidaExcel,
    GuardarPEP,
    ABM_PEP,
    ABM_SOCIEDAD,
    ValidarYguardarCentroDeCosto,
    EliminarCobroAseguradoraExcel,
    ObtenerCantidadCobroAseguradora,
    obtenerCantidadCobroAseguradoraExcel,
    ObtenerDatosCobroAseguradora,
    ObtenerDatosCobroAseguradoraExcel_Existe,
    ObtenerCantidadSociedadesFacturadas,
    ObtenerCantidadSociedadesFacturadasH,
    ObtenerSociedadesFacturadasExcel,
    ObtenerSociedadesFacturadasH,
    ObtenerDistribucionesExcel,
    ObtenerDistribuciones,
    ObtenerPEPs,
    ObtenerSociedades,
    EliminarFacturasExcel,
    ObtenerDatosFacturasExcel,
    ObtenerDatosFacturas,
    CerrarPeriodo,
    ObtenerSegurosCabeceras
};