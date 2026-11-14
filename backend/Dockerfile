FROM node:22.23.5-alpine
# Installing libvips-dev for sharp Compatibility
RUN apk update && apk add --no-cache build-base gcc autoconf automake zlib-dev libpng-dev nasm bash vips-dev git
ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}

WORKDIR /opt/
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
# renovate: datasource=npm depName=node-gyp
ARG NODE_GYP_VERSION=11.5.0
# renovate: datasource=npm depName=pnpm
ARG PNPM_VERSION=12.18.0
RUN npm install -g node-gyp@"${NODE_GYP_VERSION}" pnpm@"${PNPM_VERSION}" && pnpm config set fetch-retry-maxtimeout 600000 -g && pnpm install
ENV PATH=/opt/node_modules/.bin:$PATH

WORKDIR /opt/app
COPY . .
RUN chown -R node:node /opt/app
USER node
RUN ["pnpm", "run", "build"]
EXPOSE 1337
VOLUME [ "/opt/app/public/uploads" ]
CMD ["pnpm", "run", "develop"]
