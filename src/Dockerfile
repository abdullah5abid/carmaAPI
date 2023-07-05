# Stage 1: Build the Nest.js application
FROM public.ecr.aws/lambda/nodejs:18 as builder

WORKDIR /src/app

# Copies package.json and package-lock.json to Docker environment
COPY package*.json lambda.ts ./ 

# Install all node packages
RUN npm install

# Copies everything over to Docker environment
# COPY . .

RUN npm run build

# WORKDIR /app
COPY --from=builder /src/app/dist/* ./

CMD ["dist/lambda.handler"]
