-- =====================================================
-- Migration: 대여 신청 비밀번호 (PIN) 컬럼 추가
-- Supabase SQL Editor에서 실행
-- =====================================================

-- rentals 테이블에 pin 컬럼 추가 (4자리 숫자, 기존 레코드는 NULL 허용)
ALTER TABLE rentals ADD COLUMN IF NOT EXISTS pin TEXT;
ALTER TABLE rentals DROP CONSTRAINT IF EXISTS rentals_pin_check;
ALTER TABLE rentals ADD CONSTRAINT rentals_pin_check
  CHECK (pin IS NULL OR pin ~ '^\d{4}$');
