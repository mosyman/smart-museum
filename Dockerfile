# ---- 构建阶段 ----
FROM maven:3.9-eclipse-temurin-11 AS builder
WORKDIR /build

# 先拷贝 pom，预热依赖缓存
COPY pom.xml ./
COPY .mvn .mvn
COPY mvnw mvnw.cmd ./
RUN mvn -B -q dependency:go-offline

# 再拷贝源码构建
COPY src ./src
RUN mvn -B -q clean package -DskipTests

# ---- 运行阶段 ----
FROM eclipse-temurin:11-jre
WORKDIR /app

COPY --from=builder /build/target/*.jar app.jar

EXPOSE 8081
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
