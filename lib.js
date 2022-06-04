import ImageKit from 'imagekit'
import playwright from 'playwright'

const fetchImage = async (url) => {
  try {
    const browser = await playwright.chromium.launch()
    const page = await browser.newPage()
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
    console.error('chromium error', e)
  }
}

const uploadImage = async (imageBuffer, filename) => {
  try {
    const imagekit = new ImageKit({
      publicKey: process.env.IMAGEKIT_PUB_KEY ?? '',
      privateKey: process.env.IMAGEKIT_PRIV_KEY ?? '',
      urlEndpoint: process.env.IMAGEKIT_URL ?? '',
    })

    // Upload image body to ImageKit
    const uploadRes = await imagekit.upload({
      file: imageBuffer,
      fileName: `${filename}.jpg`,
    })

    return uploadRes.url
  } catch (e) {
    console.error('Image upload error', e)
  }
}

export { fetchImage, uploadImage }
