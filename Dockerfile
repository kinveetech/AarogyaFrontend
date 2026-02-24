# Stage 1: Install dependencies
FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# Stage 2: Build the application
FROM node:24-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG AUTH_SECRET=build-placeholder
ARG COGNITO_DOMAIN=https://placeholder.auth.region.amazoncognito.com
ARG COGNITO_ISSUER=https://cognito-idp.us-east-1.amazonaws.com/us-east-1_placeholder
ARG COGNITO_CLIENT_ID=placeholder
ARG API_URL=http://localhost:5000

ENV AUTH_SECRET=$AUTH_SECRET \
    COGNITO_DOMAIN=$COGNITO_DOMAIN \
    COGNITO_ISSUER=$COGNITO_ISSUER \
    COGNITO_CLIENT_ID=$COGNITO_CLIENT_ID \
    API_URL=$API_URL

RUN npm run build

# Stage 3: Production runner
FROM node:24-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=build /app/public ./public
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
