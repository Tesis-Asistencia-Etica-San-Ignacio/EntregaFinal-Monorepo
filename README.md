# Asistente de Revisión Ética — Hospital San Ignacio

> 🇬🇧 [English](#english-version) · 🇪🇸 [Español](#versión-en-español)

---

## English Version

### What is this project?

This system is a web application designed to assist the **Ethics Committee of Hospital San Ignacio** in the review and evaluation of clinical research protocols. It uses artificial intelligence to support the committee in identifying ethical considerations, inconsistencies, and potential issues in research submissions — reducing manual workload and improving traceability of decisions.

The platform allows committee members to upload protocols, receive AI-generated observations, manage review workflows, and maintain a historical record of evaluations.

📄 **Full project documentation** (architecture, design decisions, user manual, and more) is available at:
👉 [https://github.com/Tesis-Asistencia-Etica-San-Ignacio/EntregaFinal/tree/main/Docs](https://github.com/Tesis-Asistencia-Etica-San-Ignacio/EntregaFinal/tree/main/Docs)

---

### Repository

- **URL**: https://github.com/Tesis-Asistencia-Etica-San-Ignacio/EntregaFinal.git
- **Release tag**: `v1.0.0`
- **License**: MIT

---

### Deployment with Docker Compose

Make sure you have **Docker Desktop** installed and running, then execute the following commands from the project root:

```bash
git clone https://github.com/Tesis-Asistencia-Etica-San-Ignacio/EntregaFinal.git
cd EntregaFinal
git checkout v1.0.0
docker-compose up --build
```

Once the containers are up, open your browser and navigate to:

```
http://localhost:3000/auth
```

to verify the application is running correctly.

---

### Environment Variables

#### Backend

Inside the `Backend/` folder, create a `.env` file using the template below.
Replace all values between `< >` with your own:

```dotenv
# SMTP
SMTP_HOST=<your_smtp_host>
SMTP_PORT=<your_smtp_port>
SMTP_USER=<your_smtp_user>
SMTP_PASS=<your_smtp_pass>

# MongoDB
# MONGO_URI=mongodb+srv://<user>:<password>@cluster.../…
MONGO_URI=mongodb://<user>:<password>@mongo:27017/?authSource=admin

# API
CONVENTION_API=/api

# Port INSIDE the container (matches the 8080:3000 mapping)
PORT=3000

# Frontend URL (used for CORS, etc.)
FRONTEND_URL=http://localhost:3000

# JWT
JWT_SECRET=<your_jwt_secret>
JWT_SECRET_REFRESH=<your_jwt_refresh_secret>

# MinIO
MINIO_URL=http://minio:9000
MINIO_ROOT_USER=<your_minio_user>
MINIO_ROOT_PASSWORD=<your_minio_password>

# AI API Keys
# The following are the only AI providers currently supported by the application:
GROQ_API_KEY=<your_groq_api_key>
GEMINI_API_KEY=<your_gemini_api_key>
```

#### Frontend

Inside the `Frontend/` folder, create a `.env` file with:

```dotenv
VITE_BACKEND_URL=http://localhost:8080/api/
```

---
---

## Versión en Español

### ¿De qué trata este proyecto?

Este sistema es una aplicación web diseñada para asistir al **Comité de Ética del Hospital San Ignacio** en la revisión y evaluación de protocolos de investigación clínica. Utiliza inteligencia artificial para apoyar al comité en la identificación de consideraciones éticas, inconsistencias y posibles problemas en las solicitudes de investigación — reduciendo la carga manual y mejorando la trazabilidad de las decisiones.

La plataforma permite a los miembros del comité cargar protocolos, recibir observaciones generadas por IA, gestionar flujos de revisión y mantener un historial de evaluaciones.

📄 **Documentación completa del proyecto** (arquitectura, decisiones de diseño, manual de usuario y más) disponible en:
👉 [https://github.com/Tesis-Asistencia-Etica-San-Ignacio/EntregaFinal/tree/main/Docs](https://github.com/Tesis-Asistencia-Etica-San-Ignacio/EntregaFinal/tree/main/Docs)

---

### Repositorio

- **URL**: https://github.com/Tesis-Asistencia-Etica-San-Ignacio/EntregaFinal.git
- **Tag de versión**: `v1.0.0`
- **Licencia**: MIT

---

### Despliegue con Docker Compose

Asegúrese de tener **Docker Desktop** instalado y en ejecución, luego ejecute los siguientes comandos desde la raíz del proyecto:

```bash
git clone https://github.com/Tesis-Asistencia-Etica-San-Ignacio/EntregaFinal.git
cd EntregaFinal
git checkout v1.0.0
docker-compose up --build
```

Una vez que los contenedores estén activos, abra su navegador y acceda a:

```
http://localhost:3000/auth
```

para comprobar que la aplicación se está ejecutando correctamente.

---

### Configuración de variables de entorno

#### Backend

En la carpeta `Backend/`, crea un archivo `.env` con la siguiente plantilla.
Reemplaza todos los valores entre `< >` por los tuyos:

```dotenv
# SMTP
SMTP_HOST=<tu_smtp_host>
SMTP_PORT=<tu_smtp_port>
SMTP_USER=<tu_smtp_user>
SMTP_PASS=<tu_smtp_pass>

# MongoDB
# MONGO_URI=mongodb+srv://<usuario>:<password>@cluster.../…
MONGO_URI=mongodb://<usuario>:<password>@mongo:27017/?authSource=admin

# API
CONVENTION_API=/api

# Puerto DENTRO del contenedor (coincide con el mapeo 8080:3000)
PORT=3000

# Frontend (para CORS, etc.)
FRONTEND_URL=http://localhost:3000

# JWT
JWT_SECRET=<tu_jwt_secret>
JWT_SECRET_REFRESH=<tu_jwt_refresh_secret>

# MinIO
MINIO_URL=http://minio:9000
MINIO_ROOT_USER=<tu_minio_user>
MINIO_ROOT_PASSWORD=<tu_minio_password>

# API keys de IA
# Las siguientes son las únicas claves de API de inteligencia artificial compatibles con la aplicación en este momento:
GROQ_API_KEY=<tu_groq_api_key>
GEMINI_API_KEY=<tu_gemini_api_key>
```

#### Frontend

En la carpeta `Frontend/`, crea un archivo `.env` con:

```dotenv
VITE_BACKEND_URL=http://localhost:8080/api/
```
