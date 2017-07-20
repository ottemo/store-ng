FROM ottemo/node:7.8.0

RUN mkdir -pv /home/ottemo/store

COPY . /home/ottemo/store
RUN rm -rf /home/ottemo/store/.git
WORKDIR /home/ottemo/store
RUN npm install

COPY bin/docker-entrypoint.sh /home/ottemo/store

EXPOSE 8080
CMD ./docker-entrypoint.sh
