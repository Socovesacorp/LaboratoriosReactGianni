//Me crearé una librería personal con todas las funciones que necesito
//para la Grilla MaterialUi

const ManejoDatosGrillaMaterialUi = {

    // Función para parsear una cadena de fecha en formato 'dd/mm/yyyy' a un objeto Date de la grilla MaterialUi
    parseDate(value) {
        if (value) {
            const parts = value.split('/');
            if (parts.length === 3) {
                const year = parseInt(parts[2]);
                const fullYear = (year < 1000) ? (2000 + year) : year;
                const month = parseInt(parts[1]) - 1;
                const day = parseInt(parts[0]);
                return new Date(fullYear, month, day);
            }
        }
        return null;
    },

    // Función para parsear una cadena de fecha y hora a un objeto DateTime de la grilla MaterialUi
    parseDateAndTime(value) {
        //console.log(value)
        if (value) {
            console.log('recibido: '+value)
            const dateTimeParts = value.split(' ');
            if (dateTimeParts.length === 2) {
                const dateParts = dateTimeParts[0].split('/');
                const timePart = dateTimeParts[1];
                if (dateParts.length === 3 && timePart) {
                const year = parseInt(dateParts[2]);
                const fullYear = year < 1000 ? 2000 + year : year;
                const month = parseInt(dateParts[1]) - 1;
                const day = parseInt(dateParts[0]);
                const timeParts = timePart.split(':');
                const hours = parseInt(timeParts[0]);
                const minutes = parseInt(timeParts[1]);
                const seconds = timeParts.length > 2 ? parseInt(timeParts[2]) : 0;
                return new Date(fullYear, month, day, hours, minutes, seconds);
                }
            }
        }
        return null;
    },

    parseDateAndTimeDesdeSQL(value) {
        if (value) {
            //console.log('recibido: ' + value);
            const isoDateRegex = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})\.(\d{3})Z$/;
            const match = value.match(isoDateRegex);
            if (match) {
                const year = parseInt(match[1], 10);
                const month = parseInt(match[2], 10) - 1;
                const day = parseInt(match[3], 10);
                const hours = parseInt(match[4], 10);
                const minutes = parseInt(match[5], 10);
                const seconds = parseInt(match[6], 10);
                const milliseconds = parseInt(match[7], 10);
                return new Date(year, month, day, hours, minutes, seconds, milliseconds);
            }
        }
        return null;
    }
};

export default ManejoDatosGrillaMaterialUi;