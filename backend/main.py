# backend/main.py
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware

from .auth import (
    authenticate_user,
    create_access_token,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    get_current_active_user,
    fake_users_db
)
from .data_transform import cargar_y_transformar_datos
from datetime import timedelta

app = FastAPI(title="API de Dashboard - Con Login + CSV")

# Lista de orígenes permitidos
# Ajusta si vas a incluir localhost en desarrollo:
origins = [
    "https://dashboard1.crazy-shaw.74-208-19-154.plesk.page",
     "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,   # necesario si usas tokens/cookies
    allow_methods=["*"],
    allow_headers=["*"],
)

# Carga tu CSV, etc.
df = cargar_y_transformar_datos("C:/proyecto/backend/data/data.csv")

@app.post("/token")
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(fake_users_db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Nombre de usuario o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["username"]}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me")
async def read_users_me(current_user: dict = Depends(get_current_active_user)):
    return current_user

@app.get("/datos")
def get_datos():
    """
    Retorna la data del CSV transformada en formato JSON (lista de objetos).
    """
    return df.to_dict(orient="records")
