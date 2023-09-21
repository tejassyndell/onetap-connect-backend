# Use an official Node.js runtime with Alpine Linux as the base image
FROM node:18.17.0-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Copy the rest of the application source code
COPY . .

# Expose the port that your application will listen on (replace 3000 with your application's port)
EXPOSE 3000

# Define the command to start your application
CMD ["node", "app.js"]
