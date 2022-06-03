# 📸 Briefkasten Image Job

Job to periodically fetch missing bookmark screenshot cover photos for users of [Briefkasten](https://github.com/ndom91/briefkasten).

## 🚀 Getting Started

To run this yourself, you'll need a few environment variables. These include a `DATABASE_URL` to your Briefkasten database. As well as the connection details to the image hosting service, in my case [ImageKit](https://imagekit.io).

1. Clone the repository

```sh
$ git clone ssh://github.com/ndom91/briefkasten-scrape
$ cd briefkasten-scrape
```

2. Install dependencies

```sh
$ npm install
```

3. Build Docker container

```sh
$ docker build . -t briefkasten-scrape:latest
```

4. Run container

```sh
$ docker run --rm -d --name briefkasten-scrape \
  -e IMAGEKIT_PRIV_KEY="${{ secrets.IMAGEKIT_PRIV_KEY }}" \
  -e IMAGEKIT_PUB_KEY="${{ secrets.IMAGEKIT_PUB_KEY }}" \
  -e IMAGEKIT_URL="${{ secrets.IMAGEKIT_URL }}" \
  -e DATABASE_URL="${{ secrets.DATABASE_URL }}" \
  briefkasten-scrape:latest
```

## 🏗 Contributing

Open to all contributions, please stick to formatting settings in your PR though!

## 📝 License

MIT
