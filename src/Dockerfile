# Stage 1: Build the Nest.js application
FROM public.ecr.aws/lambda/nodejs:18

WORKDIR /src

# Copies package.json and package-lock.json to Docker environment
COPY ./package*.json ./src/

# Install all node packages
RUN npm install

# Copies everything over to Docker environment
COPY . .

RUN npm run build

WORKDIR /app
COPY --from=0 /src/dist .

CMD ["dist/lambda.handler"]
