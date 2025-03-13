# First create development image to build the js code
FROM node:20.19.0-alpine AS development

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src src
RUN ["npm", "run", "build"]

# Now build the production image only containing the compiled js code
FROM node:20.19.0-alpine AS production

# Run in production by default
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /app

RUN chown node:node ./
USER node

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=development /app/dist ./dist

EXPOSE 4000

CMD ["node", "dist/index.js"]
