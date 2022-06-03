FROM mcr.microsoft.com/playwright:v1.16.2-focal

COPY . /src
WORKDIR /src

RUN npm install
RUN npx playwright install chromium

CMD [ "npm", "start"]
