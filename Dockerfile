FROM node:latest
RUN npm install --global nodemon
ADD package.json .
RUN npm install
WORKDIR /var/www
ADD . /var/www
EXPOSE 3000
CMD [ "npm", "run", "dev" ]