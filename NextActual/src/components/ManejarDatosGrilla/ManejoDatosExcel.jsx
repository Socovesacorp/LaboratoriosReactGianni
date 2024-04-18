//Me crearé una librería personal con todas las funciones que necesito
//para formatear datos desde Excel...

const ManejoDatosExcel = {

    //Leo algo desde Excel con formato Decimal y lo interpeto como número decimal en java script...
    formatDecimal(value) {
        // Verificar si el valor es una cadena
        if (typeof value === 'string') {
            // Eliminar todas las comas
            const cleanedValue = value.replace(/,/g, '');
            // Reemplazar el primer punto por un punto decimal (si existe)
            const formattedValue = cleanedValue.replace('.', ',').replace(/\.(?=\d)/g, '');
            // Reemplazar la coma decimal por un punto decimal
            const numericValue = parseFloat(formattedValue.replace(',', '.'));
            // Verificar si el valor es un número válido
            if (!isNaN(numericValue)) {
                return numericValue;
            }
        }
        // Si no se pudo convertir a número, retornar NaN o el valor original
        return NaN;
    },

    //Leo desde Excel y dejo en dd/mm/aaaa listo para Java Script...
    IntercalaDiaMes(fecha) {
        const parts = fecha.split('/');
        if (parts.length === 3) {
            // Intercambiar el día y el mes y devolver la nueva fecha
            return parts[1] + '/' + parts[0] + '/' + parts[2];
        }
        // Si no tiene el formato esperado, dejarla sin cambios
        return fecha;
    },

    IntercalaDiaMesFechaRendicion(fecha) {
        //console.log('****recibo: '+fecha)
        const parts = fecha.split('/');
        if (parts.length === 3) {
            if (parts[2].length === 4) {
                // Tomar únicamente los dos últimos dígitos del año
                parts[2] = parts[2].slice(-2);
                //console.log('Año (2 últimos dígitos): ' + parts[2]);
                //console.log('devuelvo: '+parts[0] + '/' + parts[1] + '/' + parts[2])
                return parts[0] + '/' + parts[1] + '/' + parts[2];
            }else{
                //console.log('devuelvo: '+parts[1] + '/' + parts[0] + '/' + parts[2])
                // Intercambiar el día y el mes y devolver la nueva fecha
                return parts[1] + '/' + parts[0] + '/' + parts[2];
            }
        }
        // Si no tiene el formato esperado, dejarla sin cambios
        return fecha;
    },


    //Leo desde Excel y dejo en dd/mm/aaaa hh:mm:ss listo para Java Script...
    FormatoDateTime (dateTimeString) {
        if (!dateTimeString) {
            return null;
        }
        const dateParts = dateTimeString.split(' ')[0].split('/'); // Separa la fecha y el tiempo
        const timePart = dateTimeString.split(' ')[1]; // Obtiene la parte del tiempo
        if (dateParts.length === 3 && timePart) {
            const timeParts = timePart.split(':'); // Separa las partes del tiempo (horas, minutos, segundos)
            // Verifica si la parte del tiempo contiene segundos
            if (timeParts.length === 3) {
                // Si hay segundos, usa la parte del tiempo tal como está
                return dateParts[1] + '/' + dateParts[0] + '/' + dateParts[2] + ' ' + timePart;
            } else {
                // Si no hay segundos, agrega ":00" a la parte del tiempo
                return dateParts[1] + '/' + dateParts[0] + '/' + dateParts[2] + ' ' + timePart + ':00';
            }
        }

        // Si no tiene el formato esperado o falta el tiempo, dejarla sin cambios
        return dateTimeString;
    },

    // Función para formatear fechas y horas desde MaterialUi hacia T-SQL...
    formatoFechaHoraSQL(dateTimeString) {
        if (!dateTimeString || dateTimeString.trim() === '') {
            return null;
        }
        const dateTimeParts = dateTimeString.split(' ');
        if (dateTimeParts.length !== 2) {
            return null;
        }
        const [fechaPart, horaPart] = dateTimeParts;
        const fechaParts = fechaPart.split('/');
        const horaParts = horaPart.split(':');
        if (fechaParts.length !== 3 || horaParts.length < 2) {
            return null;
        }
        const year = parseInt(fechaParts[2]);
        const fullYear = year < 1000 ? 2000 + year : year;
        const month = parseInt(fechaParts[1]) - 1;
        const day = parseInt(fechaParts[0]);
        const hours = parseInt(horaParts[0]);
        const minutes = parseInt(horaParts[1]);
        const seconds = horaParts.length > 2 ? parseInt(horaParts[2]) : 0;
        return `${day.toString().padStart(2, '0')}/${(month + 1).toString().padStart(2, '0')}/${fullYear} ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    },

    // Función para formatear fechas SIN HORAS desde MaterialUi hacia T-SQL...
    formatoFechaSQL(fecha) {
        if (fecha && fecha.trim() !== '') {
            const fechaParts = fecha.split('/');
            return `${fechaParts[0].padStart(2, '0')}/${fechaParts[1].padStart(2, '0')}/${fechaParts[2].padStart(4, '20')}`;
        }
        return null;
    },

    // Función para formatear fechas menos 1 mes dejando C(6) donde mmYYYY sería el resultado MaterialUi hacia T-SQL...
    formatoYYYYmm(fecha) {
        if (!fecha || fecha.trim() === '') {
            return null; // Si la fecha está vacía o es nula, devolvemos null
        }
        
        const fechaParts = fecha.split('/');
        if (fechaParts.length !== 3) {
            return null; // Si la fecha no tiene tres partes (día, mes, año), devolvemos null
        }
    
        let [mes, dia, ano] = fechaParts;
        const diaFormateado = dia.padStart(2, '0');
        const mesFormateado = mes.padStart(2, '0');
        const anoFormateado = ano.padStart(4, '20');
    
        console.log('recibí: '+fecha)
        console.log('dia: '+diaFormateado)
        console.log('mes: '+mesFormateado)
        console.log('ano: '+anoFormateado)
        // Restar un mes
        if (parseInt(mesFormateado, 10) > 1) {
            mes = (parseInt(mesFormateado, 10) - 1).toString();
        } else {
            mes = '12'; // Diciembre
            ano = (parseInt(anoFormateado, 10) - 1).toString(); // Restamos 1 al año usando el valor original de ano
        }
        mes = mes.padStart(2, '0');
        ano = ano.padStart(4, '20');
        console.log('anoFINAL: '+ano)
        console.log('mesFINAL: '+mes)
        return `${ano}${mes}`;
    },


    obtenerRutTrabajadorSinDV(CELDA) {
        const valorSinDV = CELDA.replace(/\./g, '').replace(/-/g, '').slice(0, -1);
        return valorSinDV;
    },

    obtenerDVTrabajador(CELDA) {
        const valorSinDV = CELDA.replace(/\./g, '').replace(/-/g, '').slice(-1).toUpperCase();
        return valorSinDV;
    },

    obtenerSoloNumeros(CELDA) {
        if (CELDA === null || CELDA === undefined) {
            return ''; // Devolver cadena vacía si el argumento es nulo o indefinido
          }
        return CELDA.replace(/[^\d]/g, '');
    }

};
export default ManejoDatosExcel;