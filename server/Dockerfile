FROM ubuntu:latest

RUN apt-get update && apt-get install -y maven openjdk-21-jdk libopencv-dev

WORKDIR /app

COPY ./Azion /app

ENTRYPOINT ["mvn", "spring-boot:run"]