ARG NODE_VERSION=20.17.0

FROM node:${NODE_VERSION}-alpine as base

WORKDIR /usr/src/app

RUN chown -R node:node /usr/src/app

FROM base as deps

RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev

FROM deps as build

RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci

COPY . .
RUN npm run build

FROM base as final

ENV NODE_ENV production

RUN chown -R node:node /usr/src/app

USER node

RUN mkdir -p /usr/src/app/.next/cache/images

COPY package.json .

COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/.next ./.next
COPY --from=build /usr/src/app/public ./public

EXPOSE 3000

CMD ["npm", "start"]