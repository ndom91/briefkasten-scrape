import { fetchImage, uploadImage, getTime } from './lib.js'
import * as pg from 'pg'
const { Client } = pg.default

;(async () => {
  let client
  try {
    client = new Client({
      connectionString: process.env.DATABASE_URL,
    })
    await client.connect()

    // Fetch the first 5 Bookmarks with missing imageUrls
    const { rows } = await client.query(
      `SELECT id, url, "userId"
      FROM "Bookmark"
      WHERE image IS NULL
      OR image NOT LIKE $1
      LIMIT $2`,
      [
        process.env.SUPABASE_URL + '%',
        process.env.BOOKMARKS_CHUNK ? parseInt(process.env.BOOKMARKS_CHUNK) : 5,
      ]
    )

    /*WHERE (image IS NULL)
      OR (image LIKE 'https://source.unsplash.com/%')
      OR (image LIKE 'https://i.picsum.photos/%')*/
    /*WHERE (image IS NULL)
      OR (image NOT LIKE $1)*/
    if (rows.length === 0) {
      // No more bookmarks with missing imageUrls found, exit 0
      console.log(`[${getTime()}] No more bookmarks with missing images found.`)
      process.exit(0)
    }

    console.log(`[${getTime()}] Fetched bookmarks`)
    console.table(rows)

    // For each row, i.e. bookmark, visit the URL with Playwright and
    // capture a screenshot. Then upload that screenshot to Imagekit
    for (const row of rows) {
      console.log(`\n[${getTime()}] Attempting URL: ${row.url}`)

      const { id, url, userId } = row
      const imageBuffer = await fetchImage(url, id)

      if (imageBuffer) {
        const { imageUrl, imageBlur } = await uploadImage(
          userId,
          imageBuffer,
          Date.now()
          //new URL(url).hostname
        )

        console.log(`[${getTime()}] Uploaded image: ${imageUrl}`)

        const updateRes = await client.query(
          `UPDATE "Bookmark" SET image = $1, "imageBlur" = $2 WHERE id = $3 AND "userId" = $4`,
          [imageUrl, imageBlur, id, userId]
        )

        if (updateRes.rowCount === 1) {
          console.log(
            `[${getTime()}] Successfully updated ${
              new URL(url)?.hostname ?? ''
            } (${id})`
          )
        }
      }
    }

    console.log(`\n[${getTime()}] Successfully finished job`)

    // Finished all fetched images, exit 0
    process.exit(0)
  } catch (e) {
    // Error fetching and uploading images, exit 1
    console.error(`[${getTime()}] Error`, e)
    process.exit(1)
  } finally {
    await client.end()
  }
})()
