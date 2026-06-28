import { z } from 'zod'

export const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
})

export const updateUserFormSchema = z.object({
  email: z.string().email('Invalid email address'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  password: z
    .string()
    .optional()
    .refine((value) => !value || value.length >= 8, {
      message: 'Password must be at least 8 characters',
    }),
  isActive: z.boolean(),
})

export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserFormValues = z.infer<typeof updateUserFormSchema>

export type UpdateUserInput = {
  email?: string
  password?: string
  firstName?: string
  lastName?: string
  isActive?: boolean
}

export function toUpdateUserPayload(values: UpdateUserFormValues): UpdateUserInput {
  return {
    email: values.email,
    firstName: values.firstName,
    lastName: values.lastName,
    isActive: values.isActive,
    ...(values.password ? { password: values.password } : {}),
  }
}
