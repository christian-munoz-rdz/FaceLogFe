# Etapa 1: Construcción de la aplicación Angular
FROM node:20-slim AS build

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar las dependencias
RUN npm install

# Copiar el resto de los archivos del proyecto
COPY . .

# Construir la aplicación Angular
RUN npm run build --prod

RUN ls dist/face-log-fe

# Etapa 2: Configuración de Nginx
FROM nginx:stable-alpine

# Copiar los archivos construidos de Angular desde la etapa anterior
COPY --from=build /app/dist/face-log-fe/browser/ /usr/share/nginx/html

# Copiar el archivo de configuración personalizado de Nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Exponer el puerto en el que Nginx se ejecuta
EXPOSE 5001

# Comando para ejecutar Nginx
CMD ["nginx", "-g", "daemon off;"]
