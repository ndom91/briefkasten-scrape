import { fetchImage, uploadImage } from './lib.js'
import mysql from 'mysql2/promise' 

const userId = 'cl2z766os0010tfbh1lh04u3s'

;(async () => {
  try {
    const connection = await mysql.createConnection(process.env.DATABASE_URL ?? '');
    const [readRows] = await connection.execute('SELECT id, url FROM `Bookmark` WHERE `userId` = ? AND `image` IS NULL LIMIT 5', [userId])

    if (readRows.length === 0) {
      console.log('No bookmarks to screenshot found!')
      process.exit(0)
    }

    console.log('Fetched bookmarks', readRows)

    for (const row of readRows) {
      console.log('Attempting row...', row)

      const { id, url } = row
      const imageBuffer = await fetchImage(url)

      if (imageBuffer) {
        const imageUrl = await uploadImage(imageBuffer, `${url}.png`)
        console.debug('ImageUrl', imageUrl)
        const [updateRows] = await connection.execute('UPDATE `Bookmark` SET `image` = ? WHERE `id` = ? AND `userId` = ?', [imageUrl, id, userId]);
        if (updateRows.affectedRows === 1) {
          console.log(`Successfully updated ${new URL(url)?.hostname ?? ''} (${id})`)
        }
      }
    }

    // Finished all fetched images, exit 0
    process.exit(0)
  } catch (e) {
    console.error('Database error', e)
    process.exit(1)
  }
})()
