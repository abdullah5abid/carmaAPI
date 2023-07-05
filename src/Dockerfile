# Stage 1: Build the Nest.js application
# Stage 1: Build the Nest.js application
FROM public.ecr.aws/lambda/nodejs:18 as builder

WORKDIR /src

# Copies package.json and package-lock.json to Docker environment
COPY ./*.json lambda.ts ./
COPY ./*.ts ./
COPY ./yarn.lock ./

# Install all node packages
RUN npm install

# Copies everything over to Docker environment
COPY ./src .

RUN npm run build --output /app

FROM public.ecr.aws/lambda/nodejs:18

WORKDIR ${LAMBDA_TAST_ROOT}
COPY --from=builder /src/dist/* ./

CMD ["lambda.handler"]

# FROM public.ecr.aws/lambda/nodejs:18

# WORKDIR /src

# # Copies package.json and package-lock.json to Docker environment
# COPY ./*.json ./
# COPY ./*.ts ./
# COPY ./yarn.lock ./

# # Install all node packages
# RUN npm install

# # Copies everything over to Docker environment
# COPY ./src .

# RUN npm run build --output /app

# WORKDIR /app
# # COPY --from=0 /src/dist .

# CMD ["dist/lambda.handler"]

