import { Suspense } from 'react'
import VerifyContent from './VerifyContent'

export default function VerifyPage() {
  return (
    <Suspense fallback={<div>Memuat...</div>}>
      <VerifyContent />
    </Suspense>
  )
}