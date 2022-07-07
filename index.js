import { fetchImage, uploadImage } from './lib.js'
import * as pg from 'pg'
const { Client } = pg.default

// For now, only run for ndom91 user
const userId = 'cl4gz8n0h000823bqdl0j2f4o'

;(async () => {
  let client
  try {
    client = new Client({
      connectionString: process.env.DATABASE_URL,
    })
    await client.connect()

    // Fetch the first 5 Bookmarks with missing imageUrls
    const { rows } = await client.query(
      `SELECT id, url FROM "Bookmark" WHERE ("userId" = $1) AND (image IS NULL OR image LIKE '%unsplash%') LIMIT $2`,
      [
        userId,
        process.env.BOOKMARKS_CHUNK ? parseInt(process.env.BOOKMARKS_CHUNK) : 5,
      ]
    )

    if (rows.length === 0) {
      // No more bookmarks with missing imageUrls found, exit 0
      console.log(
        `[${
          new Date().getTime() / 1000
        }] No more bookmarks with missing images found.`
      )
      process.exit(0)
    }

    console.log(`[${new Date().getTime() / 1000}] Fetched bookmarks`, rows)

    // For each row, i.e. bookmark, visit the URL with Playwright and
    // capture a screenshot. Then upload that screenshot to Imagekit
    for (const row of rows) {
      console.log(
        `\n[${new Date().getTime() / 1000}] Attempting URL: ${row.url}`
      )

      const { id, url } = row
      const imageBuffer = await fetchImage(url, id)

      if (imageBuffer) {
        const imageUrl = await uploadImage(
          userId,
          imageBuffer,
          new URL(url).hostname
        )
        console.log(
          `[${new Date().getTime() / 1000}] Uploaded image: ${imageUrl}`
        )
        const updateRes = await client.query(
          `UPDATE "Bookmark" SET image = $1 WHERE id = $2 AND "userId" = $3`,
          [imageUrl, id, userId]
        )
        if (updateRes.rowCount === 1) {
          console.log(
            `[${new Date().getTime() / 1000}] Successfully updated ${
              new URL(url)?.hostname ?? ''
            } (${id})`
          )
        }
      }
    }

    console.log(`\n[${new Date().getTime() / 1000}] Successfully finished job`)

    // Finished all fetched images, exit 0
    process.exit(0)
  } catch (e) {
    // Error fetching and uploading images, exit 1
    console.error(`[${new Date().getTime() / 1000}] Error`, e)
    process.exit(1)
  } finally {
    await client.end()
  }
})()
