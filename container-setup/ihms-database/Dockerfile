FROM docker.io/library/debian:stable
ENV POSTGRES_PASSWORD=new_password
ENV POSTGRES_DB=campus_messaging

RUN echo 'installing postgresql...'
RUN apt update && apt install ca-certificates -y
RUN mkdir -p /usr/share/postgresql-common/pgdg
COPY ./apt.postgresql.org.asc /usr/share/postgresql-common/pgdg/
COPY ./pgdg.sources /etc/apt/sources.list.d/pgdg.sources
RUN apt update && apt install postgresql-18 -y

RUN echo 'setting up postgresql...'
RUN /etc/init.d/postgresql start \
	&& su - postgres -c "psql -c \"ALTER USER postgres WITH PASSWORD '$POSTGRES_PASSWORD'\";" \
	&& su - postgres -c "psql -c 'CREATE DATABASE $POSTGRES_DB;'" \
	&& echo "listen_addresses = '*'" >> /etc/postgresql/18/main/postgresql.conf \
	&& echo 'host    all    all    0.0.0.0/0    scram-sha-256' >> /etc/postgresql/18/main/pg_hba.conf \
	&& /etc/init.d/postgresql stop

CMD bash /etc/init.d/postgresql start && echo 'started server' && exec bash
