FROM ubuntu:latest

RUN apt-get update && apt-get install -y maven openjdk-21-jdk libopencv-dev

WORKDIR /app

COPY ./Azion /app
COPY .env /app/.env

CMD  ["mvn", "spring-boot:run"]