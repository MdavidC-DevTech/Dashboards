import pandas as pd

def cargar_y_transformar_datos(filepath: str):
    # Cargar CSV con separador ";" y encoding "cp1252"
    df = pd.read_csv(filepath, sep=";", encoding="cp1252")
    
    # Convertir algunos tipos de datos
    df = df.astype({
        "userid": "Int64",
        "user_roleid": "Int64",
        "courseid": "Int64",
        "active_seconds": "Int64"
    })
    
    # Convertir a fecha (ajusta el formato si es necesario)
    df["event_date"] = pd.to_datetime(df["event_date"], format="%Y-%m-%d", errors="coerce")
    
    # Combinar columnas de nombres
    df["Combinada"] = df["user_fname"] + " " + df["user_sname"]
    df["Combinada"] = df["Combinada"].str.replace("  ", " ")
    
    # Calcular minutos_activo y eliminar active_seconds
    df["minutos_activo"] = df["active_seconds"] / 60
    df.drop(columns="active_seconds", inplace=True)
    
    # Calcular horas_activo
    df["horas_activo"] = df["minutos_activo"] / 60
    
    # Agregar columna tiempo_recomendado (valor fijo 240)
    df["tiempo_recomendado"] = 240
    df["tiempo_recomendado"] = df["tiempo_recomendado"].astype("Int64")
    
    # Columna condicional recuento_activo
    def calcular_recuento(minutos):
        if minutos == 0:
            return "Sin minutos"
        elif 0 < minutos <= 10:
            return "1 a 10 minutos"
        elif 10 < minutos <= 40:
            return "10 a 40 minutos"
        else:
            return "más de 40 minutos"
    
    df["recuento_activo"] = df["minutos_activo"].apply(calcular_recuento)
    
    return df
