# 📸 Briefkasten Image Job

![GitHub Workflow Status](https://img.shields.io/github/workflow/status/ndom91/briefkasten-scrape/Playwright%20Fetch%20Images?label=job&style=flat-square)
[![Demo](https://img.shields.io/badge/demo-instance-green?style=flat-square)](https://briefkastenhq.com)

Job to periodically fetch missing bookmark screenshot cover photos. This Github Action uses Playwright to periodically fetch missing screenshots of saved Bookmarks.

See also:

- [Briefkasten App Demo](https://briefkastenhq.com)
- [Briefkasten App Repo](https://github.com/ndom91/briefkasten)
- [Briefkasten Extension Repo](https://github.com/ndom91/briefkasten-extension)

## 🚀 Getting Started

To run this yourself, you'll need a Github account and a few environment variables. These include a `DATABASE_URL` to your Briefkasten database. As well as the connection details to your image hosting service, in this case [ImageKit](https://imagekit.io).

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
  -e SUPABASE_KEY="${{ secrets.SUPABASE_KEY }}" \
  -e SUPABASE_URL="${{ secrets.SUPABASE_URL }}" \
  -e DATABASE_URL="${{ secrets.DATABASE_URL }}" \
  -e BOOKMARKS_CHUNK="${{ secrets.BOOKMARKS_CHUNK }}" \
  briefkasten-scrape:latest
```

This will execute and fetch the first 5 Bookmarks with missing cover images and attempt to capture them with Playwright. They will be uploaded to your image store of choice and then displayed for the user the next time they open their Briefkasten.

## 🏗 Contributing

Open to all contributions, please stick to formatting settings in your PR though!

## 📝 License

MIT
