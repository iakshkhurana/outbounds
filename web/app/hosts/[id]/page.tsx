'use client'

import { use } from 'react'
import { HostDetailPage } from '@/components/hosts/host-detail-page'

export default function HostPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  return <HostDetailPage hostId={id} />
}
