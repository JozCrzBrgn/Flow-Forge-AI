# Etapa 1: Construcción (Build)
FROM node:20-alpine AS build

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias usando npm install (evita errores si el package-lock.json está desincronizado)
RUN npm install

# Copiar el resto del código fuente (el archivo .env también se copiará aquí y se usará en el build)
COPY . .

# Construir la aplicación para producción (Vite generará los estáticos en la carpeta "dist")
RUN npm run build

# Etapa 2: Servidor Web (Nginx)
FROM nginx:alpine

# Eliminar la configuración por defecto de Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copiar nuestra configuración personalizada para que las rutas de React funcionen correctamente
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar los archivos estáticos construidos en la etapa anterior a Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Exponer el puerto 80 (puerto por defecto de Nginx)
EXPOSE 80

# Comando para iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]
