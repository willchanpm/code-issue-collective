import { getErrorMessage, jsonError, readPhotoFromFormData } from '@/lib/api-utils'
import { analyzePhoto } from '@/lib/services/aiService'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const photo = await readPhotoFromFormData(formData)

    if (!photo) {
      return jsonError('Missing photo upload', 400)
    }

    const analysis = await analyzePhoto(photo.imageBase64, photo.mimeType)
    return Response.json({
      description: analysis.description,
      analysis,
    })
  } catch (error) {
    return jsonError(getErrorMessage(error, 'Failed to analyze photo'))
  }
}
