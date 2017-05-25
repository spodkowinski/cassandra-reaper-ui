FROM node:alpine

EXPOSE 8000

WORKDIR /usr/local/lib/cassandra-reaper-ui/build/
ADD . /usr/local/lib/cassandra-reaper-ui/

RUN cd /usr/local/lib/cassandra-reaper-ui/ && \
    apk --update add git nodejs python && \
    rm -rf /var/cache/apk/* && \
    npm install -g bower && \
    npm install && \
    npm install -g bower && \
    bower --allow-root install && \
    npm run minimize


ENTRYPOINT ["python"]
CMD ["-m", "SimpleHTTPServer", "8000"]
