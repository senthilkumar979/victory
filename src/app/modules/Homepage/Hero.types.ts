/** Phased story: 1 student → 2 bridge → 3 hired */
export type JourneyPhase = 1 | 2 | 3

export interface TransformationCardData {
  name: string
  studentDept: string
  studentCollege: string
  professionalRole: string
  professionalCompany: string
  picture: string
}