# ---- Build stage ----
FROM eclipse-temurin:25-jdk AS build
WORKDIR /app

# Wrapper do Maven primeiro (melhora o cache de camadas)
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw

# Codigo e build (sem testes para o deploy)
COPY src/ src/
RUN ./mvnw -B -DskipTests clean package

# ---- Runtime stage ----
FROM eclipse-temurin:25-jdk
WORKDIR /app
COPY --from=build /app/target/backend-0.0.1-SNAPSHOT.jar app.jar

# Porta do servidor (o host pode sobrescrever via env PORT/SERVER_PORT)
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
