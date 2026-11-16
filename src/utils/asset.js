/**
 * Format asset path safely supporting:
 * - base64 Data URLs (data:image/...)
 * - Blob URLs (blob:...)
 * - External Web URLs (http:// or https://)
 * - Local static asset paths (assets/...)
 */
export const ASSET = (path) => {
  if (!path) return ''
  const str = String(path).trim()
  if (
    str.startsWith('data:') ||
    str.startsWith('blob:') ||
    str.startsWith('http://') ||
    str.startsWith('https://')
  ) {
    return str
  }
  const base = import.meta.env.BASE_URL || '/'
  return `${base}${str.replace(/^\/+/, '')}`
}

/**
 * Resizes and compresses an image File using HTML5 canvas
 * Produces an optimized JPEG Base64 string (~100-200 KB instead of 5-10 MB)
 */
export const compressImageFile = (file, maxWidth = 1200, quality = 0.85) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = reject
    reader.onload = (e) => {
      const img = new Image()
      img.onerror = reject
      img.onload = () => {
        let width = img.width
        let height = img.height

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width)
          width = maxWidth
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)

        // Export as JPEG with reasonable compression
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality)
        resolve(compressedBase64)
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  })
}

