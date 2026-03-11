export type DataExportStatus = 'pending' | 'processing' | 'completed' | 'failed'

export interface DataExportResponse {
  id: string
  status: DataExportStatus
  requestedAt: string
  completedAt: string | null
  downloadUrl: string | null
}
