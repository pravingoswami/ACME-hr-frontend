export function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatSalary(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === '') {
    return '—'
  }

  const amount = typeof value === 'string' ? Number(value) : value
  if (Number.isNaN(amount)) {
    return String(value)
  }

  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function toDateInputValue(value: string) {
  return value.slice(0, 10)
}

export function fullName(firstName: string, lastName: string) {
  return `${firstName} ${lastName}`.trim()
}
