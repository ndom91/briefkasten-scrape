import mysql from 'mysql2/promise' 

const userId = 'cl2z766os0010tfbh1lh04u3s'

;(async () => {
  try {
    const connection = await mysql.createConnection(process.env.DATABASE_URL ?? '');
    const [readRows] = await connection.execute('SELECT id, url FROM `Bookmark` WHERE `userId` = ? AND `image` IS NULL LIMIT 3', [userId])

    console.log('readRows', readRows)
    console.log('typeof readRows', typeof readRows)
    console.log('readRows[0]', readRows[0])

    for (const row of readRows) {
      console.log('Attempting row...', row)
      const { id, url } = row
      const imageBuffer = await fetchImage(url)
      if (imageBuffer) {
        const imageUrl = await uploadImage(imageBuffer, `${url}.png`)
        console.log('Uploaded image', `${url}.png`)
        const [updateRows] = await connection.execute('UPDATE `Bookmark` SET `image` = ? WHERE `id` = ? AND `userId` = ?', [imageUrl, id, userId]);
        console.log('updateRows', updateRows)
      }
    }
  } catch (e) {
    console.error('Database error', e)
  }
})()
