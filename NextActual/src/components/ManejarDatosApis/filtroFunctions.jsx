
// Importa lo que sea necesario para estas funciones
import LlamadosApis from './LlamadosApis';

const SugerirSolicitantes = async (event, setNombreSolicitanteFiltro, setMostrarSugerenciasSolicitante, setSugerenciasSolicitantes) => {
    const solicitanteIngresado = event.target.value;
    setNombreSolicitanteFiltro(solicitanteIngresado);
    if (solicitanteIngresado.length >= 3) {
        setMostrarSugerenciasSolicitante(true);
        try {
            const sugerenciasSolicitante = await LlamadosApis.buscarSugerenciasSolicitanteDesdeAPI(solicitanteIngresado);
            setSugerenciasSolicitantes(sugerenciasSolicitante);
        } catch (error) {
            console.error('Error al obtener sugerencias Solicitantes desde la API:', error);
        }
    } else {
        setMostrarSugerenciasSolicitante(false);
        setSugerenciasSolicitantes([]);
    }
};

const SugerirBeneficiarios = async (event, setNombreBeneficiarioFiltro, setMostrarSugerenciasBeneficiario, setSugerenciasBeneficiarios) => {
    const beneficiarioIngresado = event.target.value;
    setNombreBeneficiarioFiltro(beneficiarioIngresado);
    if (beneficiarioIngresado.length >= 3) {
        setMostrarSugerenciasBeneficiario(true);
        try {
            const sugerenciasBeneficiario = await LlamadosApis.buscarSugerenciasBeneficiarioDesdeAPI(beneficiarioIngresado);
            setSugerenciasBeneficiarios(sugerenciasBeneficiario);
        } catch (error) {
            console.error('Error al obtener sugerencias Beneficiarios desde la API:', error);
        }
    } else {
        setMostrarSugerenciasBeneficiario(false);
        setSugerenciasBeneficiarios([]);
    }
};

const SugerirTareas = async (event, setTareaFiltro, setMostrarSugerenciasTarea, setSugerenciasTareas) => {
    const tareaIngresado = event.target.value;
    setTareaFiltro(tareaIngresado);
    if (tareaIngresado.length >= 3) {
        setMostrarSugerenciasTarea(true);
        try {
            const sugerenciasTarea = await LlamadosApis.buscarSugerenciasTareaDesdeAPI(tareaIngresado);
            setSugerenciasTareas(sugerenciasTarea);
        } catch (error) {
            console.error('Error al obtener sugerencias Tareas desde la API:', error);
        }
    } else {
        setMostrarSugerenciasTarea(false);
        setSugerenciasTareas([]);
    }
};

const SugerirCentroDeCosto = async (event, setCentroDeCostoFiltro, setMostrarSugerenciasCentroDeCosto, setSugerenciasCentroDeCosto) => {
    const CentroDeCostoIngresado = event.target.value;
    setCentroDeCostoFiltro(CentroDeCostoIngresado);
    if (CentroDeCostoIngresado.length >= 0) {
        setMostrarSugerenciasCentroDeCosto(true);
        try {
            const sugerenciasCentroDeCosto = await LlamadosApis.buscarSugerenciasCentroDeCostoDesdeAPI(CentroDeCostoIngresado);
            setSugerenciasCentroDeCosto(sugerenciasCentroDeCosto);
        } catch (error) {
            console.error('Error al obtener sugerencias CentroDeCosto desde la API:', error);
        }
    } else {
        setMostrarSugerenciasCentroDeCosto(false);
        setSugerenciasCentroDeCosto([]);
    }
};
export default {
    SugerirSolicitantes,
    SugerirBeneficiarios,
    SugerirTareas,
    SugerirCentroDeCosto
};