-- ============================================================
-- 007_update_with_check.sql
-- Add WITH CHECK to UPDATE policies so a user cannot reassign
-- a row's ownership FK to another user. USING alone validates
-- the OLD row; WITH CHECK validates the NEW row.
-- ============================================================

alter policy "profiles: update own"
  on profiles
  with check (id = auth.uid());

alter policy "decks: update own"
  on decks
  with check (user_id = auth.uid());

alter policy "cards: update own"
  on cards
  with check (
    exists (
      select 1 from decks
      where decks.id = cards.deck_id
        and decks.user_id = auth.uid()
    )
  );

alter policy "card_state: update own"
  on card_state
  with check (
    exists (
      select 1 from cards
      join decks on decks.id = cards.deck_id
      where cards.id = card_state.card_id
        and decks.user_id = auth.uid()
    )
  );

alter policy "revlog: update own"
  on revlog
  with check (user_id = auth.uid());

alter policy "session_log: update own"
  on session_log
  with check (user_id = auth.uid());
