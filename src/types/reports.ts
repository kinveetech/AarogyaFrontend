export type ReportType = 'lab' | 'prescription' | 'imaging' | 'discharge' | 'other'

export type ReportStatus = 'pending' | 'processing' | 'verified'

export type ParameterStatus = 'normal' | 'high' | 'low'

export interface ReportParameter {
  name: string
  value: string
  unit: string
  referenceRange: string
  status: ParameterStatus
}

export interface Report {
  id: string
  title: string
  reportType: ReportType
  status: ReportStatus
  reportDate: string
  labName: string | null
  doctorName: string | null
  notes: string | null
  highlightParameter: string | null
  createdAt: string
  updatedAt: string
}

export interface ReportDetail extends Report {
  parameters: ReportParameter[]
  fileKey: string
  fileType: string
  fileSizeBytes: number
}

export interface ReportListResponse {
  items: Report[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
}

export interface UploadUrlResponse {
  uploadUrl: string
  fileKey: string
  expiresAt: string
}

export interface DownloadUrlResponse {
  downloadUrl: string
  expiresAt: string
}

export interface CreateReportRequest {
  title: string
  reportType: ReportType
  reportDate: string
  fileKey: string
  notes?: string
}

export interface UploadUrlRequest {
  fileName: string
  contentType: string
}

export interface DownloadUrlRequest {
  reportId: string
}

export interface VerifiedDownloadUrlRequest {
  reportId: string
  expiryMinutes?: number
}

export interface VerifiedDownloadUrlResponse {
  reportId: string
  objectKey: string
  downloadUrl: string
  expiresAt: string
  checksumSha256: string | null
  isServerVerified: boolean
}
