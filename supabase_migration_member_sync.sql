-- =====================================================
-- Migration: 어드민 CSV 업로드로 회원 명단 전체 교체 지원
-- Supabase SQL Editor에서 실행
-- =====================================================
--
-- CSV 업로드 시 동작이 "추가 전용"에서 "명단 전체 교체"로 변경됨:
--   - CSV에 있고 기존에 없던 부원 → 추가
--   - CSV와 기존에 모두 있는 부원 → 정보 갱신
--   - 기존에 있었지만 CSV에 없는 부원 → 삭제
--
-- 이를 위해 members 테이블에 UPDATE / DELETE RLS 정책이 필요함.
-- (rentals.member_id 는 ON DELETE SET NULL 이라 대여 기록은 그대로 유지되고,
--  borrower_name 등 비정규화 컬럼 덕분에 표시에도 문제 없음)

DROP POLICY IF EXISTS "누구나 회원 수정" ON members;
CREATE POLICY "누구나 회원 수정" ON members FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "누구나 회원 삭제" ON members;
CREATE POLICY "누구나 회원 삭제" ON members FOR DELETE USING (true);
