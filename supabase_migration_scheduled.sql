-- =====================================================
-- Migration: 대여 상태 전환 시간 변경
--   - 대여중(rented)   : 대여 당일  오후 2시 (14:00 KST = 05:00 UTC)
--   - 반납완료(returned): 대여 익일  오후 1시 (13:00 KST = 04:00 UTC)
-- Supabase SQL Editor에서 전체 실행
-- =====================================================

-- 1. rentals.status 에 'scheduled' 추가
ALTER TABLE rentals DROP CONSTRAINT IF EXISTS rentals_status_check;
ALTER TABLE rentals ADD CONSTRAINT rentals_status_check
  CHECK (status IN ('rented', 'returned', 'scheduled'));


-- =====================================================
-- 2. 기존 cron 잡 모두 제거
-- =====================================================
SELECT cron.unschedule(jobid)
FROM cron.job
WHERE command LIKE '%rental%' OR jobname LIKE '%rental%';


-- =====================================================
-- 3. 반납 처리 함수 (04:00 UTC = 13:00 KST 실행)
--    rented → returned : rental_date 익일 오후 1시 자동 반납
-- =====================================================
CREATE OR REPLACE FUNCTION process_rental_auto_return()
RETURNS void AS $$
DECLARE
  today_kst DATE := (NOW() AT TIME ZONE 'Asia/Seoul')::DATE;
BEGIN
  -- rental_date < today 이면 어제 이전 대여 → 반납 처리
  UPDATE rentals
  SET status = 'returned',
      returned_at = NOW()
  WHERE status = 'rented'
    AND rental_date < today_kst;
END;
$$ LANGUAGE plpgsql;


-- =====================================================
-- 4. 대여 활성화 함수 (05:00 UTC = 14:00 KST 실행)
--    scheduled → rented : rental_date 당일 오후 2시 활성화
-- =====================================================
CREATE OR REPLACE FUNCTION process_rental_activate()
RETURNS void AS $$
DECLARE
  today_kst DATE := (NOW() AT TIME ZONE 'Asia/Seoul')::DATE;
BEGIN
  UPDATE rentals
  SET status = 'rented'
  WHERE status = 'scheduled'
    AND rental_date <= today_kst;
END;
$$ LANGUAGE plpgsql;


-- =====================================================
-- 5. 새 cron 잡 등록
-- =====================================================

-- 반납: 매일 04:00 UTC (13:00 KST)
SELECT cron.schedule(
  'auto-rental-return',
  '0 4 * * *',
  'SELECT process_rental_auto_return()'
);

-- 대여 활성화: 매일 05:00 UTC (14:00 KST)
SELECT cron.schedule(
  'auto-rental-activate',
  '0 5 * * *',
  'SELECT process_rental_activate()'
);
