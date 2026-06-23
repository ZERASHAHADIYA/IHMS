FROM docker.io/library/debian:stable

WORKDIR /root

RUN echo 'installing node'
RUN apt update && apt install curl -y
COPY ./node_install.sh .
RUN bash ./node_install.sh

RUN echo 'setting up IHMS frontend...'
COPY ./IHMS/frontend ./ihms-frontend
COPY ./npm_install.sh .
RUN bash ./npm_install.sh ./ihms-frontend

COPY ./npm_starter-frontend.sh .

CMD bash /root/npm_starter-frontend.sh /root/ihms-frontend
