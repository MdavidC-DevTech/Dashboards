# Proyecto Dashboard de Análisis

Este proyecto integra un backend en FastAPI y un frontend en React para visualizar datos transformados desde un CSV (pronto se integrará con una base de datos real).

## Estructura del Proyecto

proyecto/
 ├─ backend/ # Backend en FastAPI 
 │ ├─ init.py 
 │ ├─ auth.py 
 │ ├─ data_transform.py 
 │ └─ main.py 
 ├─ frontend/ # Frontend en React 
 │ ├─ public/ 
 │ ├─ src/ 
 │ │ ├─ App.js 
 │ │ ├─ components/ 
 │ │ │ ├─ Header.js 
 │ │ │ ├─ Sidebar.js 
 │ │ │ ├─ Footer.js 
 │ │ │ └─ SearchableSelect.js 
 │ │ ├─ pages/ 
 │ │ │ ├─ LoginPage.js 
 │ │ │ ├─ ProfesoresPage.js 
 │ │ │ ├─ EstudiantesPage.js 
 │ │ │ └─ ConteoAccesoPage.js 
 │ │ └─ services/ 
 │ │ └─ api.js 
 │ └─ package.json 
 ├─ .gitignore 
 └─ README.md
 
## Instalación y Uso

### Backend

1. Navega a la carpeta `backend/`:
   ```bash
   cd backend
2. Crea y activa un entorno virtual:

python -m venv env
# En Windows:
env\Scripts\activate
# En macOS/Linux:
source env/bin/activate

3. Instala las dependencias de Python:
 pip install fastapi uvicorn "python-jose[cryptography]" "passlib[bcrypt]" python-multipart pandas

4. Genera un archivo requirements.txt:
pip freeze > requirements.txt

### Frontend
1. Navega a la carpeta frontend/:

cd ../frontend
2. Instala las dependencias de Node.js (asegúrate de tener Node.js y npm instalados):
npm install
npm install axios react-router-dom react-icons react-select

### Ejecución en Desarrollo
* Backend:
Desde la carpeta backend/ con el entorno virtual activado:

uvicorn main:app --reload
Esto iniciará el backend en http://127.0.0.1:8000.

* Frontend:
Desde la carpeta frontend/:

bash
Copiar
npm start
Esto abrirá la aplicación en http://localhost:3000.