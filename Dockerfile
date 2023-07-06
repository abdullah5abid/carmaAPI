# Stage 1: Build the Nest.js application
FROM public.ecr.aws/lambda/nodejs:18

COPY . .

RUN npm run build

CMD ["dist/lambda.handler"]

# FROM public.ecr.aws/lambda/nodejs:18

# # Set working directory
# WORKDIR /app

# # Install dependencies
# COPY package*.json ./
# RUN npm install

# # Copy source code
# COPY . .

# # Build the application
# RUN npm run build

# CMD ["dist/lambda.handler"]
