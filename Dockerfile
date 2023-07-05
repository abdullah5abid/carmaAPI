# Stage 1: Build the Nest.js application
FROM public.ecr.aws/lambda/nodejs:18

COPY . .

RUN npm install
RUN npm run build

CMD ["dist/lambda.handler"]