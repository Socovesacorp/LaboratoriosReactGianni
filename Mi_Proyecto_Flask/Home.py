import os
import importlib
import webbrowser
from flask      import render_template, session,request  
from markupsafe import Markup
from threading  import Timer

# Mis propios python...
import Oauth
from Conexion   import app

# Inicializar mi python de autenticación con Oauth 2.0...
oauth = Oauth.init_oauth(app)

# Registrar la ruta de Iniciar Sesión...
Oauth.IniciarSesion(app, oauth)

# Importar todos los Python de la carpeta 'Modulos'...
modulos_dir = os.path.join(os.path.dirname(__file__), 'Modulos')

for filename in os.listdir(modulos_dir):
    if filename.endswith('.py') and filename != '__init__.py':
        module_name = f'Modulos.{filename[:-3]}'
        importlib.import_module(module_name)

# Sub Menús recursivos...
def render_menu(parent_id, menus):
    html = ""
    submenus = [submenu for submenu in menus if submenu['Padre'] == parent_id]

    for submenu in submenus:
        has_submenus = any(sub['Padre'] == submenu['Cod'] for sub in menus)
        
        if has_submenus:
            html += f'''
            <li class="dropdown-submenu">
                <a class="dropdown-item dropdown-toggle" href="#" id="submenu_{submenu["Cod"]}" role="button" aria-haspopup="true" aria-expanded="false">
                    {submenu["Texto"]}
                </a>
                <ul class="dropdown-menu">
                    {render_menu(submenu['Cod'], menus)}
                </ul>
            </li>
            '''
        else:
            html += f'''
            <li>
                <a class="dropdown-item" href="{submenu["Url"]}" onclick="loadPage(event, '{submenu["Url"]}')">{submenu["Texto"]}</a>
            </li>
            '''
    return Markup(html)

# Hacer que mi función "render_menu" sea global para todas mis plantillas HTML...
app.jinja_env.globals.update(render_menu=render_menu)

@app.route('/Home', methods=['GET', 'POST'])
def Menu():
    Email       = session.get('Email', None)
    Nombre      = session.get('Nombre', None)
    Nombre      = Nombre.upper() if Nombre else None
    PerfilNom   = session.get('PerfilNom', None)
    Sistema     = session.get('SistemaNom', None)
    NickName    = session.get('NickName', None)
    menus       = session.get('Menus', [])
    cargar_contenido = request.args.get('cargar_contenido', default=None)

    if 'NickName' in session:
        print(f"Usuario autenticado: {NickName}")
        # Renderizar Home.html y pasar cargar_pepe1 como argumento
        return render_template('Home.html', Sistema=Sistema, Nombre=Nombre, PerfilNom=PerfilNom, menus=menus, cargar_contenido=cargar_contenido)
    else:
        Sistema = ''
        mensaje = 'Por favor, ingrese sus credenciales para acceder al Sistema.'
        return render_template('Home.html', Sistema=Sistema, mensaje=mensaje, menus=[{"Cod": "1", "Texto": "Iniciar Sesión", "Padre": "0", "Url": "/IniciarSesion"}])

# Función para abrir el navegador
def open_browser():
    webbrowser.open_new('http://localhost:5000/Home')

# Inicio de la aplicación
if __name__ == "__main__":
    Timer(1, open_browser).start()
    app.run(debug=False)
