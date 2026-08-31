-- INITIALLY v2 -- fun_hint + meaning for 30 proverb puzzles
-- Run in the Supabase SQL Editor (service-role privileges; RLS blocks
-- writes via the anon key, same as proverb_hints_batch.sql).
--
-- Titles were pulled directly from the live `puzzles` table (category =
-- 'proverb') via the anon key's read access, then matched by best fit --
-- this avoids the apostrophe/quoting mismatches that broke earlier
-- hand-written attempts. All UPDATEs are keyed by id (not title) for exact
-- targeting, with the matched DB title in a trailing comment.
--
-- One deliberate title mismatch worth flagging: the source content said
-- "You can't have your cake and eat it too" but the DB row (id
-- 834bf78e-0a0c-4ad0-9f3b-1ea1d01a3ab7) is titled "You cannot have your
-- cake and eat it too" -- matched on content, not literal string equality.
--
-- fun_hint/meaning are merged into the existing hints jsonb via
-- COALESCE(hints, '{}'::jsonb) || ... so rows that already have
-- genre/country/decade/fun_fact (from proverb_hints_batch.sql) keep them --
-- this only adds/overwrites the fun_hint and meaning keys.
--
-- All string literals use dollar-quoting ($fh$...$fh$ / $mn$...$mn$)
-- instead of '' escaping, so embedded apostrophes can't break the SQL.

update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('fun_hint', $fh$Modern version: "Don't give up a sure thing for a maybe."$fh$, 'meaning', $mn$It's better to keep what you already have than to risk it for something better that isn't guaranteed.$mn$)
where id = 'e5bf2a50-0bbd-4b47-b051-cf873b43dace'; -- A bird in the hand is worth two in the bush

update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('fun_hint', $fh$Used when: fixing a small problem now so it doesn't become a bigger one later.$fh$, 'meaning', $mn$Dealing with a small problem right away prevents it from becoming a much bigger one later.$mn$)
where id = '91317648-cc05-4253-9ca2-8c7361ea5212'; -- A stitch in time saves nine

update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('fun_hint', $fh$Modern version: "Show me, don't just tell me."$fh$, 'meaning', $mn$What people do matters more than what they say they'll do.$mn$)
where id = 'f3f24480-7f4b-41c3-96fa-40051b01c715'; -- Actions speak louder than words

update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('fun_hint', $fh$Used when: someone finally shows up or finishes something, way behind schedule.$fh$, 'meaning', $mn$It's better to do something late than to not do it at all.$mn$)
where id = 'd0c527cb-7983-4568-b102-023b3752e3d3'; -- Better late than never

update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('fun_hint', $fh$Modern version: pretty much "you are who your friends are."$fh$, 'meaning', $mn$People with similar interests or values tend to spend time together.$mn$)
where id = '65ae52e9-a4e1-40d1-8d52-d7ad80061e1d'; -- Birds of a feather flock together

update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('fun_hint', $fh$Used when: praising someone for getting up early or starting first.$fh$, 'meaning', $mn$Those who act first or start early have the best chance of success.$mn$)
where id = '0c182ced-feaa-408c-9ac5-f0a520bd26d4'; -- The early bird catches the worm

update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('fun_hint', $fh$Modern version: "there's a bright side to everything."$fh$, 'meaning', $mn$Even difficult or sad situations have some positive aspect to them.$mn$)
where id = '5dea588d-f5c3-4d8e-bbc2-6758c74672f1'; -- Every cloud has a silver lining

update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('fun_hint', $fh$Used when: someone chooses to tell an awkward truth instead of a comfortable lie.$fh$, 'meaning', $mn$Being truthful, even when it's uncomfortable, is always the wisest choice.$mn$)
where id = '576e1cb9-f72e-42bb-84fb-9a50f00459bc'; -- Honesty is the best policy

update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('fun_hint', $fh$Modern version: "think it through before you act."$fh$, 'meaning', $mn$Think carefully about the consequences before taking action.$mn$)
where id = 'a5c55d63-afdc-45d0-9312-5f7fc8e79169'; -- Look before you leap

update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('fun_hint', $fh$Used when: encouraging someone to keep trying instead of giving up after one attempt.$fh$, 'meaning', $mn$Repeated practice leads to improvement and mastery of a skill.$mn$)
where id = '30d58221-f578-4cbc-af62-324a9a3875ab'; -- Practice makes perfect

update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('fun_hint', $fh$Modern version: "if you really want it, you'll find a way."$fh$, 'meaning', $mn$If someone is determined enough, they'll find a way to achieve their goal.$mn$)
where id = '2bab8baf-ed2a-4db8-a0f4-922c05c57267'; -- Where there is a will, there is a way

update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('fun_hint', $fh$Used when: something looks impressive but turns out to be disappointing underneath.$fh$, 'meaning', $mn$Something that looks valuable or appealing on the surface may not actually be so.$mn$)
where id = '347d8bcb-1c15-4ca8-892e-392487365276'; -- All that glitters is not gold

update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('fun_hint', $fh$Modern version: "everyone gets their moment eventually."$fh$, 'meaning', $mn$Everyone gets a moment of success or recognition eventually.$mn$)
where id = '87e4f46e-2b22-4acc-8649-531b17c4e477'; -- Every dog has its day

update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('fun_hint', $fh$Used when: two people say the exact same thing at the exact same time.$fh$, 'meaning', $mn$Intelligent or like-minded people often arrive at the same ideas independently.$mn$)
where id = 'b26dbb4b-571b-4798-976c-4311c190475c'; -- Great minds think alike

update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('fun_hint', $fh$Modern version: "just laugh it off, you'll feel better."$fh$, 'meaning', $mn$Humor and laughter can help you feel better, even during hard times.$mn$)
where id = 'f09d8b0a-68e0-4248-88f8-de1a179b6691'; -- Laughter is the best medicine

update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('fun_hint', $fh$Used when: someone wants to bring up an old argument that's better left alone.$fh$, 'meaning', $mn$Avoid stirring up old conflicts or problems that have already settled down.$mn$)
where id = '5ce43319-b4a4-4355-bc52-8ecf089731c7'; -- Let sleeping dogs lie

update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('fun_hint', $fh$Used when: you haven't heard back from someone, and you're choosing to assume it's fine.$fh$, 'meaning', $mn$If you haven't heard anything, it's probably a sign that everything is fine.$mn$)
where id = 'e12c672c-eb9d-4699-8f6e-3a2f3e9e7d08'; -- No news is good news

update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('fun_hint', $fh$Modern version: "it's hard to break a habit you've had forever."$fh$, 'meaning', $mn$Long-established behaviors are very difficult to change.$mn$)
where id = '4666c778-275c-479b-9a38-1aef33d2b973'; -- Old habits die hard

update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('fun_hint', $fh$Used when: you forget about something the moment it's no longer in front of you.$fh$, 'meaning', $mn$We tend to forget about people or things once they're no longer visible or present.$mn$)
where id = '82ed8249-762f-48c4-8636-edaadceee1fd'; -- Out of sight, out of mind

update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('fun_hint', $fh$Used when: someone is getting impatient and needs a gentle reminder to slow down.$fh$, 'meaning', $mn$Being patient is a valuable and admirable quality.$mn$)
where id = '76a5f01d-98e8-4f39-909a-d3a5f544c766'; -- Patience is a virtue

update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('fun_hint', $fh$Modern version: "it's easier to stop a problem than fix it later."$fh$, 'meaning', $mn$It's wiser to stop a problem before it happens than to fix it afterward.$mn$)
where id = '09e12dea-11dd-4951-bbdf-c33e3448a352'; -- Prevention is better than cure

update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('fun_hint', $fh$Straight from Aesop's tortoise and the hare — steady effort beats a rushed sprint.$fh$, 'meaning', $mn$Consistent, careful effort over time beats rushing and being careless.$mn$)
where id = '9246e14c-70ff-49b9-8481-19c3c73cec57'; -- Slow and steady wins the race

update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('fun_hint', $fh$Used when: a quiet person turns out to be way more complex than they seem.$fh$, 'meaning', $mn$Quiet or reserved people often have deep, complex thoughts or feelings that aren't obvious.$mn$)
where id = 'fb9b4732-dcf0-477e-ae9a-614f73e73119'; -- Still waters run deep

update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('fun_hint', $fh$Modern version: "words can do more damage — or more good — than weapons."$fh$, 'meaning', $mn$Words and ideas can have a greater impact than physical force or violence.$mn$)
where id = '8c58c50b-ecc4-4165-97d7-87bf01d38baf'; -- The pen is mightier than the sword

update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('fun_hint', $fh$Used when: comforting someone that painful feelings do fade with time.$fh$, 'meaning', $mn$Emotional pain lessens and eventually fades as time passes.$mn$)
where id = 'e325579a-ce50-467d-a05f-e83f40353cc1'; -- Time heals all wounds

update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('fun_hint', $fh$Used when: something wild happens in real life that no one would believe in a movie.$fh$, 'meaning', $mn$Real life events can be more surprising or unbelievable than anything made up.$mn$)
where id = '8a88d4e4-a7a8-4827-9dba-6ca0659053a7'; -- Truth is stranger than fiction

update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('fun_hint', $fh$Modern version: "let's brainstorm this together instead of alone."$fh$, 'meaning', $mn$Working together with someone else often produces better results than working alone.$mn$)
where id = '9b53f6cf-d306-4d25-b66e-fc14e79fa2a1'; -- Two heads are better than one

update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('fun_hint', $fh$Used when: someone wants two things that cancel each other out.$fh$, 'meaning', $mn$You can't enjoy two conflicting benefits at the same time — choosing one often means giving up the other.$mn$)
where id = '834bf78e-0a0c-4ad0-9f3b-1ea1d01a3ab7'; -- You cannot have your cake and eat it too

update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('fun_hint', $fh$Modern version: "what goes around comes around."$fh$, 'meaning', $mn$The consequences you experience are a direct result of your own actions.$mn$)
where id = '12bb9b6d-5c2e-424e-8605-b661a44572a0'; -- You reap what you sow

update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('fun_hint', $fh$Used when: warning someone that poking into something might backfire on them.$fh$, 'meaning', $mn$Being overly curious or nosy about something can get you into trouble.$mn$)
where id = 'ee12185d-01a6-4111-a119-1a39dfd080fc'; -- Curiosity killed the cat
