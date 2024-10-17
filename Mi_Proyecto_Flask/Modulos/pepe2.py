from flask import render_template, session
from Conexion import app, mysql  # Importa app y mysql desde Conexion.py

@app.route('/pepe2')
def pepe2():
    if 'NickName' not in session:
        Sistema=''
        mensaje='Por favor, ingrese sus credenciales para acceder al Sistema.'
        return render_template('Home.html', Sistema = Sistema, mensaje=mensaje,  menus=[{"Cod": "1", "Texto": "Iniciar Sesión", "Padre": "0", "Url": "/IniciarSesion"}])
    try:
        print("La ruta /pepe2 ha sido alcanzada.")
        # Usar la conexión MySQL ya configurada en Conexion.py
        cursor = mysql.connection.cursor()
        cursor.execute("SELECT * FROM giannitabla LIMIT 100")
        data = cursor.fetchall()
        columns = [i[0] for i in cursor.description]

        # Mapear los nombres de las columnas para la plantilla
        column_names = {
            'OtraTablaid': 'Id.',
            'OtraTablaCod': 'Código',
            'OtraTablaDesc': 'Descripción',
        }
        custom_columns = [column_names.get(col, col) for col in columns]
        cursor.close()

        return render_template('pepe2.html', data=data, columns=custom_columns)

    except Exception as e:
        generic_message = "Se ha producido un error al acceder a la Base de Datos."
        server_message = str(e)
        return render_template('Error.html', generic_message=generic_message, server_message=server_message+'.')
