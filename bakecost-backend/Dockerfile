
# ETAPA 1 — BUILD
FROM eclipse-temurin:21-jdk-jammy AS build

WORKDIR /workspace

# Copiar el Maven Wrapper y la configuración de Maven 
COPY .mvn/ .mvn/
COPY mvnw ./

# Asegurar que el script mvnw tenga permisos de ejecución.
RUN chmod +x mvnw

# Copiar solo el descriptor de dependencias antes que el código fuente.
COPY pom.xml ./

# Descargar todas las dependencias en una capa separada para cache eficiente.
RUN ./mvnw dependency:resolve -B --no-transfer-progress

# Copiar el código fuente y compilar.
COPY src/ ./src/

# Compilar y empaquetar saltando los tests.
RUN ./mvnw package -B --no-transfer-progress -DskipTests


# ETAPA 2 — RUNTIME
FROM eclipse-temurin:21-jre-jammy AS runtime

# Crear un usuario no-root para ejecutar la app de manera más segura.
RUN groupadd --system bakecost && \
    useradd  --system --no-create-home --gid bakecost bakecost

WORKDIR /app

# Copiar el JAR generado en la etapa build.
COPY --from=build /workspace/target/bakecost-backend-0.0.1-SNAPSHOT.jar app.jar

# Dar ownership del archivo al usuario no-root antes de cambiar de usuario.
RUN chown bakecost:bakecost app.jar

# Cambiar al usuario no-root para todo lo que sigue.
USER bakecost

# Puerto
EXPOSE 8080

# Variables de entorno
ENV SPRING_PROFILES_ACTIVE=prod \
    SERVER_PORT=8080 \
    JAVA_OPTS=""

# Arranque de la app 
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"]
