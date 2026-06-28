FROM docker.io/library/debian:stable
ENV POSTGRES_DB=campus_messaging
ENV POSTGRES_PASSWORD=new_password

RUN echo 'copying postgres starting script to /root'
COPY ./container-setup/database-build-files/database_server_start.sh /root

RUN echo 'placing necessary files for postgres installation to required locations'
COPY ./container-setup/database-build-files/apt.postgresql.org.asc /usr/share/postgresql-common/pgdg/
RUN mkdir -p /usr/share/postgresql-common/pgdg
COPY ./container-setup/database-build-files/pgdg.sources /etc/apt/sources.list.d/

RUN echo 'installing ca-certificates'
RUN apt update && apt install ca-certificates -y

RUN echo 'installing postgresql-18'
RUN apt update && apt install postgresql-18 -y

CMD bash /root/database_server_start.sh "$POSTGRES_DB" "$POSTGRES_PASSWORD"
