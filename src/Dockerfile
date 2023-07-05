# Stage 1: Build the Nest.js application
FROM public.ecr.aws/lambda/nodejs:18 as builder


# Copies package.json and package-lock.json to Docker environment
COPY ./package*.json ${LAMBDA_TASK_ROOT} ./ 

COPY lambda.ts ${LAMBDA_TASK_ROOT}

# Install all node packages
RUN npm install

# Copies everything over to Docker environment
COPY . .

RUN npm run build


CMD ["dist/lambda.handler"]
