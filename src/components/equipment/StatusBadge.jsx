
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

function getToday() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getRentalLabel(rental, selectedDate) {
  const today = getToday()
  let suffix
  if (selectedDate && selectedDate > today) suffix = '대여 예정'
  else if (selectedDate === today || !selectedDate) suffix = '대여중'
  else suffix = '대여'
  return `${rental.borrower_generation}기 ${rental.borrower_name} ${suffix}`
}

export default function StatusBadge({ status, rental, selectedDate }) {
  if (status === 'maintenance') {
    return (
      <span style={badgeStyle('#fefce8', '#ca8a04')}>
        <span style={dotStyle('#eab308')} />
        수리중
      </span>
    )
  }

  // 선택한 날짜가 있는 경우: 매칭된 대여 정보 기반으로 판단
  if (selectedDate) {
    if (rental) {
      return (
        <span style={badgeStyle('#eff6ff', '#2563eb')}>
          <span style={dotStyle('#3b82f6')} />
          {getRentalLabel(rental, selectedDate)}
        </span>
      )
    }

    // 선택한 날짜에 해당 대여가 없으면 대여 가능
    return (
      <span style={badgeStyle('#f0fdf4', '#16a34a')}>
        <span style={dotStyle('#22c55e')} />
        대여 가능
      </span>
    )
  }

  // selectedDate 없이 호출된 경우 (CameraPage 등) 기존 로직
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
        {getRentalLabel(rental, selectedDate)}
      </span>
    )
  }

  return null
}
