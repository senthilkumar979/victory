export function downloadGeneratedImage(
  base64: string,
  mimeType: string,
  promptSnippet: string,
) {
  const ext = mimeType.includes('png')
    ? 'png'
    : mimeType.includes('webp')
      ? 'webp'
      : mimeType.includes('jpeg') || mimeType.includes('jpg')
        ? 'jpg'
        : 'png'
  const a = document.createElement('a')
  a.href = `data:${mimeType};base64,${base64}`
  a.download = `${promptSnippet.replace(/[^\w\s-]/g, '').slice(0, 40) || 'nano-banana'}.${ext}`
  a.rel = 'noopener'
  a.click()
}
