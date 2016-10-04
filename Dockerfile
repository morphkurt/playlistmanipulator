FROM mhart/alpine-node

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

RUN apk add --no-cache curl

# Install app dependencies
RUN curl https://raw.githubusercontent.com/morphkurt/playlistmanipulator/master/package.json > /usr/src/app/package.json
RUN npm install

# Bundle app source
RUN curl https://raw.githubusercontent.com/morphkurt/playlistmanipulator/master/config.json > /usr/src/app/config.json
RUN curl https://raw.githubusercontent.com/morphkurt/playlistmanipulator/master/app.js > /usr/src/app/app.js

RUN apk del curl

EXPOSE 3000
CMD [ "npm", "start" ]
