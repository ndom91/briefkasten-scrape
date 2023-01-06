import { createClient } from '@supabase/supabase-js'
import playwright from 'playwright'
import * as pg from 'pg'
const { Client } = pg.default

if (!process.env.SUPABASE_URL) throw new Error('Missing env.SUPABASE_URL')
if (!process.env.SUPABASE_KEY) throw new Error('Missing env.SUPABASE_KEY')
if (!process.env.SUPABASE_KEY) throw new Error('Missing env.SUPABASE_BUCKET_ID')

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
)

const fetchImage = async (url, id) => {
  let client
  try {
    const browser = await playwright.chromium.launch()
    const page = await browser.newPage({ ignoreHTTPSErrors: true })
    await page.goto(url)

    // Hack for accepting cookie banners
    const selectors = [
      '[id*=cookie] a',
      '[class*=consent] button',
      '[class*=cookie] a',
      '[id*=cookie] button',
      '[class*=cookie] button',
    ]

    const regex =
      /(Accept all|I agree|Accept|Agree|Agree all|Ich stimme zu|Okay|OK)/

    const elements = await page.$$(selectors.join(', '))
    for (const el of elements) {
      const innerText = (await el.getProperty('innerText')).toString()
      regex.test(innerText) && el.click()
    }

    // Wait for cookie banner to be gone
    await page.waitForTimeout(2500)

    // Snap screenshot
    const buffer = await page.screenshot({ type: 'jpeg', quality: 50 })

    await page.close()
    await browser.close()

    return buffer
  } catch (e) {
    console.error(`[${getTime()}] [PW ERROR]`, e)
    console.error(`[${getTime()}] [PW ERROR:MESSAGE]`, e.message)
    if (
      e.message.includes('ERR_CONNECTION_REFUSED') ||
      e.message.includes('ERR_NAME_NOT_RESOLVED') ||
      e.message.includes('ERR_ABORTED') ||
      e.message.includes('Execution context was destroyed') ||
      e.message.includes('ERR_TOO_MANY_REDIRECTS')
    ) {
      const client = new Client({
        connectionString: process.env.DATABASE_URL,
      })
      await client.connect()
      const imageUrl = `https://source.unsplash.com/random/300x201?sig=${Math.floor(
        Math.random() * 100
      )}`
      const res = await client.query(
        `UPDATE "Bookmark" SET image = $1 WHERE id = $2`,
        [imageUrl, id]
      )
      if (res.rowCount === 1) {
        console.log(
          `[${getTime()}] Could not resolve ${url}, set unsplash random image`
        )
      }
    }
  } finally {
    if (client) {
      await client.end()
    }
  }
}

const uploadImage = async (userId, imageBuffer, filename) => {
  try {
    let { data, error } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET_ID)
      //.from('bookmark-imgs')
      .upload(`${userId}/${filename}.jpg`, imageBuffer, {
        contentType: 'image/jpeg',
        upsert: true,
      })
    if (error) {
      throw error
    }
    if (data) {
      return {
        imageUrl: `${process.env.SUPABASE_URL}/storage/v1/object/public/${data.Key}`,
        //imageUrl: `https://exjtybpqdtxkznbmllfi.supabase.co/storage/v1/object/public/${data.Key}`,
        //imageUrl: `${process.env.SUPABASE_URL}/storage/v1/object/public/${data.Key}`,
      }
    }
  } catch (e) {
    console.error(`[${getTime()}] [SUPABASE UPLOAD ERROR]`, e)
  }
}

const getTime = () => {
  return parseInt(new Date().getTime() / 1000)
}

export { fetchImage, uploadImage, getTime }
