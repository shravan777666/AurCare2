export default function LoadingSpinner({ size = 'default' }) {
  const sizeClasses = {
    small: 'h-4 w-4 border-2',
    default: 'h-8 w-8 border-3',
    large: 'h-12 w-12 border-4'
  }

  return (
    <div className="flex items-center justify-center">
      <div
        className={`animate-spin rounded-full border-t-indigo-600 border-r-indigo-600 border-b-indigo-600 border-l-transparent ${sizeClasses[size]}`}
      />
    </div>
  )
}