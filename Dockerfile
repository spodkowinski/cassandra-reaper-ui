FROM node:alpine

EXPOSE 8000

WORKDIR /usr/local/lib/cassandra-reaper-ui/
ADD . /usr/local/lib/cassandra-reaper-ui/

RUN apk --update add git nodejs && \
    rm -rf /var/cache/apk/* && \
    npm install -g bower && \
    npm install && \
    npm install -g bower && \
    bower --allow-root install

ENTRYPOINT ["npm"]
CMD ["start"]
