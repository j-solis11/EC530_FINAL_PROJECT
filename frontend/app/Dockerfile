# Use an official Node.js runtime as a parent image
FROM node:16

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port the React app will run on (default is 3000 for development)
EXPOSE 3000

# Command to run the React app in development mode
CMD ["npm", "start"]
