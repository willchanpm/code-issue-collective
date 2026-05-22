export function jsonError(message: string, status = 500): Response {
  return Response.json({ error: message }, { status })
}

export async function readPhotoFromFormData(formData: FormData) {
  const photo = formData.get('photo')

  if (!(photo instanceof File)) {
    return null
  }

  const buffer = Buffer.from(await photo.arrayBuffer())

  return {
    imageBase64: buffer.toString('base64'),
    mimeType: photo.type || 'image/jpeg',
  }
}

export function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback
}
