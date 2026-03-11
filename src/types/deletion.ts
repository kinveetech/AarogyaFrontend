export type DeletionStatus = 'pending' | 'processing' | 'completed'

export interface DeletionResponse {
  id: string
  status: DeletionStatus
  requestedAt: string
}
