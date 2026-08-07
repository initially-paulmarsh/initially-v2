-- INITIALLY v2 — Real hints + fun_fact for the 29 buffered proverbs
-- Run this once in the Supabase SQL Editor (requires elevated privileges; RLS
-- blocks writes via the anon key, same as seed_puzzles.sql / today_puzzles.sql).
--
-- Covers the 29 proverbs assigned in preseed_daily_puzzles.sql. The "Creator"
-- hint tier for proverbs now falls back to a distinctive-word reveal in
-- src/lib/hints.js when hints.author is absent (proverbs have no natural
-- author), so no `author` key is set here on purpose — these rows fill in
-- genre/country/decade (tiers 1 & 3) and fun_fact instead.
--
-- Supersedes an earlier attempt at this same batch that mostly failed to run
-- (unescaped apostrophes broke the generated SQL) — all quoting here is
-- generated programmatically to avoid repeating that bug.

update puzzles set
  hints = '{"genre": "Perseverance / procrastination proverb", "country": "Ancient Rome / England", "decade": "Ancient, English form attested by the 14th century"}'::jsonb,
  fun_fact = 'A version appears in the Roman historian Livy''s writings over 2,000 years ago, and Chaucer used the English phrasing in The Canterbury Tales around 1386.'
where id = 'd0c527cb-7983-4568-b102-023b3752e3d3'; -- Better late than never

update puzzles set
  hints = '{"genre": "Romance / rivalry proverb", "country": "England", "decade": "1570s"}'::jsonb,
  fun_fact = 'The idea is traced to English writer John Lyly''s 1578 prose romance Euphues, though the modern short form wasn''t standardized until the 19th century.'
where id = 'fe18eb09-3691-406e-95cd-d8fb1056d450'; -- All is fair in love and war

update puzzles set
  hints = '{"genre": "Friendship / loyalty proverb", "country": "Ancient Rome", "decade": "Ancient, c. 3rd century BCE"}'::jsonb,
  fun_fact = 'A version of the sentiment is credited to the Roman playwright Ennius, who wrote that "a sure friend is known when in difficulty."'
where id = '7e0a7eb2-c96c-4fec-899b-0bea9df6ee95'; -- A friend in need is a friend indeed

update puzzles set
  hints = '{"genre": "Ingenuity / resourcefulness proverb", "country": "Ancient Greece", "decade": "Ancient, c. 4th century BCE"}'::jsonb,
  fun_fact = 'The idea is often traced to Plato''s Republic, written around 380 BCE, though the exact English phrasing came centuries later.'
where id = '2bd3d3f6-9546-44c4-a2fc-bcf11c436b99'; -- Necessity is the mother of invention

update puzzles set
  hints = '{"genre": "Learning / life-wisdom proverb", "country": "Widespread (Latin tradition)", "decade": "Traditional, long-standing"}'::jsonb,
  fun_fact = 'A close Latin equivalent, "experientia docet" ("experience teaches"), was a common maxim among Roman writers.'
where id = '727931da-f037-4384-ab65-432064482700'; -- Experience is the best teacher

update puzzles set
  hints = '{"genre": "Observational proverb", "country": "England", "decade": "1820s"}'::jsonb,
  fun_fact = 'The phrase comes from Lord Byron''s 1823 poem Don Juan: "''Tis strange, but true; for truth is always strange, stranger than fiction."'
where id = '8a88d4e4-a7a8-4827-9dba-6ca0659053a7'; -- Truth is stranger than fiction

update puzzles set
  hints = '{"genre": "Determination / perseverance proverb", "country": "England", "decade": "Traditional, attested by the 17th century"}'::jsonb,
  fun_fact = 'The saying has been traced to English proverb collections from the 1600s, expressing the idea that determination can overcome obstacles.'
where id = '2bab8baf-ed2a-4db8-a0f4-922c05c57267'; -- Where there is a will, there is a way

update puzzles set
  hints = '{"genre": "Family / duty proverb", "country": "England", "decade": "Traditional, attested by the 17th century"}'::jsonb,
  fun_fact = 'The sentiment echoes 1 Timothy 5:8 in the Bible, which warns that anyone who fails to provide for their own family has "denied the faith."'
where id = 'dc0dad81-74ad-4b5c-ade8-1b491fe5533e'; -- Charity begins at home

update puzzles set
  hints = '{"genre": "Humility / caution proverb", "country": "Biblical (Hebrew origin)", "decade": "Ancient"}'::jsonb,
  fun_fact = 'This is a shortened, popular form of Proverbs 16:18 in the Bible: "Pride goeth before destruction, and an haughty spirit before a fall."'
where id = 'c63721da-a49d-4311-9e72-2f52a493dd14'; -- Pride comes before a fall

update puzzles set
  hints = '{"genre": "Self-recognition proverb", "country": "England / USA", "decade": "18th-19th century"}'::jsonb,
  fun_fact = 'The American phrasing evolved from the older British saying "if the cap fits, wear it," which originally referred to a jester''s cap.'
where id = '7e8bccbc-5c02-4b8b-8b42-500b813f8f1b'; -- If the shoe fits, wear it

update puzzles set
  hints = '{"genre": "Health / folk-wisdom proverb", "country": "Wales / England", "decade": "1860s"}'::jsonb,
  fun_fact = 'An early version appeared in an 1866 Welsh publication as "Eat an apple on going to bed, and you''ll keep the doctor from earning his bread" — the modern wording followed decades later.'
where id = '6f6d6bdf-93a9-40f2-9dd5-22e168e450f1'; -- An apple a day keeps the doctor away

update puzzles set
  hints = '{"genre": "Skill / discipline proverb", "country": "England", "decade": "16th century"}'::jsonb,
  fun_fact = 'Versions of this idea appear in English texts as far back as the 1550s, echoing the older Latin maxim "usus promptos facit" — practice makes ready.'
where id = '30d58221-f578-4cbc-af62-324a9a3875ab'; -- Practice makes perfect

update puzzles set
  hints = '{"genre": "Suspicion / rumor proverb", "country": "France / England", "decade": "14th century"}'::jsonb,
  fun_fact = 'The proverb has roots in a 14th-century French saying ("il n''y a point de fumee sans feu") and entered English use around the same era.'
where id = '8b711db9-30cc-4d76-babd-dd3590b0f174'; -- There is no smoke without fire

update puzzles set
  hints = '{"genre": "Secrecy / danger proverb", "country": "England", "decade": "17th century"}'::jsonb,
  fun_fact = 'The phrase dates to at least the 1600s in English and became strongly linked to pirate lore through 19th- and 20th-century adventure fiction.'
where id = '0b993cbb-5186-4bc2-b24a-feb3ffa69d06'; -- Dead men tell no tales

update puzzles set
  hints = '{"genre": "Caution / familiarity proverb", "country": "England", "decade": "Traditional, attested by the 16th century"}'::jsonb,
  fun_fact = 'The saying reflects an idea recorded in English proverb collections since the 1500s, warning that an unfamiliar risk can be worse than a known one.'
where id = '87695996-f81d-473a-9f07-4209ca1b5a9b'; -- Better the devil you know than the devil you don't

update puzzles set
  hints = '{"genre": "Love / longing proverb", "country": "England (Roman precedent)", "decade": "1850s"}'::jsonb,
  fun_fact = 'The modern English phrasing was popularized by an 1850 song, "Isle of Beauty," though a similar sentiment appears in the Roman poet Propertius nearly 2,000 years earlier.'
where id = '45e377e1-ea0b-49f7-a6a9-9a22d52c1fda'; -- Absence makes the heart grow fonder

update puzzles set
  hints = '{"genre": "Fairness / order proverb", "country": "England", "decade": "14th century"}'::jsonb,
  fun_fact = 'A version of this phrase appears in Chaucer''s Wife of Bath''s Tale (c. 1386), making it one of the older English proverbs still in everyday use.'
where id = '3858942d-418d-42cd-9014-472e9c647b3e'; -- First come, first served

update puzzles set
  hints = '{"genre": "Reassurance proverb", "country": "England", "decade": "17th century"}'::jsonb,
  fun_fact = 'King James I of England is credited with an early recorded use of a similar phrase, in a letter from 1616.'
where id = 'e12c672c-eb9d-4699-8f6e-3a2f3e9e7d08'; -- No news is good news

update puzzles set
  hints = '{"genre": "Caution / avoidance proverb", "country": "England", "decade": "14th century"}'::jsonb,
  fun_fact = 'Chaucer used an early version of this idea in Troilus and Criseyde (14th century): "it is nought good a sleeping hound to wake."'
where id = '5ce43319-b4a4-4355-bc52-8ecf089731c7'; -- Let sleeping dogs lie

update puzzles set
  hints = '{"genre": "Caution / prudence proverb", "country": "USA / England", "decade": "19th century"}'::jsonb,
  fun_fact = 'An early form, "better sure than sorry," was recorded in the 1830s before evolving into the modern wording later in the 19th century.'
where id = 'e104497e-940a-4044-ae88-5d97e1cd908e'; -- Better safe than sorry

update puzzles set
  hints = '{"genre": "Gratitude proverb", "country": "Ancient Rome", "decade": "Ancient, c. 4th century CE"}'::jsonb,
  fun_fact = 'The saying refers to judging a horse''s age by its teeth, and has been traced to the writings of St. Jerome in the 4th century CE.'
where id = 'd8f5efac-b036-4120-baf8-0df2605cfa10'; -- Never look a gift horse in the mouth

update puzzles set
  hints = '{"genre": "Timing / opportunity proverb", "country": "England", "decade": "14th century"}'::jsonb,
  fun_fact = 'The phrase comes from blacksmithing, where iron must be shaped while still hot and malleable, and has been used in English since at least the 14th century.'
where id = '233f43fa-cf89-4abd-a37b-f9087e823d35'; -- Strike while the iron is hot

update puzzles set
  hints = '{"genre": "Cynical / human-nature proverb", "country": "England", "decade": "18th century"}'::jsonb,
  fun_fact = 'The line is often attributed to 18th-century British Prime Minister Sir Robert Walpole, though there''s no solid evidence he actually said it.'
where id = '315f4b9a-082c-4855-8cfa-f9892e0df69a'; -- Every man has his price

update puzzles set
  hints = '{"genre": "Adaptability / etiquette proverb", "country": "Ancient Rome", "decade": "Ancient, c. 4th century CE"}'::jsonb,
  fun_fact = 'The saying is traced to advice St. Ambrose reportedly gave St. Augustine in the 4th century CE about adapting to local customs.'
where id = '95dfbd84-92c5-4f16-b6de-da66737d882c'; -- When in Rome, do as the Romans do

update puzzles set
  hints = '{"genre": "Frugality / thrift proverb", "country": "England", "decade": "18th century"}'::jsonb,
  fun_fact = 'The saying is often attributed to 18th-century English politician William Lowndes, and closely echoes Benjamin Franklin''s American maxim about a penny saved.'
where id = '49c15cd5-1a3b-478e-bacb-d90ca82a9899'; -- Take care of the pennies and the pounds will take care of themselves

update puzzles set
  hints = '{"genre": "Virtue / hygiene proverb", "country": "England", "decade": "18th century"}'::jsonb,
  fun_fact = 'The modern phrasing is usually credited to Methodist founder John Wesley, from an 18th-century sermon, though similar ideas appear in much older Babylonian and Hebrew writings.'
where id = 'cd02341f-ae9b-4f7f-8ce2-5703a736701b'; -- Cleanliness is next to godliness

update puzzles set
  hints = '{"genre": "Courage / risk-taking proverb", "country": "Ancient Rome", "decade": "Ancient, c. 1st century BCE"}'::jsonb,
  fun_fact = 'The Latin original, "audentes fortuna iuvat," appears in Virgil''s Aeneid, written in the 1st century BCE.'
where id = '9917f515-b387-4212-9da5-97e635700a14'; -- Fortune favours the bold

update puzzles set
  hints = '{"genre": "Irony / loyalty proverb", "country": "England", "decade": "17th century"}'::jsonb,
  fun_fact = 'The idea has been traced to English writings from the 1600s, noting that even those who break society''s rules often keep rules among themselves.'
where id = '8bce7880-66b8-4b90-84a6-a871971f6abf'; -- There is honour among thieves

update puzzles set
  hints = '{"genre": "Near-miss / outcome proverb", "country": "England", "decade": "17th century"}'::jsonb,
  fun_fact = 'An early version of the phrase was recorded in an English proverb collection in the 1600s, an ironic twist on the older "an inch is as good as an ell."'
where id = '8d09dd9c-5b05-4fc2-84d1-14f1dfab956f'; -- A miss is as good as a mile
