// Generate CSV string from array of objects
export function generateCSV(data: Record<string, string | number | null | undefined>[], headers: string[]): string {
  if (data.length === 0) {
    return headers.join(',') + '\n'
  }

  const escapeValue = (value: string | number | null | undefined): string => {
    if (value === null || value === undefined) {
      return ''
    }
    const str = String(value)
    // If the value contains comma, quote, or newline, wrap it in quotes
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }

  const headerRow = headers.map(escapeValue).join(',')
  const dataRows = data.map(row =>
    headers.map(header => escapeValue(row[header])).join(',')
  )

  return [headerRow, ...dataRows].join('\n')
}

// Trigger browser download of CSV content
export function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
