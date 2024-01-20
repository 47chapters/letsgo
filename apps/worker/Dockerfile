FROM --platform=linux/amd64 public.ecr.aws/lambda/nodejs:18 AS base

FROM base AS builder
# Set working directory
WORKDIR /app
RUN npm i -g turbo
COPY . .
RUN turbo prune --scope=worker --docker

# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
WORKDIR /app

# First install dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/yarn.lock ./yarn.lock
RUN npm i -g yarn@1.21
RUN yarn install

# Build the project and its dependencies
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json

# Uncomment and use build args to enable remote caching
# ARG TURBO_TEAM
# ENV TURBO_TEAM=$TURBO_TEAM

# ARG TURBO_TOKEN
# ENV TURBO_TOKEN=$TURBO_TOKEN

RUN yarn turbo run build --filter=worker...

FROM base AS runner
WORKDIR /app
COPY --from=installer /app ${LAMBDA_TASK_ROOT}
CMD [ "apps/worker/dist/index.handler" ]

# docker run -i --rm --name worker -p 9000:8080 letsgo-worker:unknown 
