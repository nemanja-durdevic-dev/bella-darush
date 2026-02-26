interface ErrorMessageProps {
  error: string | string[]
}

export function ErrorMessage({ error }: ErrorMessageProps) {
  const errors = Array.isArray(error) ? error : [error]

  return (
    <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
      {errors.map((err, index) => (
        <div key={index}>{err}</div>
      ))}
    </div>
  )
}
