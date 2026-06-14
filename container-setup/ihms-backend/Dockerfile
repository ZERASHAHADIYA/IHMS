FROM docker.io/library/debian:stable

WORKDIR /root

RUN echo 'installing node'
RUN apt update && apt install curl -y
COPY ./node_install.sh .
RUN bash ./node_install.sh

RUN echo 'setting up IHMS backend...'
COPY ./IHMS/backend ./ihms-backend
COPY ./npm_install.sh .
RUN bash ./npm_install.sh ./ihms-backend

COPY ./npm_starter-backend.sh .

CMD bash /root/npm_starter-backend.sh /root/ihms-backend
