FROM mcr.microsoft.com/playwright:v1.16.2-focal

# copy project (including tests)
COPY . /src

WORKDIR /src

# Install dependencies
RUN npm install

# Install browsers
RUN npx playwright install

# Run playwright test
CMD [ "npm", "start"]
