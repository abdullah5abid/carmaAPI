FROM public.ecr.aws/lambda/nodejs:18

EXPOSE 3000

COPY . .

RUN yarn && yarn build

CMD ["yarn", "start:prod"]

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
