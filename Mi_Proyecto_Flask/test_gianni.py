import Home  # Esto importa Home.py y debería registrar la ruta /Gianni

from Conexion import app  # Importa la instancia de app si no se importa automáticamente con Home

if __name__ == '__main__':
    print(app.url_map)  # Verifica que la ruta /Gianni esté registrada
    app.run(debug=True)
