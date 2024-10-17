from flask import Flask
from flask_mysqldb import MySQL
import os
from dotenv import load_dotenv
import ssl


# Cargar variables de entorno desde un archivo .env
load_dotenv()

app = Flask(__name__)
app.secret_key = os.urandom(24)

# Configuración de la conexión a MySQL usando variables de entorno
app.config['MYSQL_HOST']        = os.getenv('MYSQL_HOST')
app.config['MYSQL_USER']        = os.getenv('MYSQL_USER')
app.config['MYSQL_PASSWORD']    = os.getenv('MYSQL_PASSWORD')
app.config['MYSQL_DB']          = os.getenv('MYSQL_DB')
app.config['MYSQL_PORT']        = int(os.getenv('MYSQL_PORT', 3306))

# Inicializar MySQL
mysql = MySQL(app)

# Desactivar la verificación del certificado SSL en desarrollo
if os.getenv('FLASK_DEBUG') == 'development':
    ssl._create_default_https_context = ssl._create_unverified_context
