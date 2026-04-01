import { RENTAL_RULES, RENTAL_RULES_EXTRA, RENTAL_CONTACT } from '../../constants/rules'

export default function RentalNotice() {
  return (
    <div style={{ borderRadius: '12px', border: '1px solid #fef08a', backgroundColor: '#fefce8', padding: '14px' }}>
      <p style={{ fontSize: '13px', fontWeight: '600', color: '#854d0e', margin: '0 0 8px' }}>📋 대여 유의사항 (필독!)</p>
      <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
        {RENTAL_RULES.map((rule, i) => (
          <li key={i} style={{ fontSize: '12px', color: '#92400e', lineHeight: '1.7', display: 'flex', gap: '6px' }}>
            <span style={{ flexShrink: 0 }}>•</span>
            <span>{rule}</span>
          </li>
        ))}
      </ul>

      <p style={{ fontSize: '12px', color: '#92400e', fontWeight: '700', lineHeight: '1.7', margin: '12px 0 0' }}>
        {RENTAL_RULES_EXTRA}
      </p>

      <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #fde68a' }}>
        <p style={{ fontSize: '12px', color: '#92400e', margin: '0 0 4px' }}>
          추가로 궁금하신 사항은 아래의 연락처로 문의해주시기 바랍니다.
        </p>
        <p style={{ fontSize: '12px', color: '#78350f', fontWeight: '600', margin: 0 }}>
          {RENTAL_CONTACT.role} {RENTAL_CONTACT.name} {RENTAL_CONTACT.phone} ({RENTAL_CONTACT.info})
        </p>
      </div>
    </div>
  )
}
