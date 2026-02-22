export type VitalType = 'systolic' | 'diastolic' | 'pulse' | 'spo2'

export interface VitalDataPoint {
  date: string
  value: number
}

export interface VitalSeries {
  type: VitalType
  label: string
  data: VitalDataPoint[]
  referenceRange: { min: number; max: number }
  unit: string
}

export type ParameterPointStatus = 'normal' | 'borderline' | 'abnormal'

export interface ParameterDataPoint {
  date: string
  value: number
  status: ParameterPointStatus
}

export interface ParameterReferenceRange {
  min: number
  max: number
}
