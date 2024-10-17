from flask import render_template, session, redirect, url_for, request
from Conexion import app, mysql

@app.route('/pepe1')
def pepe1():
    if 'NickName' not in session:
        Sistema = ''
        mensaje = 'Por favor, ingrese sus credenciales para acceder al Sistema.'
        return render_template('Home.html', Sistema=Sistema, mensaje=mensaje, menus=[
            {"Cod": "1", "Texto": "Iniciar Sesión", "Padre": "0", "Url": "/IniciarSesion"}])
    try:
        cursor = mysql.connection.cursor()
        cursor.execute("""
                       SELECT 
                            ParametroEtapaId, 
                            COALESCE(EtapaCodSci, '') AS EtapaCodSci, 
                            COALESCE(EtapaCodJetBrokers, '') AS EtapaCodJetBrokers, 
                            COALESCE(EtapaNomSci, '') AS EtapaNomSci,
                            CASE 
                                WHEN Estado = 1 THEN 'Si' 
                                ELSE 'No' 
                            END AS Estado
                        FROM parametro_etapa
                       """)
        data = cursor.fetchall()
        columns = [i[0] for i in cursor.description]
        column_names = {
            'ParametroEtapaId': 'Id.',
            'EtapaCodSci': 'Código SCI',
            'EtapaCodJetBrokers': 'Código JetBrokers',
            'EtapaNomSci': 'Nombre SCI',
            'Estado': 'Activo',
        }
        custom_columns = [column_names.get(col, col) for col in columns]
        cursor.close()

        return render_template('pepe1.html', data=data, columns=custom_columns)

    except Exception as e:
        return render_template('Error.html', generic_message="Se ha producido un error al acceder a la Base de Datos.", server_message=str(e) + '.')

@app.route('/modificar_etapa', methods=['POST'])
def modificar_etapa():
    if 'NickName' not in session:
        return redirect(url_for('login'))

    try:
        etapa_id = request.form['id']
        codigo_sci = request.form['codigoSci']
        codigo_jetbrokers = request.form['codigoJetBrokers']
        estado_mantenedor = request.form['estadoMantenedor']

        if estado_mantenedor == "Si":
            estado_mantenedor = 1
        elif estado_mantenedor == "No":
            estado_mantenedor = 0

        # Actualizar el registro en la base de datos
        cursor = mysql.connection.cursor()
        cursor.execute("""
            UPDATE parametro_etapa
            SET EtapaCodSci = %s, EtapaCodJetBrokers = %s, Estado = %s
            WHERE ParametroEtapaId = %s
        """, (codigo_sci, codigo_jetbrokers, estado_mantenedor, etapa_id))
        mysql.connection.commit()
        cursor.close()

        return redirect(url_for('Menu', cargar_contenido='pepe1'))

    except Exception as e:
        return render_template('Error.html', generic_message="Error al modificar la etapa.", server_message=str(e))

@app.route('/eliminar_etapa', methods=['POST'])
def eliminar_etapa():
    if 'NickName' not in session:
        return redirect(url_for('login'))

    try:
        # Recuperar el ID de la etapa y el código SCI desde el formulario
        etapa_id = request.form['id']
        etapa_cod_sci = request.form['codigoSci']
        etapa_nom_sci = request.form['nombreSci']

        # Verificar si existe alguna referencia en la tabla 'etapa' con el mismo código EtapaCodSci
        cursor = mysql.connection.cursor()
        cursor.execute("SELECT COUNT(1) FROM etapa WHERE EtapaCod = %s", (etapa_cod_sci,))
        conteo = cursor.fetchone()[0]

        if conteo > 0:
            # Si existe alguna referencia, mostrar un mensaje y no eliminar el registro
            cursor.close()
            mensaje = "No es posible eliminar a la Etapa <span style='color:#c0392b'><b>" + etapa_id + " - " + etapa_nom_sci + "</b></span> porque existe información en el Histórico."

            #return render_template('Error.html', generic_message=mensaje)
            redirect_url = url_for('Menu', cargar_contenido='pepe1')
            return render_template('Error.html', generic_message=mensaje, server_message='', redirect_url=redirect_url)

        # Si no existe ninguna referencia, proceder a eliminar el registro
        cursor.execute("DELETE FROM parametro_etapa WHERE ParametroEtapaId = %s", (etapa_id,))
        mysql.connection.commit()
        cursor.close()

        return redirect(url_for('Menu', cargar_contenido='pepe1'))
    

    except Exception as e:
        return render_template('Error.html', generic_message="Error al eliminar la etapa.", server_message=str(e))



@app.route('/agregar_etapa', methods=['POST'])
def agregar_etapa():
    if 'NickName' not in session:
        Sistema = ''
        mensaje = 'Por favor, ingrese sus credenciales para acceder al Sistema.'
        return render_template('Home.html', Sistema=Sistema, mensaje=mensaje, menus=[
            {"Cod": "1", "Texto": "Iniciar Sesión", "Padre": "0", "Url": "/IniciarSesion"}])
    
    try:
        codigo_sci = request.form['codigoSci']
        codigo_jetbrokers = request.form['codigoJetBrokers']
        estado_mantenedor = request.form['estadoMantenedor']

        # Convertir "Si" en 1 y "No" en 0
        if estado_mantenedor == 'Si':
            estado_mantenedor = 1
        elif estado_mantenedor == 'No':
            estado_mantenedor = 0

        # Insertar la nueva etapa en la base de datos
        cursor = mysql.connection.cursor()
        cursor.execute("INSERT INTO parametro_etapa (EtapaCodSci, EtapaCodJetBrokers, Estado) VALUES (%s, %s, %s)", 
                       (codigo_sci, codigo_jetbrokers, estado_mantenedor))
        mysql.connection.commit()
        cursor.close()

        # Redirigir de vuelta a Home.html y cargar pepe1 en el contenedor
        return redirect(url_for('Menu', cargar_contenido='pepe1'))

    except Exception as e:
        return render_template('Error.html', generic_message="Error al agregar la etapa.", server_message=str(e))


