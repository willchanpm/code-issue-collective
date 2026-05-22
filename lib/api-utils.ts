import { getErrorMessage } from '@/lib/errorUtils'

export function jsonError(message: string, status = 500): Response {
  return Response.json({ error: message }, { status })
}

export { getErrorMessage }

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

