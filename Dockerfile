# First create development image to build the js code
FROM node:16.18.0-alpine as development

WORKDIR /app

COPY package*.json .
RUN npm ci

COPY tsconfig.json .
COPY src src
RUN ["npm", "run", "build"]

# Now build the production image only containing the compiled js code
FROM node:16.18.0-alpine as production

# Run in production by default
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /app

RUN chown node:node ./
USER node

COPY package*.json .
RUN npm ci --only=production && npm cache clean --force

COPY --from=development /app/dist ./dist

CMD ["node", "dist/index.js"]