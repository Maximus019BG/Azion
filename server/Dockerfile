FROM openjdk:17-jdk

WORKDIR /app

COPY ./Azion/target/Azion-0.0.1-SNAPSHOT.jar /app/

COPY .env /app/

EXPOSE 8080

CMD ["java", "-jar", "Azion-0.0.1-SNAPSHOT.jar"]