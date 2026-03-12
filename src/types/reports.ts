export type ReportType = 'blood_test' | 'urine_test' | 'radiology' | 'cardiology' | 'other'

export type ReportStatus =
  | 'draft'
  | 'uploaded'
  | 'processing'
  | 'clean'
  | 'infected'
  | 'validated'
  | 'published'
  | 'archived'
  | 'extracting'
  | 'extracted'
  | 'extraction_failed'

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
  labName: string | null
  highlightParameter: string | null
  createdAt: string
}

export interface ReportDetail extends Report {
  parameters: ReportParameter[]
  objectKey: string
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
  objectKey: string
  expiresAt: string
}

export interface DownloadUrlResponse {
  downloadUrl: string
  expiresAt: string
}

export interface CreateReportParameterRequest {
  code: string
  name: string
  value?: number
  valueText?: string
  unit?: string
  referenceRange?: string
  isAbnormal?: boolean
}

export interface CreateReportRequest {
  reportType: ReportType
  objectKey: string
  labName?: string
  labCode?: string
  collectedAt?: string
  reportedAt?: string
  notes?: string
  parameters: CreateReportParameterRequest[]
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

export type ExtractionStatus = 'pending' | 'processing' | 'completed' | 'failed'

export type ExtractionMethod = 'ocr' | 'native_text' | 'hybrid'

export interface ExtractionStatusResponse {
  status: ExtractionStatus
  extractionMethod: ExtractionMethod | null
  structuringModel: string | null
  extractedParameterCount: number
  overallConfidence: number | null
  pageCount: number | null
  extractedAt: string | null
  errorMessage: string | null
  attemptCount: number
}
