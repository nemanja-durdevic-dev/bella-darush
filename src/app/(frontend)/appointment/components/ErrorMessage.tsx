interface ErrorMessageProps {
  error: string | string[]
}

export function ErrorMessage({ error }: ErrorMessageProps) {
  const errors = Array.isArray(error) ? error : [error]

  return (
    <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
      {errors.map((err, index) => (
        <div key={index}>{err}</div>
      ))}
    </div>
  )
}
