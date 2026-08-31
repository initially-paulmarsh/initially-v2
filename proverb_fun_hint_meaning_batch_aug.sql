-- INITIALLY v2 -- fun_hint + meaning for the 18 gap proverbs in the
-- Aug 7-31 daily_puzzles schedule (see conversation for the schedule query).
-- Run in the Supabase SQL Editor (service-role privileges; RLS blocks
-- writes via the anon key, same as proverb_hints_batch.sql and
-- proverb_fun_hint_meaning_batch.sql).
--
-- All UPDATEs are keyed by id (not title) for exact targeting, with the
-- matched DB title in a trailing comment. Ids were pulled directly from the
-- live `puzzles` table via the anon key's read access in this conversation.
--
-- fun_hint/meaning are merged into the existing hints jsonb via
-- coalesce(hints, '{}'::jsonb) || ... so rows that already have
-- genre/country/decade/fun_fact keep them -- this only adds/overwrites the
-- fun_hint and meaning keys.
--
-- All string literals use dollar-quoting ($fh$...$fh$ / $mn$...$mn$)
-- instead of '' escaping, so embedded apostrophes can't break the SQL.

update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('fun_hint', $fh$Modern version: "Just start — the first step is the hardest part."$fh$, 'meaning', $mn$Even the biggest goals become possible once you take the first small action toward them.$mn$)
where id = '9ccbddde-51ae-4d75-9808-e3f92d604abf'; -- A journey of a thousand miles begins with a single step

update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('fun_hint', $fh$Used when: excusing questionable tactics because the stakes felt too high to play fair.$fh$, 'meaning', $mn$In situations of intense competition or emotion, people may feel normal rules of fairness no longer apply.$mn$)
where id = 'fe18eb09-3691-406e-95cd-d8fb1056d450'; -- All is fair in love and war

update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('fun_hint', $fh$Modern version: "you find out who your real friends are when things go wrong."$fh$, 'meaning', $mn$A true friend is one who shows up and helps you specifically when you're struggling, not just when things are easy.$mn$)
where id = '7e0a7eb2-c96c-4fec-899b-0bea9df6ee95'; -- A friend in need is a friend indeed

update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('fun_hint', $fh$Used when: someone comes up with a clever fix simply because they had no other choice.$fh$, 'meaning', $mn$When people are faced with an urgent need, it often forces them to find creative or resourceful solutions.$mn$)
where id = '2bd3d3f6-9546-44c4-a2fc-bcf11c436b99'; -- Necessity is the mother of invention

update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('fun_hint', $fh$Modern version: "you really only learn by doing it yourself."$fh$, 'meaning', $mn$The most valuable lessons in life often come from personally going through something, not just being told about it.$mn$)
where id = '727931da-f037-4384-ab65-432064482700'; -- Experience is the best teacher

update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('fun_hint', $fh$Used when: reminding someone to take care of their own family or community before helping strangers.$fh$, 'meaning', $mn$You should look after the wellbeing of those closest to you before focusing your generosity elsewhere.$mn$)
where id = 'dc0dad81-74ad-4b5c-ade8-1b491fe5533e'; -- Charity begins at home

update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('fun_hint', $fh$Modern version: "don't get too cocky — that's usually right before things go wrong."$fh$, 'meaning', $mn$Being overly confident or arrogant often leads directly to failure or embarrassment.$mn$)
where id = 'c63721da-a49d-4311-9e72-2f52a493dd14'; -- Pride comes before a fall

update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('fun_hint', $fh$Used when: telling someone a criticism applies to them, whether they like it or not.$fh$, 'meaning', $mn$If a description or criticism accurately applies to you, you should accept it rather than deny it.$mn$)
where id = '7e8bccbc-5c02-4b8b-8b42-500b813f8f1b'; -- If the shoe fits, wear it

update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('fun_hint', $fh$Used when: encouraging someone to eat healthy to avoid getting sick.$fh$, 'meaning', $mn$Maintaining healthy habits, like eating well, helps you stay healthy and avoid illness.$mn$)
where id = '6f6d6bdf-93a9-40f2-9dd5-22e168e450f1'; -- An apple a day keeps the doctor away

update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('fun_hint', $fh$Modern version: "if everyone's saying it, there's probably some truth to it."$fh$, 'meaning', $mn$If there are persistent rumors or suspicions about something, there's likely at least some truth behind them.$mn$)
where id = '8b711db9-30cc-4d76-babd-dd3590b0f174'; -- There is no smoke without fire

update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('fun_hint', $fh$Used when: implying that silencing someone permanently means their secrets die with them.$fh$, 'meaning', $mn$Once someone is gone, they can no longer reveal secrets or information — often used in the context of covering something up.$mn$)
where id = '0b993cbb-5186-4bc2-b24a-feb3ffa69d06'; -- Dead men tell no tales

update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('fun_hint', $fh$Modern version: "stick with the flawed thing you understand rather than risk something worse."$fh$, 'meaning', $mn$It's often safer to deal with a familiar problem than to risk an unknown one that could be even worse.$mn$)
where id = '87695996-f81d-473a-9f07-4209ca1b5a9b'; -- Better the devil you know than the devil you don't

update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('fun_hint', $fh$Used when: missing someone makes you appreciate and love them even more.$fh$, 'meaning', $mn$Being away from someone you care about can actually deepen your affection for them.$mn$)
where id = '45e377e1-ea0b-49f7-a6a9-9a22d52c1fda'; -- Absence makes the heart grow fonder

update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('fun_hint', $fh$Modern version: "whoever gets here first gets it — no cutting the line."$fh$, 'meaning', $mn$People or requests are dealt with in the order they arrive, with no special treatment.$mn$)
where id = '3858942d-418d-42cd-9014-472e9c647b3e'; -- First come, first served

update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('fun_hint', $fh$Used when: taking a cautious extra step just in case, even if it turns out unnecessary.$fh$, 'meaning', $mn$It's wiser to take precautions in advance than to regret not doing so later.$mn$)
where id = 'e104497e-940a-4044-ae88-5d97e1cd908e'; -- Better safe than sorry

update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('fun_hint', $fh$Modern version: "don't complain about a free gift, just be grateful."$fh$, 'meaning', $mn$When someone gives you something for free, you shouldn't criticize it or question its value.$mn$)
where id = 'd8f5efac-b036-4120-baf8-0df2605cfa10'; -- Never look a gift horse in the mouth

update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('fun_hint', $fh$Used when: acting immediately on an opportunity before it disappears.$fh$, 'meaning', $mn$You should take action at the best possible moment, while conditions are most favorable.$mn$)
where id = '233f43fa-cf89-4abd-a37b-f9087e823d35'; -- Strike while the iron is hot

update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('fun_hint', $fh$Modern version: "everyone can be bought if the offer's tempting enough."$fh$, 'meaning', $mn$The idea that anyone can be persuaded or corrupted if offered something valuable enough.$mn$)
where id = '315f4b9a-082c-4855-8cfa-f9892e0df69a'; -- Every man has his price
