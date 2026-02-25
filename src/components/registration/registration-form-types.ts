export interface RegistrationFormValues {
  firstName: string
  lastName: string
  email: string
  phone?: string
  dateOfBirth?: string
  gender?: string
  bloodGroup?: string
  address?: string
  doctorData: {
    medicalLicenseNumber: string
    specialization: string
    clinicOrHospitalName?: string
    clinicAddress?: string
  }
  labTechnicianData: {
    labName: string
    labLicenseNumber?: string
    nablAccreditationId?: string
  }
}
