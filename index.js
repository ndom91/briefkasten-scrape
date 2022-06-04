import { fetchImage, uploadImage } from './lib.js'
import mysql from 'mysql2/promise'

// For now, only run for ndom91 user
const userId = 'cl2z766os0010tfbh1lh04u3s'

;(async () => {
  try {
    const connection = await mysql.createConnection(process.env.DATABASE_URL)

    // Fetch the first 5 Bookmarks with missing imageUrls
    const [readRows] = await connection.execute(
      'SELECT id, url FROM `Bookmark` WHERE `userId` = ? AND `image` IS NULL LIMIT 5',
      [userId]
    )

    if (readRows.length === 0) {
      // No more bookmarks with missing imageUrls found, exit 0
      console.log(
        `[${new Date().getTime()}] No more bookmarks with missing images found.`
      )
      process.exit(0)
    }

    console.log(`[${new Date().getTime()}] Fetched bookmarks`, readRows)

    // For each row, i.e. bookmark, visit the URL with Playwright and
    // capture a screenshot. Then upload that screenshot to Imagekit
    for (const row of readRows) {
      console.log(`\n[${new Date().getTime()}] Attempting URL: ${row.url}`)

      const { id, url } = row
      const imageBuffer = await fetchImage(url)

      if (imageBuffer) {
        const imageUrl = await uploadImage(imageBuffer, `${url}.png`)
        console.log(`[${new Date().getTime()}] Uploaded image: ${imageUrl}`)
        const [updateRows] = await connection.execute(
          'UPDATE `Bookmark` SET `image` = ? WHERE `id` = ? AND `userId` = ?',
          [imageUrl, id, userId]
        )
        if (updateRows.affectedRows === 1) {
          console.log(
            `[${new Date().getTime()}] Successfully updated ${
              new URL(url)?.hostname ?? ''
            } (${id})`
          )
        }
      }
    }

    console.log(`\n[${new Date().getTime()}] Successfully finished job`)

    // Finished all fetched images, exit 0
    process.exit(0)
  } catch (e) {
    // Error fetching and uploading images, exit 1
    console.error(`[${new Date().getTime()}] Error`, e)
    process.exit(1)
  }
})()
