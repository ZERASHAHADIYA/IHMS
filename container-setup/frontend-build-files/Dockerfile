FROM docker.io/library/debian:stable

WORKDIR /root

RUN echo 'copying necessary scripts to container /root'
COPY ./container-setup/frontend-build-files/node_install.sh .
COPY ./container-setup/frontend-build-files/npm_install.sh .
COPY ./container-setup/frontend-build-files/frontend_server_start.sh .

RUN echo 'copying ihms frontend directory to /root/ihms-frontend'
COPY ./frontend ./ihms-frontend

RUN echo 'installing curl'
RUN apt update && apt install curl -y

RUN echo 'installing node using copied script'
RUN bash ./node_install.sh

RUN echo 'installing node modules using copied script'
RUN bash ./npm_install.sh ./ihms-frontend

CMD bash /root/frontend_server_start.sh /root/ihms-frontend
