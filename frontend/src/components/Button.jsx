export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'default',
  loading = false,
  disabled = false,
  className = '',
  onClick,
  ...props
}) {
  const baseClasses = 'inline-flex items-center justify-center rounded-lg font-semibold transition-colors duration-200 ease-in-out disabled:cursor-not-allowed disabled:opacity-50'

  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500',
    secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
  }

  const sizes = {
    small: 'px-3 py-1.5 text-sm',
    default: 'px-4 py-2 text-sm',
    large: 'px-6 py-3 text-base'
  }

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <>
          <svg
            className="-ml-1 mr-2 h-4 w-4 animate-spin text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  )
}