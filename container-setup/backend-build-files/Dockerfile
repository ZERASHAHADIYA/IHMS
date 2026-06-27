FROM docker.io/library/debian:stable

WORKDIR /root

RUN echo 'copying necessary scripts to container /root'
COPY ./container-setup/backend-build-files/node_install.sh .
COPY ./container-setup/backend-build-files/npm_install.sh .
COPY ./container-setup/backend-build-files/backend_server_start.sh .
COPY ./container-setup/backend-build-files/initialize_database.sh .

RUN echo 'copying ihms backend directory to /root/ihms-backend'
COPY ./backend ./ihms-backend

RUN echo 'installing curl'
RUN apt update && apt install curl -y

RUN echo 'installing node using copied script'
RUN bash ./node_install.sh

RUN echo 'installing node modules using copied script'
RUN bash ./npm_install.sh ./ihms-backend

CMD bash /root/backend_server_start.sh /root/ihms-backend
