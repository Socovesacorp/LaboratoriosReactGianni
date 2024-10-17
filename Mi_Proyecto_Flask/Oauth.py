from flask                                      import redirect, url_for, session, request, flash, render_template
from authlib.integrations.flask_client          import OAuth
from email_validator                            import validate_email, EmailNotValidError
from authlib.integrations.base_client.errors    import OAuthError
import os
import requests

microsoft = None  

def init_oauth(app):
    global microsoft 
    oauth = OAuth(app)
    microsoft = oauth.register(
        'microsoft',
        client_id           = os.getenv('CLIENT_ID'),
        client_secret       = os.getenv('CLIENT_SECRET'),
        access_token_url    = os.getenv('ACCESS_TOKEN_URL'),
        access_token_params = None,
        authorize_url       = os.getenv('AUTHORIZE_URL'),
        authorize_params    = None,
        api_base_url        = os.getenv('API_BASE_URL'),
        client_kwargs       = {'scope': 'offline_access User.Read'},
    )
    return oauth

def IniciarSesion(app, oauth):
    @app.route('/verify/<Email>', methods=['GET', 'POST'])
    def verify(Email):
        try:
            valid = validate_email(Email)  # Validar Email
            Email = valid.email  # Normalizar el Email
            valid_domains = ["socovesa.cl", "pilares.cl", "almagro.cl", "empresassocovesa.cl", "eess.cl"]
            if not any(domain in Email.lower() for domain in valid_domains):
                return render_template('Error.html', generic_message='Error de Dominio', server_message=f'El dominio del correo electrónico {Email} no es válido. Debe ser dominio empresassocovesa, socovesa, eess, pilares o almagro.')
                
        except EmailNotValidError as e:
            return render_template('Error.html', generic_message='Correo Inválido.', server_message=f'El Email: {Email} no es válido: {str(e)}')
    
        # Guardar el login y el Email en la sesión
        session['NickName'] = Email.split('@')[0].lower()
        session['Email'] = Email.lower()

        # Configuración de la solicitud al web service
        
        url = os.getenv('WsRetPermisos_QA')
        headers = {
            "Content-Type": "application/json"
        }
        data = {
            "Key": os.getenv('KEY'),
            "ParametrosEntradaWs4": {
                "Sistema": {
                    "Cod": "33"
                },
                "Usuario": {
                    "CtaRed": {
                        "Dominio": "SOCOVESA",
                        "NickName": session.get('NickName', None)  # Usar el nombre de usuario del Email
                    }
                }
            }
        }
        
        try:
            # Hacer la solicitud POST al web service
            response = requests.post(url, headers=headers, json=data)

            # Verificar si la solicitud fue exitosa
            if response.status_code == 200:
                permisos = response.json()


                # menus_transformados = [
                #     {"Cod": "1", "Texto": "Home", "Padre": "0", "Url": "Home"},
                #     {"Cod": "2", "Texto": "Opciones", "Padre": "0", "Url": "#"},
                #     {"Cod": "3", "Texto": "Sub-Opcion 1", "Padre": "2", "Url": "#"},
                #     {"Cod": "4", "Texto": "Sub-Opcion 2", "Padre": "2", "Url": "#"},
                #     {"Cod": "5", "Texto": "Sub-Opcion 1.1", "Padre": "3", "Url": "#"},
                #     {"Cod": "6", "Texto": "Sub-Opcion 2.1", "Padre": "4", "Url": "pepe2"},
                #     {"Cod": "7", "Texto": "Sub-Opcion 1.1.1", "Padre": "5", "Url": "pepe1"},
                # ]


                menus_ordenados = sorted(permisos['ParametrosSalidaWs4']['Menus'], key=lambda x: int(x['Cod']))
                menus_transformados = []
                for menu in menus_ordenados:
                    menu_transformado = {
                        "Cod": menu["Cod"],
                        "Texto": menu["Texto"],
                        "Padre": menu["Padre"],
                        "Url": menu["ObjetoNom"]  # Cambiar 'ObjetoNom' por 'Url'
                    }
                    menus_transformados.append(menu_transformado)
                # print(f"Permisos recibidos: {permisos}")
                session['Nombre']       = permisos['ParametrosSalidaWs4']['Usuarios'][0]['ActiveDirectory']['Noms'] + ' ' + permisos['ParametrosSalidaWs4']['Usuarios'][0]['ActiveDirectory']['Apes']
                session['PerfilCod']    = permisos['ParametrosSalidaWs4']['Usuarios'][0]['Perfil']['Cod']
                session['PerfilNom']    = permisos['ParametrosSalidaWs4']['Usuarios'][0]['Perfil']['Nom']
                session['SistemaNom']   = permisos['ParametrosSalidaWs4']['Sistema']['Nom']
                session['Menus']        = menus_transformados
                #print(f"EL Nombre es: {session.get('Nombre', None)}")
            else:
                return render_template('Error.html', 
                       generic_message='Error al consultar Servicio Web WsRetPermisos.', 
                       server_message=f"{response.status_code} - {response.text}.")
                
                
        except requests.exceptions.RequestException as e:
          # except Exception  as e:
            return render_template('Error.html', 
                               generic_message='Error al consultar Servicio Web WsRetPermisos.', 
                               server_message=str(e) + '.')

        next_url = request.args.get('next')
        if next_url:
            return redirect(next_url)
        else:
            Email = session.get('Email', None)
            #print("Email en sesión:", Email)
            return redirect(url_for('Menu'))
    
    @app.route('/login/authorized')
    def authorized():
        try:
            token = microsoft.authorize_access_token()
            resp = microsoft.get('me')
            resp.raise_for_status()
            Email = resp.json().get('mail')
            next_url = session.pop('next', '/')
            return redirect(url_for('verify', Email=Email, next=next_url))
        except Exception  as e:
            return render_template('Error.html', 
                               generic_message='Error en la autenticación.', 
                               server_message=str(e) + '.')

    @app.route('/IniciarSesion')
    def CrearRutas():
        next_url = request.args.get('next') # Aquí queda guardada la url donde el usuario quería acceder y como no estaba autenticado se lo redireccionará...
        session['next'] = next_url
        return oauth.microsoft.authorize_redirect(url_for('authorized', _external=True))  # Aquí se envía al usuario a autentizarse hacia: authorize_url='https://login.microsoftonline.com/13a5374c-6b9e-4c64-9bd8-db78dc15f5b9/oauth2/v2.0/authorize'

    @app.route('/logout')
    def logout():
        session.clear()    
        tenant_id = "13a5374c-6b9e-4c64-9bd8-db78dc15f5b9"  # Reemplaza con tu tenant ID
        redirect_uri = url_for('Menu', _external=True)  # URL de redireccionamiento después del logout
        logout_url = f"https://login.microsoftonline.com/{tenant_id}/oauth2/v2.0/logout?post_logout_redirect_uri={redirect_uri}"
        return redirect(logout_url)