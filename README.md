@'
# UTP Assistant

UTP Assistant es una aplicación web orientada a la automatización de solicitudes empresariales mediante inteligencia artificial.

La plataforma integra un asistente conversacional con procesamiento de documentos, transcripción de audio, historial persistente, autenticación y ejecución de acciones sobre servicios externos como Jira, HubSpot y Google Calendar.

El proyecto combina un frontend desarrollado en React con un backend FastAPI desplegado sobre AWS.

## Características principales

- Asistente conversacional con OpenAI.
- Historial persistente de conversaciones.
- Carga y procesamiento de documentos PDF, DOCX y TXT.
- Almacenamiento privado de documentos en Amazon S3.
- Transcripción de audio.
- Transcripción en tiempo real.
- Integración con Jira.
- Integración con HubSpot.
- Integración con Google Calendar.
- Dashboard de métricas y actividad.
- Autenticación mediante Amazon Cognito.
- Auditoría de solicitudes.
- Límites de uso por usuario y globales.
- Gestión segura de credenciales mediante AWS Secrets Manager.
- CI/CD mediante GitHub Actions y OpenID Connect.
- Despliegue del frontend mediante Vercel.
- Despliegue del backend mediante Amazon ECS Fargate.

## Arquitectura

```mermaid
flowchart LR
    U[Usuario] --> V[Vercel / React]

    V --> C[Amazon Cognito]
    V --> ALB[Application Load Balancer]

    ALB --> ECS[Amazon ECS Fargate / FastAPI]

    ECS --> OAI[OpenAI API]
    ECS --> DDB[Amazon DynamoDB]
    ECS --> S3[Amazon S3]
    ECS --> SM[AWS Secrets Manager]

    ECS --> J[Jira]
    ECS --> H[HubSpot]
    ECS --> GC[Google Calendar]

    GH[GitHub] --> GA[GitHub Actions]
    GA -->|OIDC| AWS[AWS]
    GA --> ECR[Amazon ECR]
    ECR --> ECS