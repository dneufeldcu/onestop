FROM openjdk:8
ARG WAR_NAME
ARG VCS_REF
ARG VERSION
ARG DATE

LABEL org.label-schema.schema-version=1.0
LABEL org.label-schema.version=${VERSION}
LABEL org.label-schema.build-date=${DATE}
LABEL org.label-schema.name="OneStop Search"
LABEL org.label-schema.vendor=CEDAR
LABEL org.label-schema.vcs-url=https://github.com/cedardevs/onestop
LABEL org.label-schema.vcs-ref=${VCS_REF}

WORKDIR /usr/src/app
COPY build/libs/${WAR_NAME} /usr/src/app
RUN ln -s ./${WAR_NAME} api.war
EXPOSE 8097
CMD ["java", "-jar", "/usr/src/app/api.war"]
