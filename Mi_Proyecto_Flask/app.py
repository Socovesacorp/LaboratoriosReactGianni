from flask import Flask, render_template, redirect, url_for, session, request, flash
import webbrowser
from threading import Timer
from flask_mysqldb import MySQL
import os
from authlib.integrations.flask_client import OAuth
import ssl
from email_validator import validate_email, EmailNotValidError
import pymysql
from authlib.integrations.base_client.errors import OAuthError  # Importar la excepción correcta

# Configurar la aplicación Flask
app = Flask(__name__)
app.secret_key = os.urandom(24)

# Configuración de la conexión a MySQL (usando variables de entorno)
# app.config['MYSQL_HOST'] = os.getenv('MYSQL_HOST', 'localhost')
app.config['MYSQL_USER'] = os.getenv('MYSQL_USER', 'admflask')
app.config['MYSQL_PASSWORD'] = os.getenv('MYSQL_PASSWORD', 'Socovesa123')
app.config['MYSQL_HOST'] = os.getenv('MYSQL_HOST', 'pythonflaskbd.mysql.database.azure.com')
# app.config['MYSQL_USER'] = os.getenv('MYSQL_USER', 'admflask')
# app.config['MYSQL_PASSWORD'] = os.getenv('MYSQL_PASSWORD', 'Socovesa123')
app.config['MYSQL_DB'] = os.getenv('MYSQL_DB', 'giannibase')
app.config['MYSQL_PORT'] = 3306
# Inicializar MySQL
mysql = MySQL(app)

# Configuración de OAuth con Microsoft Azure AD
oauth = OAuth(app)
microsoft = oauth.register(
    'microsoft',
    client_id='5c22becb-99c6-4889-af04-3477f9fe316d',
    client_secret='e.I8Q~X4gpyyYtPtJjTBx8IV2vzTli_4PaeoSc.Q',
    access_token_url='https://login.microsoftonline.com/13a5374c-6b9e-4c64-9bd8-db78dc15f5b9/oauth2/v2.0/token',
    access_token_params=None,
    authorize_url='https://login.microsoftonline.com/13a5374c-6b9e-4c64-9bd8-db78dc15f5b9/oauth2/v2.0/authorize',
    authorize_params=None,
    api_base_url='https://graph.microsoft.com/v1.0/',
    client_kwargs={'scope': 'offline_access User.Read'},
)

# Desactivar la verificación del certificado SSL en desarrollo
if (os.environ.get('FLASK_DEBUG') == 'development' and
    getattr(ssl, '_create_unverified_context', None)):
    ssl._create_default_https_context = ssl._create_unverified_context

# Función para convertir el email al dominio @socovesa.cl
def convert_email_a_socovesa(email):
    username, domain = email.split('@')
    if domain == 'socovesa.cl':
        return email
    return f"{username}@socovesa.cl"

@app.route('/login')
def login():
    next_url = request.args.get('next')
    session['next'] = next_url
    if os.getenv('FLASK_DEBUG') == 'development':
        return microsoft.authorize_redirect(url_for('authorized', _external=True))
    else:
        return microsoft.authorize_redirect(url_for('authorized', _external=True))

@app.route('/login/authorized')
def authorized():
    try:
        token = microsoft.authorize_access_token()
        resp = microsoft.get('me')
        resp.raise_for_status()
        email = resp.json().get('mail')
        next_url = session.pop('next', None)
        return redirect(url_for('verify', email=email, next=next_url))
    except OAuthError as e:  # Manejar la excepción correcta
        return f'Error en la autenticación: {str(e)}'

@app.route('/verify/<email>', methods=['GET', 'POST'])
def verify(email):
    try:
        valid = validate_email(email)  # Validar email
        email = valid.email  # Normalizar el email
        valid_domains = ["socovesa.cl", "pilares.cl", "almagro.cl", "empresassocovesa.cl", "eess.cl"]
        if not any(domain in email.lower() for domain in valid_domains):
            msg = f'El dominio del correo electrónico {email} no es válido. Debe ser dominio empresassocovesa, socovesa, eess, pilares o almagro.'
            flash(msg)
            return msg
    except EmailNotValidError as e:
        flash(f'El email {email} no es válido: {str(e)}')
        return "Invalid email"
    
    session['login'] = email.split('@')[0].lower()
    # session['rol'] = get_rol_user()
    session['email'] = convert_email_a_socovesa(email.lower())
    next_url = request.args.get('next')
    if next_url:
        return redirect(next_url)
    else:
        return redirect(url_for('index'))

# def get_rol_user():
#     con = pymysql.connect(host=os.getenv('MYSQL_HOST', 'localhost'),
#                           user=os.getenv('MYSQL_USER', 'UI_Sistema'),
#                           password=os.getenv('MYSQL_PASSWORD', 'lospulentos01'),
#                           db=os.getenv('MYSQL_DB', 'giannibasemysql'),
#                           cursorclass=pymysql.cursors.DictCursor)
#     cursor = con.cursor()
#     cursor.execute("SELECT rol FROM usuarios WHERE nickname = %s", (session['login'],))
#     rol = cursor.fetchone()
#     con.close()
#     return rol['rol'] if rol else 'sin permisos'

# Ruta protegida
@app.route('/')
def home():
    if 'email' not in session:
        return redirect(url_for('login', next=request.url))
    
    try:
        cursor = mysql.connection.cursor()
        cursor.execute("SELECT * FROM giannitabla LIMIT 100")
        data = cursor.fetchall()
        columns = [i[0] for i in cursor.description]
        
        column_names = {
            'GianniTablaid': 'Id.',
            'GianniTablaCod': 'Código',
            'GianniTablaDesc': 'Descripción',
        }

        custom_columns = [column_names.get(col, col) for col in columns]
        cursor.close()

        return render_template('home.html', data=data, columns=custom_columns)
    
    except Exception as e:
        return render_template('error.html', error_message="Se ha producido un error al cargar la página.")

# Función para abrir el navegador
def open_browser():
    webbrowser.open_new('http://localhost:5000/')

# Inicio de la aplicación
if __name__ == "__main__":
    Timer(1, open_browser).start()
    app.run(debug=True)
