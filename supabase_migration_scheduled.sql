-- =====================================================
-- Migration: scheduled 상태 추가 + 자동 대여처리 cron
-- Supabase SQL Editor에서 전체 실행
-- =====================================================

-- 1. rentals.status 에 'scheduled' 추가
ALTER TABLE rentals DROP CONSTRAINT IF EXISTS rentals_status_check;
ALTER TABLE rentals ADD CONSTRAINT rentals_status_check
  CHECK (status IN ('rented', 'returned', 'scheduled'));


-- =====================================================
-- 2. 자동처리 함수 (매일 13:00 KST 실행)
--    - scheduled → rented  (rental_date 당일 도래)
--    - rented    → returned (due_date 익일 자동 반납)
--    on_rental_return 트리거가 returned_at 변경을 감지하여
--    장비 status = 'available' 로 자동 복구됨
-- =====================================================
CREATE OR REPLACE FUNCTION process_rental_auto_tasks()
RETURNS void AS $$
DECLARE
  today_kst DATE := (NOW() AT TIME ZONE 'Asia/Seoul')::DATE;
BEGIN
  -- scheduled → rented: rental_date 가 오늘 이하인 예약 활성화
  UPDATE rentals
  SET status = 'rented'
  WHERE status = 'scheduled'
    AND rental_date <= today_kst;

  -- rented → returned: due_date 당일 오후 1시에 자동 반납
  -- due_date <= today 이면 반납 처리 (오후 2시 신규 대여와 충돌 없음)
  -- (on_rental_return 트리거가 장비 상태도 available 로 복구)
  UPDATE rentals
  SET status = 'returned',
      returned_at = NOW()
  WHERE status = 'rented'
    AND due_date <= today_kst;
END;
$$ LANGUAGE plpgsql;


-- =====================================================
-- 3. pg_cron 스케줄 등록 (13:00 KST = 04:00 UTC)
--    Supabase 대시보드 → Database → Extensions 에서
--    pg_cron 이 활성화되어 있어야 합니다.
-- =====================================================
SELECT cron.schedule(
  'auto-rental-tasks',          -- 잡 이름
  '0 4 * * *',                  -- UTC 04:00 = KST 13:00
  'SELECT process_rental_auto_tasks()'
);
