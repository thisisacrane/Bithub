function formatDueDate(dateStr) {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}/${d.getDate()} 반납`
}

const badgeStyle = (bg, color) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '5px',
  fontSize: '12px',
  fontWeight: '500',
  padding: '4px 10px',
  borderRadius: '9999px',
  backgroundColor: bg,
  color: color,
})

const dotStyle = (color) => ({
  width: '7px',
  height: '7px',
  borderRadius: '50%',
  backgroundColor: color,
  flexShrink: 0,
})

export default function StatusBadge({ status, rental }) {
  if (status === 'available') {
    return (
      <span style={badgeStyle('#f0fdf4', '#16a34a')}>
        <span style={dotStyle('#22c55e')} />
        대여 가능
      </span>
    )
  }

  if (status === 'rented' && rental) {
    return (
      <span style={badgeStyle('#eff6ff', '#2563eb')}>
        <span style={dotStyle('#3b82f6')} />
        {rental.borrower_generation}기 {rental.borrower_name} · {formatDueDate(rental.due_date)}
      </span>
    )
  }

  if (status === 'maintenance') {
    return (
      <span style={badgeStyle('#fefce8', '#ca8a04')}>
        <span style={dotStyle('#eab308')} />
        수리중
      </span>
    )
  }

  return null
}
