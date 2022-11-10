FROM haskell:8.10.7-slim-buster

RUN curl -sL https://deb.nodesource.com/setup_19.x | bash - && \
    apt-get install -y nodejs

RUN curl -L http://golfscript.com/nibbles/nibbles-1.00.tgz | tar -xz && \
    cp -r nibbles/* . && \
    rm -rf nibbles all.hs

RUN ghc -O -package ghc *.hs

COPY . .

RUN npm install

CMD ["node", "app.js"]

EXPOSE 8080

EXPOSE 10000
