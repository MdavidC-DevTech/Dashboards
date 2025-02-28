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

# Cargar el CSV al iniciar la app (o puedes cargarlo lazy en /datos)
df = cargar_y_transformar_datos("C:/proyecto/backend/data/data.csv")

app = FastAPI(title="API de Dashboard - Con Login + CSV")

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # o ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

# Endpoint protegido (ejemplo)
@app.get("/users/me")
async def read_users_me(current_user: dict = Depends(get_current_active_user)):
    return current_user

# Endpoint para retornar los datos del CSV transformados (array)
@app.get("/datos")
def get_datos():
    """
    Retorna la data del CSV transformada en formato JSON (lista de objetos).
    """
    return df.to_dict(orient="records")
