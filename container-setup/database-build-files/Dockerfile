FROM docker.io/library/debian:stable
ENV POSTGRES_DB=campus_messaging
ENV POSTGRES_PASSWORD=new_password

RUN echo 'installing curl and ca-certificates'
RUN apt update && apt install curl ca-certificates -y

RUN echo 'fetching ACCC4CF8.asc signature file and placing it to /usr/share/postgresql-common/pgdg'
RUN mkdir -p /usr/share/postgresql-common/pgdg \
	&&  curl -o /usr/share/postgresql-common/pgdg/apt.postgresql.org.asc --fail https://www.postgresql.org/media/keys/ACCC4CF8.asc

RUN echo 'placing pgdg.sources skeleton to /etc/apt/sources.list.d/pgdg.sources'
COPY ./container-setup/database-build-files/pgdg.sources /etc/apt/sources.list.d/

RUN echo 'rewriting VERSION_CODENAME to the current version in the placed pgdg.sources skeleton'
RUN codename=$(cat /etc/os-release | grep VERSION_CODENAME | awk -F '=' '{print $2}') \
	&& sed -i "s|VERSION_CODENAME|$codename|" /etc/apt/sources.list.d/pgdg.sources

RUN echo 'installing postgresql-18'
RUN apt update && apt install postgresql-18 -y

RUN echo 'copying postgres starting script to /root'
COPY ./container-setup/database-build-files/database_server_start.sh /root

CMD bash /root/database_server_start.sh "$POSTGRES_DB" "$POSTGRES_PASSWORD"
