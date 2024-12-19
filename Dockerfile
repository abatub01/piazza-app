FROM alpine 
# Update alpine's package manager
RUN apk add --update nodejs npm
# Install environment dependencies
COPY . /src
WORKDIR /src
EXPOSE 3000
ENTRYPOINT ["node", "./app.js"]