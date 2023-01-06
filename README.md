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

4. Configure the file `ENVFILE` accordingly

```sh
$vim ENVFILE
```

#### **File `ENVFILE`**

```
DATABASE_URL=postgres://bkAdmin:briefkasten@postgres:5432/briefkasten?sslmode=disable

SUPABASE_KEY=
SUPABASE_URL=
SUPABASE_BUCKET_ID=

BOOKMARKS_CHUNK=5
```

5. Run container

```sh
$ docker run \
  --rm \
  --name briefkasten-scrape \
  --network briefkasten_default \
  --env-file ENVFILE
  briefkasten-scrape:latest
```

This will execute and fetch the first 5 Bookmarks with missing cover images and attempt to capture them with Playwright. They will be uploaded to your image store of choice and then displayed for the user the next time they open their Briefkasten.

## ⌚ Running the container automatically via a cronjob

1. Install your favourite `cron` distribution

```sh
$ sudo apt install cronie
```

2. Enable and start the service

```sh
$ sudo systemctl enable cronie
$ sudo systemctl start cronie
```

3. Edit your crontab

```sh
$ crontab -e
```

You can configure it to run each 20 minutes; add this line, and save the file:

```
*/20 * * * * docker run --rm --name briefkasten-scrape --network briefkasten_default --env-file /PATH/TO/YOUR/ENVFILE briefkasten-scrape:latest
```

`--network` is the network the `briefkasten` docker compose is using. Probably no need to change.

You need to edit `/PATH/TO/YOUR/ENVFILE` above pointing to your `ENVFILE`

If you want to run your cronjon on another period, you can check the respective codes in https://crontab.guru

## 🏗 Contributing

Open to all contributions, please stick to formatting settings in your PR though!

## 📝 License

MIT
