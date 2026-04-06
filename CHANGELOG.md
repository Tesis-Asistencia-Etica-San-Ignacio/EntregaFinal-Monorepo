# Changelog

## v1.1.0

Basado en la versión `v1.0.0` presentada originalmente con la tesis, esta release consolida una ronda amplia de mejoras técnicas y funcionales sobre la plataforma.

- Refuerzo de seguridad en backend:
  - control de acceso por propietario sobre recursos sensibles
  - protección de archivos y endurecimiento de flujos de subida/descarga
  - rate limiting en rutas críticas
- Mejoras de arquitectura:
  - reducción de dependencias cruzadas entre capas
  - incorporación de `ports` para almacenamiento, generación de PDF y caché de preview
  - traslado de servicios técnicos concretos a `infrastructure`
  - contratos del dominio alineados con entidades del dominio en lugar de DTOs de aplicación
- Mejoras de rendimiento y robustez:
  - reutilización de caché en previsualización de PDFs
  - invalidación correcta de caché al cambiar evaluaciones, normas y estadísticas
  - recuperación más tolerante ante fallos aparentes en la primera evaluación por IA
- Mejoras de usabilidad en frontend:
  - validaciones más claras y consistentes
  - mejor navegación dentro de formularios largos
  - mejoras en responsive, tablas, modales, toasts y visor PDF
  - experiencia más estable en creación de casos, evaluación y envío de resultados

## v1.0.0

Versión base entregada originalmente como parte de la tesis **“Plataforma asistencia evaluación ética HUSI”**.
