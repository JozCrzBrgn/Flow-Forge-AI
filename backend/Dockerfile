# Usar una imagen oficial de Python ligera
FROM python:3.12-slim

# Establecer el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar el archivo de dependencias
COPY requirements.txt .

# Instalar las dependencias de Python
RUN pip install --no-cache-dir -r requirements.txt

# Copiar solo los archivos necesarios para el backend
COPY . .

# Exponer el puerto que usa FastAPI
EXPOSE 8000

# Comando para arrancar el servidor
# Usamos 0.0.0.0 para que sea accesible desde fuera del contenedor
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
