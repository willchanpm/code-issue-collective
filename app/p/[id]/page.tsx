import { FriendViewer } from '@/components/FriendViewer'

export default async function FriendPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <main className="page">
      <FriendViewer id={id} />
    </main>
  )
}
