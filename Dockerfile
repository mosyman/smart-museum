# ---- 构建阶段 ----
FROM maven:3.9-eclipse-temurin-11 AS builder
WORKDIR /build

# 使用阿里云镜像加速（国内网络）
COPY .mvn/settings.xml /root/.m2/settings.xml

# 拷贝 pom 预热依赖（失败时不阻断后续构建）
COPY pom.xml ./
RUN mvn -B -q dependency:resolve || true

# 拷贝源码并打包
COPY src ./src
RUN mvn -B clean package -DskipTests

# ---- 运行阶段 ----
FROM eclipse-temurin:11-jre
WORKDIR /app

COPY --from=builder /build/target/*.jar app.jar

EXPOSE 8081
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
