# Stage 1: Build the Nest.js application
FROM public.ecr.aws/lambda/nodejs:18

WORKDIR /src

COPY ./src ./
COPY package*.json ./

RUN npm install
RUN npm run build

WORKDIR /app
COPY --from=0 /src/dist .

CMD ["dist/lambda.handler"]
