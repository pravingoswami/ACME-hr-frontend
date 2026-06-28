import { z } from 'zod'
import { employeeStatusValues } from '../types/enums'

export const employeeFormSchema = z.object({
  employeeCode: z.string().min(1, 'Employee code is required'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  department: z.string().min(1, 'Department is required'),
  position: z.string().min(1, 'Position is required'),
  hireDate: z.string().min(1, 'Hire date is required'),
  salary: z.number().positive('Salary must be a positive number').optional(),
  status: z.enum(employeeStatusValues),
  countryId: z.string().optional(),
  departmentId: z.string().optional(),
  jobGradeId: z.string().optional(),
})

export type EmployeeFormValues = z.infer<typeof employeeFormSchema>
export type CreateEmployeeInput = EmployeeFormValues
export type UpdateEmployeeInput = EmployeeFormValues

export function toEmployeePayload(values: EmployeeFormValues): CreateEmployeeInput {
  return {
    ...values,
    phone: values.phone?.trim() ? values.phone.trim() : undefined,
    salary: values.salary,
    countryId: values.countryId || undefined,
    departmentId: values.departmentId || undefined,
    jobGradeId: values.jobGradeId || undefined,
  }
}
