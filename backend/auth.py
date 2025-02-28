# backend/auth.py
from datetime import datetime, timedelta
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext

# En producción, guarda SECRET_KEY en variables de entorno y usa un valor muy difícil de adivinar.
SECRET_KEY = "tu_secreto_super_secreto"  # Cambia este valor y no lo subas en código plano
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30  # Tiempo de expiración del token

# Configuración de hash para contraseñas usando bcrypt.
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Definir el esquema OAuth2 para el token (la ruta será /token)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Simulación de base de datos de usuarios (para producción, usar un ORM y base de datos real)
fake_users_db = {
    "juanperez": {
        "username": "juanperez",
        "full_name": "Juan Pérez",
        "email": "juan@example.com",
        "hashed_password": pwd_context.hash("secret"),  # En producción, almacena el hash
        "disabled": False,
        "role": "teacher"
    },
    "anagomez": {
        "username": "anagomez",
        "full_name": "Ana Gómez",
        "email": "ana@example.com",
        "hashed_password": pwd_context.hash("secret2"),
        "disabled": False,
        "role": "student"
    }
}

# Función para verificar la contraseña
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

# Función para obtener el usuario a partir del nombre de usuario
def get_user(db, username: str):
    if username in db:
        return db[username]
    return None

# Función de autenticación: verifica que el usuario existe y que la contraseña es correcta.
def authenticate_user(db, username: str, password: str):
    user = get_user(db, username)
    if not user:
        return False
    if not verify_password(password, user["hashed_password"]):
        return False
    return user

# Función para crear el token de acceso (JWT) con una expiración
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)  # Valor por defecto
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Dependencia para extraer el usuario actual a partir del token
async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudo validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = get_user(fake_users_db, username)
    if user is None:
        raise credentials_exception
    return user

# Dependencia para verificar que el usuario esté activo
async def get_current_active_user(current_user: dict = Depends(get_current_user)):
    if current_user.get("disabled"):
        raise HTTPException(status_code=400, detail="Usuario inactivo")
    return current_user

# (Opcional) Aquí puedes agregar lógica para limitar la tasa de solicitudes (rate limiting)
# Por ejemplo, usando slowapi: https://slowapi.readthedocs.io/en/latest/
    