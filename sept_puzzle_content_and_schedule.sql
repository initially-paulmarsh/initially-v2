-- INITIALLY v2 — September content upgrade + schedule fill
-- Run in the Supabase SQL Editor (service-role privileges; RLS blocks writes
-- via the anon key, same as every other batch file in this repo).
--
-- Context: as of 2026-08-31, daily_puzzles only had rows through 2026-09-05
-- (see preseed_daily_puzzles.sql) -- Sept 6-30 had nothing queued. Separately,
-- several already-scheduled Sept puzzles had thin or missing hints/fun_fact,
-- and one (Silence of the Lambs) had a factual error in its fun_fact. This
-- file fixes both: it upgrades hint/fun_fact content (researched for
-- accuracy, written to actually be interesting rather than generic) and
-- fills the daily_puzzles schedule through the end of the month.
--
-- SECTION 1 — fixes to already-scheduled Sept 1-5 puzzles:
--   - Silence of the Lambs (book): corrected a wrong Hannibal Lecter claim
--     (he debuted in Red Dragon, 1981, not this book).
--   - "I Can't Help Myself" / "Papa's Got A Brand New Bag" (song): were
--     missing final_clue/category_details/fun_fact entirely -- filled in.
--   - 5 Sept 1-5 proverbs were missing fun_hint + meaning (the two fields
--     that matter most for a proverb puzzle's in-game hint tier 3 and its
--     post-solve reveal) -- added.
--
-- SECTION 2 — 24 proverbs that already had fun_hint/meaning from earlier
-- work (see proverb_fun_hint_meaning_batch.sql / _aug.sql) but were missing
-- `genre` (their Theme hint tier) and `fun_fact` (historical origin, shown
-- after solving) -- these are now fully ready and used as 24 of the 25
-- proverb picks below. One additional proverb ("Do not judge a book by its
-- cover") gets the full field set from scratch as the 25th pick.
--
-- movie / song / book sections — 25 new picks each for Sept 6-30, none of
-- which had any hints/fun_fact populated in the bank. Each gets creator (or
-- author/artist) + final_clue ("Country · Decade") + category_details
-- ("Year · Genre") + a specific, researched fun_fact -- not generic filler.
--
-- SECTION 3 — daily_puzzles: assigns puzzle_date/category/puzzle_id for
-- Sept 6-30 (25 days x 4 categories = 100 rows), and also explicitly sets
-- is_free for every date in September (1-30). Sept 1-5's rows existed from
-- preseed_daily_puzzles.sql but were never flagged free -- rotate-daily-
-- puzzle.js only assigns is_free for *today*, so those past-dated rows were
-- silently skipped and no category has been playable for free all month.
-- Free-category rotation cycles movie -> song -> book -> proverb, never
-- repeating the previous day's category (matches the app's own rule -- see
-- assignFreeCategory in netlify/functions/rotate-daily-puzzle.js) and picks
-- up cleanly from Aug 31's free category (proverb).
--
-- Safe to re-run: proverb/movie/song/book UPDATEs are idempotent (merge via
-- coalesce(hints, '{}'::jsonb) || ...), and the daily_puzzles INSERT uses
-- ON CONFLICT DO NOTHING.

-- ============================================================
-- SECTION 1 — fixes to already-scheduled Sept 1-5 puzzles
-- ============================================================
update puzzles set
  fun_fact = $ff$The Silence of the Lambs (1988) was actually Hannibal Lecter's second appearance in print -- he debuted seven years earlier in Thomas Harris's 1981 novel Red Dragon.$ff$
where id = '4fc2cc98-aeec-49f9-b08b-a81409a70195'; -- The Silence of the Lambs
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('final_clue', $fc$USA · 1960s$fc$, 'category_details', $cd$1965 · Motown soul$cd$),
  fun_fact = $ff$Also known as "Sugar Pie, Honey Bunch," it was the Four Tops' first US #1 hit, built on a bassline the Funk Brothers reused so often on Motown records that it earned the nickname "the Motown sound."$ff$
where id = 'c3f08b90-3d57-45c1-bffb-ca98d7e48024'; -- I Can't Help Myself
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('final_clue', $fc$USA · 1960s$fc$, 'category_details', $cd$1965 · Funk$cd$),
  fun_fact = $ff$This 1965 single is widely credited as the record where James Brown invented funk, stripping R&B down to a driving rhythmic groove instead of a melody -- it won him his first Grammy.$ff$
where id = 'ea3e4488-e0cf-45c7-a709-0620cc6267d2'; -- Papa's Got A Brand New Bag
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('fun_hint', $fh$Modern version: "watch the small expenses and the big savings take care of themselves."$fh$, 'meaning', $mn$Saving carefully on small, everyday amounts adds up to real financial security over time.$mn$)
where id = '49c15cd5-1a3b-478e-bacb-d90ca82a9899'; -- Take care of the pennies and the pounds will take care of themselves
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('fun_hint', $fh$Used when: someone is scrubbing the house top to bottom like it's a moral obligation.$fh$, 'meaning', $mn$Being clean and tidy is treated as a sign of good, virtuous character.$mn$)
where id = 'cd02341f-ae9b-4f7f-8ce2-5703a736701b'; -- Cleanliness is next to godliness
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('fun_hint', $fh$Modern version: "you miss every shot you don't take."$fh$, 'meaning', $mn$People who take bold risks tend to be rewarded more than those who play it safe.$mn$)
where id = '9917f515-b387-4212-9da5-97e635700a14'; -- Fortune favours the bold
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('fun_hint', $fh$Used when: pointing out that even people breaking the rules still follow some code with each other.$fh$, 'meaning', $mn$The idea that even people who behave dishonestly toward outsiders still keep certain rules of loyalty and trust among themselves.$mn$)
where id = '8bce7880-66b8-4b90-84a6-a871971f6abf'; -- There is honour among thieves
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('fun_hint', $fh$Used when: shrugging off a narrow failure -- close doesn't count any more than being way off.$fh$, 'meaning', $mn$Failing by a small margin counts the same as failing by a huge one -- a miss is still a miss.$mn$)
where id = '8d09dd9c-5b05-4fc2-84d1-14f1dfab956f'; -- A miss is as good as a mile

-- ============================================================
-- SECTION 2 — enrich the 24 already-ready proverbs (genre + fun_fact)
-- ============================================================
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('genre', $gn$Wellbeing / humor proverb$gn$),
  fun_fact = $ff$A close version appears in the Bible's Book of Proverbs ("a merry heart doeth good like a medicine"), thousands of years before the modern phrasing caught on.$ff$
where id = 'f09d8b0a-68e0-4248-88f8-de1a179b6691'; -- Laughter is the best medicine
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('genre', $gn$Behavior / habit proverb$gn$),
  fun_fact = $ff$The underlying idea shows up in English writing as far back as the 1700s, warning that behaviors practiced over a lifetime resist change even when a person wants to.$ff$
where id = '4666c778-275c-479b-9a38-1aef33d2b973'; -- Old habits die hard
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('genre', $gn$Memory / attachment proverb$gn$),
  fun_fact = $ff$It's one of the oldest recorded English proverbs -- versions of the phrase appear in writing as far back as the 13th century.$ff$
where id = '82ed8249-762f-48c4-8636-edaadceee1fd'; -- Out of sight, out of mind
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('genre', $gn$Virtue / self-control proverb$gn$),
  fun_fact = $ff$The sentiment traces to a 5th-century Latin poem called Patientia by the Christian poet Prudentius, and the exact English phrasing was a common saying by the 14th century.$ff$
where id = '76a5f01d-98e8-4f39-909a-d3a5f544c766'; -- Patience is a virtue
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('genre', $gn$Health / foresight proverb$gn$),
  fun_fact = $ff$A Latin version of the idea was already circulating among European scholars by the 16th century, including in the writing of the philosopher Erasmus.$ff$
where id = '09e12dea-11dd-4951-bbdf-c33e3448a352'; -- Prevention is better than cure
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('genre', $gn$Perseverance proverb$gn$),
  fun_fact = $ff$Comes directly from Aesop's fable "The Tortoise and the Hare," written around the 6th century BCE -- though this exact English phrasing only became fixed much later.$ff$
where id = '9246e14c-70ff-49b9-8481-19c3c73cec57'; -- Slow and steady wins the race
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('genre', $gn$Character / hidden-depths proverb$gn$),
  fun_fact = $ff$A Latin version -- that the deepest rivers flow with the least noise -- was already a known saying among Roman writers around the 1st century AD.$ff$
where id = 'fb9b4732-dcf0-477e-ae9a-614f73e73119'; -- Still waters run deep
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('genre', $gn$Caution / value proverb$gn$),
  fun_fact = $ff$It comes from medieval falconry, where a bird already caught in hand was literally worth more than uncaught birds still hiding in the bush -- recorded in English proverb collections by the 1600s.$ff$
where id = 'e5bf2a50-0bbd-4b47-b051-cf873b43dace'; -- A bird in the hand is worth two in the bush
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('genre', $gn$Foresight / diligence proverb$gn$),
  fun_fact = $ff$First recorded in print in Thomas Fuller's 1732 proverb collection Gnomologia -- it refers literally to mending a small tear before it grows into a much bigger one.$ff$
where id = '91317648-cc05-4253-9ca2-8c7361ea5212'; -- A stitch in time saves nine
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('genre', $gn$Optimism proverb$gn$),
  fun_fact = $ff$Traced to English poet John Milton's 1634 masque Comus, which describes a cloud that "turns forth her silver lining" to the night.$ff$
where id = '5dea588d-f5c3-4d8e-bbc2-6758c74672f1'; -- Every cloud has a silver lining
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('genre', $gn$Integrity proverb$gn$),
  fun_fact = $ff$Often credited to Benjamin Franklin, though the exact phrase actually predates him, appearing in English writing from the late 1500s.$ff$
where id = '576e1cb9-f72e-42bb-84fb-9a50f00459bc'; -- Honesty is the best policy
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('genre', $gn$Caution / prudence proverb$gn$),
  fun_fact = $ff$One of the older English proverbs on record -- it appears in John Heywood's 1546 collection of proverbs, one of the earliest such collections ever printed.$ff$
where id = 'a5c55d63-afdc-45d0-9312-5f7fc8e79169'; -- Look before you leap
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('genre', $gn$Fortune / fairness proverb$gn$),
  fun_fact = $ff$Shakespeare used the idea in Hamlet (1600), when Hamlet says "the cat will mew, and dog will have his day."$ff$
where id = '87e4f46e-2b22-4acc-8649-531b17c4e477'; -- Every dog has its day
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('genre', $gn$Initiative / timing proverb$gn$),
  fun_fact = $ff$First recorded in English in John Ray's 1670 collection of English proverbs.$ff$
where id = '0c182ced-feaa-408c-9ac5-f0a520bd26d4'; -- The early bird catches the worm
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('genre', $gn$Integrity / behavior proverb$gn$),
  fun_fact = $ff$A similar idea existed in Latin ("facta, non verba") for centuries before it, but the specific English phrase only became common in the 1700s and 1800s.$ff$
where id = 'f3f24480-7f4b-41c3-96fa-40051b01c715'; -- Actions speak louder than words
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('genre', $gn$Coincidence / camaraderie proverb$gn$),
  fun_fact = $ff$A version of the phrase appeared in English by the early 1600s -- the ironic follow-up, "though fools seldom differ," was tacked on much later as a joke.$ff$
where id = 'b26dbb4b-571b-4798-976c-4311c190475c'; -- Great minds think alike
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('genre', $gn$Friendship / similarity proverb$gn$),
  fun_fact = $ff$Recorded in English as early as the 1540s, and used memorably in print again in a 1599 pamphlet.$ff$
where id = '65ae52e9-a4e1-40d1-8d52-d7ad80061e1d'; -- Birds of a feather flock together
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('genre', $gn$Appearance / deception proverb$gn$),
  fun_fact = $ff$Famously phrased by Shakespeare in The Merchant of Venice (1596) as "all that glisters is not gold," though the idea itself is even older, showing up in 12th-century French writing.$ff$
where id = '347d8bcb-1c15-4ca8-892e-392487365276'; -- All that glitters is not gold
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('genre', $gn$Power-of-words proverb$gn$),
  fun_fact = $ff$Coined in this exact wording by English writer Edward Bulwer-Lytton in his 1839 play Richelieu.$ff$
where id = '8c58c50b-ecc4-4165-97d7-87bf01d38baf'; -- The pen is mightier than the sword
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('genre', $gn$Grief / recovery proverb$gn$),
  fun_fact = $ff$The idea appears in the writing of the Greek playwright Menander over 2,300 years ago, who called time "the healer of all necessary evils."$ff$
where id = 'e325579a-ce50-467d-a05f-e83f40353cc1'; -- Time heals all wounds
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('genre', $gn$Collaboration proverb$gn$),
  fun_fact = $ff$Recorded in English proverb collections since at least 1546, in John Heywood's landmark early collection of English sayings.$ff$
where id = '9b53f6cf-d306-4d25-b66e-fc14e79fa2a1'; -- Two heads are better than one
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('genre', $gn$Choice / trade-off proverb$gn$),
  fun_fact = $ff$Also recorded in John Heywood's 1546 proverb collection -- the original order ("eat your cake and have it too") makes the logic clearer: once it's eaten, you can't still have it.$ff$
where id = '834bf78e-0a0c-4ad0-9f3b-1ea1d01a3ab7'; -- You cannot have your cake and eat it too
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('genre', $gn$Consequences proverb$gn$),
  fun_fact = $ff$Drawn directly from the Bible: Galatians 6:7 reads "whatsoever a man soweth, that shall he also reap."$ff$
where id = '12bb9b6d-5c2e-424e-8605-b661a44572a0'; -- You reap what you sow
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('genre', $gn$Caution / curiosity proverb$gn$),
  fun_fact = $ff$The original 16th-century version was actually "care killed the cat" -- "care" meaning worry or sorrow, not nosiness -- and only shifted to "curiosity" by the late 1800s.$ff$
where id = 'ee12185d-01a6-4111-a119-1a39dfd080fc'; -- Curiosity killed the cat
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('genre', $gn$Judgment / first-impressions proverb$gn$, 'fun_hint', $fh$Modern version: "looks can be deceiving -- get to know the real thing first."$fh$, 'meaning', $mn$You shouldn't form an opinion about someone or something based only on its outward appearance.$mn$),
  fun_fact = $ff$An early written version appears in George Eliot's 1860 novel The Mill on the Floss, though the short, punchy form used today only became common in 20th-century America.$ff$
where id = '4fefcd4a-15fb-4895-9ee9-b604d9c03cb4'; -- Do not judge a book by its cover

-- ============================================================
-- movie: 25 new picks for Sept 6-30
-- ============================================================
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('creator', $cr$Robert Wise$cr$, 'final_clue', $fc$USA · 1950s$fc$, 'category_details', $cd$1951 · Science fiction$cd$),
  fun_fact = $ff$Gort the robot was played by 7'7" Lock Martin, a former usher at Grauman's Chinese Theatre -- one of the few men in Hollywood tall enough for the suit.$ff$
where id = '0f3bb710-e1f0-4a79-82c8-ae5e5e8ae66e'; -- The Day the Earth Stood Still
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('creator', $cr$Gene Kelly and Stanley Donen$cr$, 'final_clue', $fc$USA · 1950s$fc$, 'category_details', $cd$1952 · Musical comedy$cd$),
  fun_fact = $ff$Gene Kelly filmed the famous title number while running a 103°F fever -- the rain itself was mixed with milk so it would show up better on camera.$ff$
where id = '00c43d30-9fc8-46e2-acb5-6859988fe310'; -- Singin' in the Rain
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('creator', $cr$Sergio Leone$cr$, 'final_clue', $fc$Italy · 1960s$fc$, 'category_details', $cd$1966 · Spaghetti Western$cd$),
  fun_fact = $ff$Composer Ennio Morricone wrote the iconic theme before filming even began, and Sergio Leone played it on set to help the actors find the right mood.$ff$
where id = '2a66eb7d-aceb-4dad-9036-43eb1a217807'; -- The Good, the Bad and the Ugly
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('creator', $cr$Jim Sheridan$cr$, 'final_clue', $fc$UK · 1990s$fc$, 'category_details', $cd$1993 · Drama$cd$),
  fun_fact = $ff$Based on the true story of the Guildford Four, wrongly convicted of a 1974 IRA pub bombing and imprisoned for 15 years before being exonerated.$ff$
where id = 'fb49463f-e0fe-4cdb-aae1-b95c833b5815'; -- In the Name of the Father
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('creator', $cr$John Singleton$cr$, 'final_clue', $fc$USA · 1990s$fc$, 'category_details', $cd$1991 · Drama$cd$),
  fun_fact = $ff$Director John Singleton was just 24 when the film came out, becoming the youngest person and the first Black director ever nominated for the Best Director Oscar.$ff$
where id = '06aee4a5-f6b9-47de-886d-08c5cce51aca'; -- Boyz n the Hood
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('creator', $cr$John Hughes$cr$, 'final_clue', $fc$USA · 1980s$fc$, 'category_details', $cd$1986 · Comedy$cd$),
  fun_fact = $ff$John Hughes reportedly wrote the entire script in about a week -- the '61 Ferrari GT California destroyed on screen was actually a fiberglass replica, since real ones were far too rare.$ff$
where id = 'bafad9e9-cfde-4867-8bb0-f9d6491b8977'; -- Ferris Bueller's Day Off
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('creator', $cr$Wes Craven$cr$, 'final_clue', $fc$USA · 1980s$fc$, 'category_details', $cd$1984 · Horror$cd$),
  fun_fact = $ff$Marked the film debut of a young Johnny Depp, reportedly cast partly because director Wes Craven's daughter thought he was cute.$ff$
where id = 'a4f46106-0ed0-448c-8bd4-c02a4cc0d7cc'; -- A Nightmare on Elm Street
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('creator', $cr$Tobe Hooper$cr$, 'final_clue', $fc$USA · 1970s$fc$, 'category_details', $cd$1974 · Horror$cd$),
  fun_fact = $ff$Despite its reputation, the film shows almost no on-screen gore -- its terror comes almost entirely from editing, sound, and suggestion.$ff$
where id = '6b03f23d-3a86-4b29-bf1d-78a7505cf391'; -- The Texas Chain Saw Massacre
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('creator', $cr$Ang Lee$cr$, 'final_clue', $fc$Taiwan · 2000s$fc$, 'category_details', $cd$2000 · Wuxia martial arts$cd$),
  fun_fact = $ff$Won 4 Academy Awards including Best Foreign Language Film, and remains the highest-grossing foreign-language film ever released in the US.$ff$
where id = '8db1a802-e185-414e-9659-453efdb9a340'; -- Crouching Tiger, Hidden Dragon
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('creator', $cr$Joel and Ethan Coen$cr$, 'final_clue', $fc$USA · 2000s$fc$, 'category_details', $cd$2000 · Comedy$cd$),
  fun_fact = $ff$Loosely based on Homer's Odyssey; its old-time bluegrass soundtrack unexpectedly sold millions of copies and won the Grammy for Album of the Year.$ff$
where id = '5bcd1333-af4d-4705-ab2f-056c9e0679b0'; -- O Brother, Where Art Thou?
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('creator', $cr$Darren Aronofsky$cr$, 'final_clue', $fc$USA · 2000s$fc$, 'category_details', $cd$2000 · Psychological drama$cd$),
  fun_fact = $ff$Director Darren Aronofsky refused to cut a controversial sequence to avoid an NC-17 rating, so the studio released the film unrated instead.$ff$
where id = '6e9a882e-8f0d-4deb-b302-c86aa9312a8f'; -- Requiem for a Dream
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('creator', $cr$Anthony Minghella$cr$, 'final_clue', $fc$USA · 1990s$fc$, 'category_details', $cd$1999 · Psychological thriller$cd$),
  fun_fact = $ff$Based on Patricia Highsmith's 1955 novel; Matt Damon reportedly learned Italian and brushed up on piano for the role.$ff$
where id = '0636bba1-39b5-43ff-b154-25eed0e4ceb5'; -- The Talented Mr. Ripley
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('creator', $cr$Peter Weir$cr$, 'final_clue', $fc$USA · 2000s$fc$, 'category_details', $cd$2003 · Naval adventure$cd$),
  fun_fact = $ff$Its title splices together the first and tenth books of Patrick O'Brian's 20-novel Aubrey-Maturin series.$ff$
where id = '6c6633de-bb47-4626-a072-3fd399ec670d'; -- Master and Commander: The Far Side of the World
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('creator', $cr$Tim Burton$cr$, 'final_clue', $fc$USA · 2000s$fc$, 'category_details', $cd$2007 · Musical horror$cd$),
  fun_fact = $ff$Based on Stephen Sondheim's 1979 stage musical; Johnny Depp and Helena Bonham Carter did all their own singing despite neither being a trained vocalist.$ff$
where id = '203a1134-2456-4c69-a503-a16b7e580818'; -- Sweeney Todd: The Demon Barber of Fleet Street
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('creator', $cr$Garth Jennings$cr$, 'final_clue', $fc$UK · 2000s$fc$, 'category_details', $cd$2005 · Science fiction comedy$cd$),
  fun_fact = $ff$Based on Douglas Adams's novel and radio series; Adams worked on drafts of the screenplay himself before his death in 2001, four years before release.$ff$
where id = 'fbce5d46-2b80-4e61-b07e-77aa39385d07'; -- The Hitchhiker's Guide to the Galaxy
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('creator', $cr$Andrew Adamson$cr$, 'final_clue', $fc$USA · 2000s$fc$, 'category_details', $cd$2005 · Fantasy$cd$),
  fun_fact = $ff$Based on C.S. Lewis's 1950 novel; the wardrobe prop used in filming was carved from wood from the actual tree that inspired Lewis to write the story.$ff$
where id = 'ba1cbda4-9c03-4f5a-adb8-34c285e35cba'; -- The Chronicles of Narnia: The Lion, the Witch and the Wardrobe
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('creator', $cr$Quentin Tarantino$cr$, 'final_clue', $fc$USA · 2010s$fc$, 'category_details', $cd$2019 · Comedy drama$cd$),
  fun_fact = $ff$Set around the real 1969 Tate murders but rewrites their outcome -- Tarantino has called it his most personal film, a love letter to late-1960s Los Angeles.$ff$
where id = '290ba214-be85-41a6-9286-1ed60bed2464'; -- Once Upon a Time in Hollywood
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('creator', $cr$Martin Scorsese$cr$, 'final_clue', $fc$USA · 2010s$fc$, 'category_details', $cd$2013 · Biographical black comedy$cd$),
  fun_fact = $ff$Based on Jordan Belfort's memoir; the script reportedly uses some variant of the word "f***" more than 500 times, among the most of any mainstream film.$ff$
where id = '8df089b1-1501-4b84-b3e7-032cf49a9389'; -- The Wolf of Wall Street
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('creator', $cr$Martin McDonagh$cr$, 'final_clue', $fc$USA · 2010s$fc$, 'category_details', $cd$2017 · Dark comedy drama$cd$),
  fun_fact = $ff$Won 2 acting Oscars (Frances McDormand and Sam Rockwell) despite its fictional Missouri town actually being filmed in North Carolina.$ff$
where id = '206bca9b-8b34-4a1a-ba53-734d198f97fc'; -- Three Billboards Outside Ebbing, Missouri
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('creator', $cr$Aaron Sorkin$cr$, 'final_clue', $fc$USA · 2020s$fc$, 'category_details', $cd$2020 · Historical drama$cd$),
  fun_fact = $ff$Dramatizes the real 1969 trial of anti-Vietnam War protesters; Aaron Sorkin had been developing the script for over a decade before finally directing it himself.$ff$
where id = '3b6aa264-04fa-49dd-a75e-6543b840acda'; -- The Trial of the Chicago 7
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('creator', $cr$Jane Campion$cr$, 'final_clue', $fc$New Zealand · 2020s$fc$, 'category_details', $cd$2021 · Western drama$cd$),
  fun_fact = $ff$Jane Campion became only the third woman ever to win the Best Director Oscar; the 1920s Montana setting was actually filmed in her native New Zealand.$ff$
where id = '944b33e9-b328-4411-8d1b-5b6e4b23d77d'; -- The Power of the Dog
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('creator', $cr$Martin McDonagh$cr$, 'final_clue', $fc$Ireland · 2020s$fc$, 'category_details', $cd$2022 · Tragicomedy$cd$),
  fun_fact = $ff$Filmed on the real Irish islands of Achill and Inishmore; it reunites the two lead actors from writer-director Martin McDonagh's earlier film In Bruges.$ff$
where id = '6be42829-32c5-4576-9651-f875adf7e5a6'; -- The Banshees of Inisherin
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('creator', $cr$Daniel Kwan and Daniel Scheinert$cr$, 'final_clue', $fc$USA · 2020s$fc$, 'category_details', $cd$2022 · Science fiction comedy$cd$),
  fun_fact = $ff$Swept the 2023 Oscars with 7 wins including Best Picture; Michelle Yeoh became the first Asian actress ever to win Best Actress.$ff$
where id = '2a1b8994-f0b3-4bee-9e4c-8a780ac2d8ae'; -- Everything Everywhere All at Once
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('creator', $cr$Cary Joji Fukunaga$cr$, 'final_clue', $fc$UK · 2020s$fc$, 'category_details', $cd$2021 · Action spy$cd$),
  fun_fact = $ff$Daniel Craig's final film as James Bond -- at 163 minutes, it's the longest film in the entire Bond franchise.$ff$
where id = '5edc09c4-35f3-418e-89ac-3652eb700fb6'; -- No Time to Die
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('creator', $cr$Christopher Nolan$cr$, 'final_clue', $fc$USA · 2010s$fc$, 'category_details', $cd$2012 · Superhero$cd$),
  fun_fact = $ff$Closes out Christopher Nolan's trilogy; the football stadium collapse and most other set pieces were filmed practically, with minimal CGI.$ff$
where id = '35c04b3b-8466-4f92-874b-3b96b225b581'; -- The Dark Knight Rises

-- ============================================================
-- song: 25 new picks for Sept 6-30
-- ============================================================
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('artist', $ar$Sam Cooke$ar$, 'final_clue', $fc$USA · 1960s$fc$, 'category_details', $cd$1964 · Soul$cd$),
  fun_fact = $ff$Inspired partly by Sam Cooke being turned away from a whites-only motel; he was shot dead months before its release, and it became an anthem of the civil rights movement.$ff$
where id = 'e7dc1d32-cda1-4aa0-a270-8d60acd65780'; -- A Change Is Gonna Come
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('artist', $ar$Johnny Cash$ar$, 'final_clue', $fc$USA · 1950s$fc$, 'category_details', $cd$1956 · Country$cd$),
  fun_fact = $ff$Johnny Cash said he wrote it backstage as a pledge of fidelity to his first wife -- he got the song's distinctive low hum by threading a piece of paper through his guitar strings.$ff$
where id = '8bbaf49d-2c5f-49bb-b895-584b98d6d992'; -- I Walk the Line
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('artist', $ar$Little Richard$ar$, 'final_clue', $fc$USA · 1950s$fc$, 'category_details', $cd$1958 · Rock and roll$cd$),
  fun_fact = $ff$Its explosive opening was reportedly inspired by a Memphis DJ's on-air catchphrase, and the song went on to become one of the most covered rock and roll tracks ever recorded.$ff$
where id = 'cf92e709-a679-48f4-9e51-d35c44639284'; -- Good Golly Miss Molly
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('artist', $ar$The Animals$ar$, 'final_clue', $fc$UK · 1960s$fc$, 'category_details', $cd$1964 · Folk rock$cd$),
  fun_fact = $ff$An old American folk song the band electrified and recorded in a single take; at over four minutes, it was unusually long for a hit single of its era.$ff$
where id = '2ded7d19-ecb6-4a10-bfd1-829dbbcadf96'; -- The House Of The Rising Sun
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('artist', $ar$The Who$ar$, 'final_clue', $fc$UK · 1970s$fc$, 'category_details', $cd$1971 · Rock$cd$),
  fun_fact = $ff$Built around one of rock's earliest famous synthesizer parts, run through an EMS VCS3 -- and closes with Roger Daltrey's iconic primal scream.$ff$
where id = 'a4ae3542-bed3-4dcc-8fee-6c84e441ca7f'; -- Won't Get Fooled Again
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('artist', $ar$The Beatles$ar$, 'final_clue', $fc$UK · 1960s$fc$, 'category_details', $cd$1968 · Rock$cd$),
  fun_fact = $ff$George Harrison invited his friend Eric Clapton to play the song's lead guitar -- a rare outside musician credited on a Beatles record.$ff$
where id = '9b95d166-a7c0-4daf-babd-272326803dd5'; -- While My Guitar Gently Weeps
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('artist', $ar$Pixies$ar$, 'final_clue', $fc$USA · 1980s$fc$, 'category_details', $cd$1988 · Alternative rock$cd$),
  fun_fact = $ff$Barely a hit on release, it found a huge new audience over a decade later after soundtracking the final scene of Fight Club (1999).$ff$
where id = '378e2142-7608-4e5d-b296-ad0ba18f278c'; -- Where Is My Mind?
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('artist', $ar$Sex Pistols$ar$, 'final_clue', $fc$UK · 1970s$fc$, 'category_details', $cd$1976 · Punk rock$cd$),
  fun_fact = $ff$The Sex Pistols' debut single is widely credited as one of the songs that kickstarted British punk -- and got them dropped by their record label within months.$ff$
where id = 'f1fdb051-db5c-4ca3-ae11-4743d824fa23'; -- Anarchy in the U.K.
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('artist', $ar$Talking Heads$ar$, 'final_clue', $fc$USA · 1980s$fc$, 'category_details', $cd$1980 · New wave$cd$),
  fun_fact = $ff$Frontman David Byrne based the song's jerky choreography and preacher-like delivery on footage of Pentecostal faith healers and TV evangelists.$ff$
where id = 'c6de25f9-fc31-4412-9b72-77467818d989'; -- Once in a Lifetime
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('artist', $ar$Beyoncé$ar$, 'final_clue', $fc$USA · 2000s$fc$, 'category_details', $cd$2008 · R&B / pop$cd$),
  fun_fact = $ff$Its black-leotard choreography became one of the most parodied dance routines ever, famously spoofed by Justin Timberlake on Saturday Night Live.$ff$
where id = 'ae0ea77b-b566-42ef-b6e0-264a743108fc'; -- Single Ladies (Put a Ring on It)
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('artist', $ar$Blink-182$ar$, 'final_clue', $fc$USA · 1990s$fc$, 'category_details', $cd$1999 · Pop punk$cd$),
  fun_fact = $ff$Its music video pokes fun at the boy-band video tropes of the era, from *NSYNC to the Backstreet Boys.$ff$
where id = '51303fc7-672d-44eb-9b91-402205424519'; -- All the Small Things
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('artist', $ar$Pink Floyd$ar$, 'final_clue', $fc$UK · 1970s$fc$, 'category_details', $cd$1979 · Progressive rock$cd$),
  fun_fact = $ff$Featured a children's choir from a local London school; it became Pink Floyd's only ever UK #1 single.$ff$
where id = '165cd8d4-be2b-4cd9-87c9-e32ff86492c8'; -- Another Brick in the Wall
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('artist', $ar$Nirvana$ar$, 'final_clue', $fc$USA · 1990s$fc$, 'category_details', $cd$1991 · Grunge$cd$),
  fun_fact = $ff$Its guitar riff drew comparisons to the earlier song "Eighties" by post-punk band Killing Joke -- a resemblance Kurt Cobain later acknowledged.$ff$
where id = '2a09fc7d-01df-4164-8fd4-d605051e3ae1'; -- Come As You Are
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('artist', $ar$Joy Division$ar$, 'final_clue', $fc$UK · 1980s$fc$, 'category_details', $cd$1980 · Post-punk$cd$),
  fun_fact = $ff$Released just weeks after singer Ian Curtis's death; its title is engraved on his gravestone.$ff$
where id = '99627083-d584-49d0-9327-06450306e9a6'; -- Love Will Tear Us Apart
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('artist', $ar$The Rolling Stones$ar$, 'final_clue', $fc$UK · 1960s$fc$, 'category_details', $cd$1969 · Rock$cd$),
  fun_fact = $ff$Opens with the London Bach Choir singing the refrain, arranged by producer Jack Nitzsche.$ff$
where id = '50ec4288-7f81-417b-a304-1fda7c6989bc'; -- You Can't Always Get What You Want
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('artist', $ar$The Temptations$ar$, 'final_clue', $fc$USA · 1970s$fc$, 'category_details', $cd$1972 · Soul / funk$cd$),
  fun_fact = $ff$The full album version runs almost 12 minutes, with more than half of it a pure instrumental groove before any vocals begin -- it won 3 Grammy Awards.$ff$
where id = '263e412f-c20c-4c41-b732-d14959ab4c48'; -- Papa Was a Rollin' Stone
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('artist', $ar$Marvin Gaye & Tammi Terrell$ar$, 'final_clue', $fc$USA · 1960s$fc$, 'category_details', $cd$1967 · Motown soul$cd$),
  fun_fact = $ff$Written by Ashford & Simpson; Diana Ross took it back to #1 as a solo artist in 1970, in a completely different, sweeping arrangement.$ff$
where id = 'fa260231-0fd3-463e-af0e-5bfca1fcbbf4'; -- Ain't No Mountain High Enough
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('artist', $ar$Whitney Houston$ar$, 'final_clue', $fc$USA · 1980s$fc$, 'category_details', $cd$1987 · Pop$cd$),
  fun_fact = $ff$One of Whitney Houston's signature hits, it won the Grammy for Best Female Pop Vocal Performance.$ff$
where id = 'c69814af-4edb-456b-9d77-dfbd4b3054bc'; -- I Wanna Dance with Somebody
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('artist', $ar$The Clash$ar$, 'final_clue', $fc$UK · 1980s$fc$, 'category_details', $cd$1982 · Punk rock$cd$),
  fun_fact = $ff$The song includes a Spanish-translated second verse -- and, nine years after release, it hit #1 in the UK after appearing in a Levi's jeans commercial.$ff$
where id = 'f876e88c-b263-4611-95f6-7f4b8a610843'; -- Should I Stay or Should I Go
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('artist', $ar$Bob Dylan$ar$, 'final_clue', $fc$USA · 1960s$fc$, 'category_details', $cd$1964 · Folk$cd$),
  fun_fact = $ff$Bob Dylan wrote it as a deliberate protest anthem, drawing on the structure of traditional Irish and Scottish ballads.$ff$
where id = '8ce64316-272b-483e-bf0f-694d4063b928'; -- The Times They Are A-Changin'
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('artist', $ar$Stan Getz & João Gilberto$ar$, 'final_clue', $fc$Brazil · 1960s$fc$, 'category_details', $cd$1964 · Bossa nova$cd$),
  fun_fact = $ff$The biggest bossa nova hit ever recorded -- the real young woman who inspired it, Heloísa Pinheiro, later opened a boutique named after the song.$ff$
where id = '4fc0cfc5-fbb4-4b84-a1e9-114cf3be8a6e'; -- The Girl from Ipanema
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('artist', $ar$Jerry Lee Lewis$ar$, 'final_clue', $fc$USA · 1950s$fc$, 'category_details', $cd$1957 · Rock and roll$cd$),
  fun_fact = $ff$Producer Sam Phillips reportedly recorded Jerry Lee Lewis on tape arguing that rock and roll might be sinful before he agreed to cut the track.$ff$
where id = '98a0d8ee-99bd-4dbe-8d8e-588b3546fb61'; -- Great Balls of Fire
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('artist', $ar$Led Zeppelin$ar$, 'final_clue', $fc$UK · 1960s$fc$, 'category_details', $cd$1969 · Hard rock$cd$),
  fun_fact = $ff$The opening track of Led Zeppelin's debut album -- drummer John Bonham's rapid-fire bass-drum triplets, played on a single kick pedal, stunned drummers who assumed he'd used two.$ff$
where id = 'f33d00be-53db-4da8-b6c2-b26aee3755fa'; -- Good Times Bad Times
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('artist', $ar$The Supremes$ar$, 'final_clue', $fc$USA · 1960s$fc$, 'category_details', $cd$1965 · Motown$cd$),
  fun_fact = $ff$The song's famous "stop" hand gesture became the group's signature move, reportedly improvised by Diana Ross during rehearsal.$ff$
where id = '5c4f9489-69bc-4fc3-a11c-bbed13c3f48d'; -- Stop! In the Name of Love
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('artist', $ar$Tina Turner$ar$, 'final_clue', $fc$USA · 1980s$fc$, 'category_details', $cd$1984 · Pop$cd$),
  fun_fact = $ff$Other artists passed on the song before Tina Turner recorded it -- it became her only US #1 solo hit and marked a major career comeback.$ff$
where id = '37e5315a-bce8-4ba0-9f29-6ebadfea6fd2'; -- What's Love Got to Do with It

-- ============================================================
-- book: 25 new picks for Sept 6-30
-- ============================================================
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('author', $au$Umberto Eco$au$, 'final_clue', $fc$Italy · 1980s$fc$, 'category_details', $cd$1980 · Historical mystery$cd$),
  fun_fact = $ff$A murder mystery set in a 14th-century monastery; semiotics professor Umberto Eco packed it with untranslated Latin, yet it became an unlikely international bestseller.$ff$
where id = '2995068c-cdec-49b7-90f7-a4f92ce01bce'; -- The Name of the Rose
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('author', $au$Jonathan Swift$au$, 'final_clue', $fc$Ireland · 1720s$fc$, 'category_details', $cd$1726 · Satire$cd$),
  fun_fact = $ff$Published anonymously and framed as a genuine travel memoir, it became an instant sensation -- Jonathan Swift was paid a flat fee up front and never saw a share of its runaway sales.$ff$
where id = '60067e7f-1ab3-46d2-8444-539c8033dde1'; -- Gulliver's Travels into Several Remote Nations of the World
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('author', $au$Victor Hugo$au$, 'final_clue', $fc$France · 1830s$fc$, 'category_details', $cd$1831 · Gothic fiction$cd$),
  fun_fact = $ff$Victor Hugo partly wrote it to draw attention to the real Notre-Dame cathedral, then in disrepair -- the novel's popularity helped spark its actual 19th-century restoration.$ff$
where id = '023aaa2e-391c-447e-b46c-317781730fb7'; -- The Hunchback of Notre-Dame
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('author', $au$Arthur Conan Doyle$au$, 'final_clue', $fc$UK · 1880s$fc$, 'category_details', $cd$1887 · Mystery$cd$),
  fun_fact = $ff$Introduced Sherlock Holmes and Dr. Watson to the world, but it was rejected by several publishers first -- Arthur Conan Doyle finally sold the full rights outright for just £25.$ff$
where id = '08c4ab2e-45db-47b9-a02c-70ab2b81bc27'; -- A Study in Scarlet
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('author', $au$Joseph Conrad$au$, 'final_clue', $fc$UK · 1890s$fc$, 'category_details', $cd$1899 · Novella$cd$),
  fun_fact = $ff$Drawn from Joseph Conrad's own harrowing 1890 steamboat journey up the Congo River; it was loosely reimagined decades later as the film Apocalypse Now, transplanted to the Vietnam War.$ff$
where id = '78c32d97-fb56-4a4f-9b4e-4ca28325fbd9'; -- The Heart of Darkness
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('author', $au$Anne Frank$au$, 'final_clue', $fc$Netherlands · 1940s$fc$, 'category_details', $cd$1947 · Memoir$cd$),
  fun_fact = $ff$Anne Frank's father Otto, the only family member to survive the Holocaust, found her diary left behind in their hiding place and had it published after the war.$ff$
where id = '7ff898a8-38e5-41a8-8508-3e3e1c1c8d93'; -- The Diary of a Young Girl
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('author', $au$James Jones$au$, 'final_clue', $fc$USA · 1950s$fc$, 'category_details', $cd$1951 · War fiction$cd$),
  fun_fact = $ff$Set among US Army soldiers in Hawaii just before Pearl Harbor, it won the National Book Award and inspired the 1953 Oscar-winning film famous for its beach kissing scene.$ff$
where id = '3c6445b8-2a46-4455-8e2b-dab72fc177f6'; -- From Here to Eternity
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('author', $au$Kenneth Grahame$au$, 'final_clue', $fc$UK · 1900s$fc$, 'category_details', $cd$1908 · Children's fiction$cd$),
  fun_fact = $ff$Grew out of bedtime stories and letters Kenneth Grahame wrote for his young son -- Mr. Toad's reckless obsession with cars was inspired by the still-novel automobile of the era.$ff$
where id = '164daa9c-ba20-4e87-be64-7bc3593abb4d'; -- The Wind in the Willows
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('author', $au$Jules Verne$au$, 'final_clue', $fc$France · 1870s$fc$, 'category_details', $cd$1870 · Science fiction$cd$),
  fun_fact = $ff$Imagined the submarine Nautilus decades before real submarines came close to its capabilities -- the US Navy later named its first nuclear submarine after it.$ff$
where id = '745b87e4-6cd4-45d6-bf5a-341ec1bf4f81'; -- Twenty Thousand Leagues Under the Seas
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('author', $au$Malcolm X and Alex Haley$au$, 'final_clue', $fc$USA · 1960s$fc$, 'category_details', $cd$1965 · Memoir$cd$),
  fun_fact = $ff$Ghostwritten by journalist Alex Haley from extensive interviews with Malcolm X -- it was published just months after his assassination.$ff$
where id = 'ade1bbe3-ec04-4e80-93ab-39f00c29c2c7'; -- The Autobiography of Malcolm X
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('author', $au$Zora Neale Hurston$au$, 'final_clue', $fc$USA · 1930s$fc$, 'category_details', $cd$1937 · Fiction$cd$),
  fun_fact = $ff$Reportedly written in just seven weeks; it fell out of print for decades after mixed early reviews before being rediscovered and championed by Alice Walker in the 1970s.$ff$
where id = '8816b677-66e0-4766-b08d-da90ff7d14b8'; -- Their Eyes Were Watching God
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('author', $au$Charles Darwin$au$, 'final_clue', $fc$UK · 1850s$fc$, 'category_details', $cd$1859 · Science$cd$),
  fun_fact = $ff$The entire first printing of 1,250 copies reportedly sold out on its very first day on sale.$ff$
where id = '5d5c7aba-bd1c-4109-8500-01db97a3d8d9'; -- The Origin of Species
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('author', $au$Karl Marx and Friedrich Engels$au$, 'final_clue', $fc$Germany · 1840s$fc$, 'category_details', $cd$1848 · Political philosophy$cd$),
  fun_fact = $ff$Commissioned by a small political group in London and published anonymously, it went largely unnoticed for decades until it was widely reprinted after Marx later became famous.$ff$
where id = '39e7e119-0191-40f2-8007-dfc7ba7949bd'; -- The Communist Manifesto
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('author', $au$Adam Smith$au$, 'final_clue', $fc$Scotland · 1770s$fc$, 'category_details', $cd$1776 · Economics$cd$),
  fun_fact = $ff$Published the same year as the American Declaration of Independence, it's widely regarded as the founding text of modern economics.$ff$
where id = '4f04e1b2-0784-431a-a85e-fd21576a5267'; -- The Wealth of Nations
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('author', $au$James Joyce$au$, 'final_clue', $fc$Ireland · 1910s$fc$, 'category_details', $cd$1916 · Bildungsroman$cd$),
  fun_fact = $ff$Began as a much longer autobiographical manuscript called Stephen Hero, which James Joyce drastically cut down and reworked into the finished novel.$ff$
where id = '146682be-af05-4632-b4f3-ece1f8c699d5'; -- A Portrait of the Artist as a Young Man
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('author', $au$John le Carré$au$, 'final_clue', $fc$UK · 1960s$fc$, 'category_details', $cd$1963 · Spy fiction$cd$),
  fun_fact = $ff$John le Carré -- a pen name for David Cornwell -- drew on his own past working for British intelligence agencies MI5 and MI6 to write it.$ff$
where id = '54afd088-1dd5-4b5f-a5b2-d3b44dbddcdd'; -- The Spy Who Came in from the Cold
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('author', $au$Milan Kundera$au$, 'final_clue', $fc$Czechoslovakia · 1980s$fc$, 'category_details', $cd$1984 · Philosophical fiction$cd$),
  fun_fact = $ff$Set against the 1968 Soviet invasion of Czechoslovakia, Milan Kundera wrote it in Czech after emigrating to France following the crackdown.$ff$
where id = 'af45f7c1-ec10-453a-af88-4503d7df7afc'; -- The Unbearable Lightness of Being
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('author', $au$Gabriel García Márquez$au$, 'final_clue', $fc$Colombia · 1980s$fc$, 'category_details', $cd$1985 · Magical realism$cd$),
  fun_fact = $ff$Inspired partly by the real courtship story of Gabriel García Márquez's own parents.$ff$
where id = '1110e63a-e731-4583-b9ee-b9a241f80eda'; -- Love in the Time of Cholera
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('author', $au$John Kennedy Toole$au$, 'final_clue', $fc$USA · 1980s$fc$, 'category_details', $cd$1980 · Comic novel$cd$),
  fun_fact = $ff$John Kennedy Toole died by suicide in 1969 without ever seeing it published -- his mother spent over a decade fighting to get it into print, and it won the Pulitzer Prize the year it finally appeared.$ff$
where id = 'c02cb46a-7ee1-46d5-b82f-3697eabb1aff'; -- A Confederacy of Dunces
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('author', $au$Rebecca Skloot$au$, 'final_clue', $fc$USA · 2010s$fc$, 'category_details', $cd$2010 · Narrative nonfiction$cd$),
  fun_fact = $ff$Tells the true story of Henrietta Lacks, whose cancer cells -- taken without her knowledge in 1951 -- became the "HeLa" cell line still used in medical research worldwide today.$ff$
where id = 'aa2dc50f-5703-4510-b13a-c717f59c30ef'; -- The Immortal Life of Henrietta Lacks
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('author', $au$Erik Larson$au$, 'final_clue', $fc$USA · 2000s$fc$, 'category_details', $cd$2003 · Narrative nonfiction$cd$),
  fun_fact = $ff$Weaves together the true stories of the dazzling 1893 Chicago World's Fair and a serial killer, H.H. Holmes, active in the city at the very same time.$ff$
where id = '17718f0d-5529-4c34-8b90-c776d35c08d0'; -- The Devil in the White City
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('author', $au$Delia Owens$au$, 'final_clue', $fc$USA · 2010s$fc$, 'category_details', $cd$2018 · Fiction$cd$),
  fun_fact = $ff$Became a surprise phenomenon, spending well over a year near the top of bestseller lists before its 2022 film adaptation.$ff$
where id = '6aea39f6-89d3-498b-9dd7-3e580ee07eee'; -- Where the Crawdads Sing
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('author', $au$Taylor Jenkins Reid$au$, 'final_clue', $fc$USA · 2010s$fc$, 'category_details', $cd$2017 · Fiction$cd$),
  fun_fact = $ff$Its fictional Old Hollywood star is a composite drawing on real golden-age icons like Elizabeth Taylor and Rita Hayworth.$ff$
where id = 'f13499f9-c19d-4c3a-b913-43b5a6c1893a'; -- The Seven Husbands of Evelyn Hugo
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('author', $au$Judy Blume$au$, 'final_clue', $fc$USA · 1970s$fc$, 'category_details', $cd$1970 · Young adult fiction$cd$),
  fun_fact = $ff$Its frank depiction of puberty made it one of the most frequently challenged and banned books in American schools for decades.$ff$
where id = '399c5051-c330-438d-b40b-3fdb8ad26925'; -- Are You There God? It's Me, Margaret.
update puzzles set
  hints = coalesce(hints, '{}'::jsonb) || jsonb_build_object('author', $au$Mark Haddon$au$, 'final_clue', $fc$UK · 2000s$fc$, 'category_details', $cd$2003 · Fiction$cd$),
  fun_fact = $ff$Narrated by a teenage boy with an autism-spectrum perspective, it was later adapted into a Tony and Olivier Award-winning stage play.$ff$
where id = '2c0006c5-8c20-49fa-9141-24bf096b87ba'; -- The Curious Incident of the Dog in the Night-Time

-- ============================================================
-- SECTION 3 — daily_puzzles: Sept 6-30 assignment + Sept 1-30 free-category flags
-- ============================================================

-- Sept 1-5 already have puzzle rows (see preseed_daily_puzzles.sql) but
-- were never flagged with a free category -- rotate-daily-puzzle.js only
-- assigns is_free for *today*, so these past-dated rows were skipped.
-- Setting them explicitly here so freemium access has worked correctly
-- retroactively for the whole month, independent of whether the scheduled
-- function has been running. Each update only fires if nothing is already
-- marked free for that date (guards against the partial unique index if
-- the real cron already assigned a different category by the time this runs).
update daily_puzzles set is_free = true
where puzzle_date = '2026-09-01' and category = 'movie'
  and not exists (select 1 from daily_puzzles d2 where d2.puzzle_date = '2026-09-01' and d2.is_free);
update daily_puzzles set is_free = true
where puzzle_date = '2026-09-02' and category = 'song'
  and not exists (select 1 from daily_puzzles d2 where d2.puzzle_date = '2026-09-02' and d2.is_free);
update daily_puzzles set is_free = true
where puzzle_date = '2026-09-03' and category = 'book'
  and not exists (select 1 from daily_puzzles d2 where d2.puzzle_date = '2026-09-03' and d2.is_free);
update daily_puzzles set is_free = true
where puzzle_date = '2026-09-04' and category = 'proverb'
  and not exists (select 1 from daily_puzzles d2 where d2.puzzle_date = '2026-09-04' and d2.is_free);
update daily_puzzles set is_free = true
where puzzle_date = '2026-09-05' and category = 'movie'
  and not exists (select 1 from daily_puzzles d2 where d2.puzzle_date = '2026-09-05' and d2.is_free);

insert into daily_puzzles (puzzle_date, category, puzzle_id, is_free)
values
  ('2026-09-06', 'movie', '0f3bb710-e1f0-4a79-82c8-ae5e5e8ae66e', false), -- The Day the Earth Stood Still
  ('2026-09-06', 'song', 'e7dc1d32-cda1-4aa0-a270-8d60acd65780', true), -- A Change Is Gonna Come
  ('2026-09-06', 'book', '2995068c-cdec-49b7-90f7-a4f92ce01bce', false), -- The Name of the Rose
  ('2026-09-06', 'proverb', 'f09d8b0a-68e0-4248-88f8-de1a179b6691', false), -- Laughter is the best medicine
  ('2026-09-07', 'movie', '00c43d30-9fc8-46e2-acb5-6859988fe310', false), -- Singin' in the Rain
  ('2026-09-07', 'song', '8bbaf49d-2c5f-49bb-b895-584b98d6d992', false), -- I Walk the Line
  ('2026-09-07', 'book', '60067e7f-1ab3-46d2-8444-539c8033dde1', true), -- Gulliver's Travels into Several Remote Nations of the World
  ('2026-09-07', 'proverb', '4666c778-275c-479b-9a38-1aef33d2b973', false), -- Old habits die hard
  ('2026-09-08', 'movie', '2a66eb7d-aceb-4dad-9036-43eb1a217807', false), -- The Good, the Bad and the Ugly
  ('2026-09-08', 'song', 'cf92e709-a679-48f4-9e51-d35c44639284', false), -- Good Golly Miss Molly
  ('2026-09-08', 'book', '023aaa2e-391c-447e-b46c-317781730fb7', false), -- The Hunchback of Notre-Dame
  ('2026-09-08', 'proverb', '82ed8249-762f-48c4-8636-edaadceee1fd', true), -- Out of sight, out of mind
  ('2026-09-09', 'movie', 'fb49463f-e0fe-4cdb-aae1-b95c833b5815', true), -- In the Name of the Father
  ('2026-09-09', 'song', '2ded7d19-ecb6-4a10-bfd1-829dbbcadf96', false), -- The House Of The Rising Sun
  ('2026-09-09', 'book', '08c4ab2e-45db-47b9-a02c-70ab2b81bc27', false), -- A Study in Scarlet
  ('2026-09-09', 'proverb', '76a5f01d-98e8-4f39-909a-d3a5f544c766', false), -- Patience is a virtue
  ('2026-09-10', 'movie', '06aee4a5-f6b9-47de-886d-08c5cce51aca', false), -- Boyz n the Hood
  ('2026-09-10', 'song', 'a4ae3542-bed3-4dcc-8fee-6c84e441ca7f', true), -- Won't Get Fooled Again
  ('2026-09-10', 'book', '78c32d97-fb56-4a4f-9b4e-4ca28325fbd9', false), -- The Heart of Darkness
  ('2026-09-10', 'proverb', '09e12dea-11dd-4951-bbdf-c33e3448a352', false), -- Prevention is better than cure
  ('2026-09-11', 'movie', 'bafad9e9-cfde-4867-8bb0-f9d6491b8977', false), -- Ferris Bueller's Day Off
  ('2026-09-11', 'song', '9b95d166-a7c0-4daf-babd-272326803dd5', false), -- While My Guitar Gently Weeps
  ('2026-09-11', 'book', '7ff898a8-38e5-41a8-8508-3e3e1c1c8d93', true), -- The Diary of a Young Girl
  ('2026-09-11', 'proverb', '9246e14c-70ff-49b9-8481-19c3c73cec57', false), -- Slow and steady wins the race
  ('2026-09-12', 'movie', 'a4f46106-0ed0-448c-8bd4-c02a4cc0d7cc', false), -- A Nightmare on Elm Street
  ('2026-09-12', 'song', '378e2142-7608-4e5d-b296-ad0ba18f278c', false), -- Where Is My Mind?
  ('2026-09-12', 'book', '3c6445b8-2a46-4455-8e2b-dab72fc177f6', false), -- From Here to Eternity
  ('2026-09-12', 'proverb', 'fb9b4732-dcf0-477e-ae9a-614f73e73119', true), -- Still waters run deep
  ('2026-09-13', 'movie', '6b03f23d-3a86-4b29-bf1d-78a7505cf391', true), -- The Texas Chain Saw Massacre
  ('2026-09-13', 'song', 'f1fdb051-db5c-4ca3-ae11-4743d824fa23', false), -- Anarchy in the U.K.
  ('2026-09-13', 'book', '164daa9c-ba20-4e87-be64-7bc3593abb4d', false), -- The Wind in the Willows
  ('2026-09-13', 'proverb', 'e5bf2a50-0bbd-4b47-b051-cf873b43dace', false), -- A bird in the hand is worth two in the bush
  ('2026-09-14', 'movie', '8db1a802-e185-414e-9659-453efdb9a340', false), -- Crouching Tiger, Hidden Dragon
  ('2026-09-14', 'song', 'c6de25f9-fc31-4412-9b72-77467818d989', true), -- Once in a Lifetime
  ('2026-09-14', 'book', '745b87e4-6cd4-45d6-bf5a-341ec1bf4f81', false), -- Twenty Thousand Leagues Under the Seas
  ('2026-09-14', 'proverb', '91317648-cc05-4253-9ca2-8c7361ea5212', false), -- A stitch in time saves nine
  ('2026-09-15', 'movie', '5bcd1333-af4d-4705-ab2f-056c9e0679b0', false), -- O Brother, Where Art Thou?
  ('2026-09-15', 'song', 'ae0ea77b-b566-42ef-b6e0-264a743108fc', false), -- Single Ladies (Put a Ring on It)
  ('2026-09-15', 'book', 'ade1bbe3-ec04-4e80-93ab-39f00c29c2c7', true), -- The Autobiography of Malcolm X
  ('2026-09-15', 'proverb', '5dea588d-f5c3-4d8e-bbc2-6758c74672f1', false), -- Every cloud has a silver lining
  ('2026-09-16', 'movie', '6e9a882e-8f0d-4deb-b302-c86aa9312a8f', false), -- Requiem for a Dream
  ('2026-09-16', 'song', '51303fc7-672d-44eb-9b91-402205424519', false), -- All the Small Things
  ('2026-09-16', 'book', '8816b677-66e0-4766-b08d-da90ff7d14b8', false), -- Their Eyes Were Watching God
  ('2026-09-16', 'proverb', '576e1cb9-f72e-42bb-84fb-9a50f00459bc', true), -- Honesty is the best policy
  ('2026-09-17', 'movie', '0636bba1-39b5-43ff-b154-25eed0e4ceb5', true), -- The Talented Mr. Ripley
  ('2026-09-17', 'song', '165cd8d4-be2b-4cd9-87c9-e32ff86492c8', false), -- Another Brick in the Wall
  ('2026-09-17', 'book', '5d5c7aba-bd1c-4109-8500-01db97a3d8d9', false), -- The Origin of Species
  ('2026-09-17', 'proverb', 'a5c55d63-afdc-45d0-9312-5f7fc8e79169', false), -- Look before you leap
  ('2026-09-18', 'movie', '6c6633de-bb47-4626-a072-3fd399ec670d', false), -- Master and Commander: The Far Side of the World
  ('2026-09-18', 'song', '2a09fc7d-01df-4164-8fd4-d605051e3ae1', true), -- Come As You Are
  ('2026-09-18', 'book', '39e7e119-0191-40f2-8007-dfc7ba7949bd', false), -- The Communist Manifesto
  ('2026-09-18', 'proverb', '87e4f46e-2b22-4acc-8649-531b17c4e477', false), -- Every dog has its day
  ('2026-09-19', 'movie', '203a1134-2456-4c69-a503-a16b7e580818', false), -- Sweeney Todd: The Demon Barber of Fleet Street
  ('2026-09-19', 'song', '99627083-d584-49d0-9327-06450306e9a6', false), -- Love Will Tear Us Apart
  ('2026-09-19', 'book', '4f04e1b2-0784-431a-a85e-fd21576a5267', true), -- The Wealth of Nations
  ('2026-09-19', 'proverb', '0c182ced-feaa-408c-9ac5-f0a520bd26d4', false), -- The early bird catches the worm
  ('2026-09-20', 'movie', 'fbce5d46-2b80-4e61-b07e-77aa39385d07', false), -- The Hitchhiker's Guide to the Galaxy
  ('2026-09-20', 'song', '50ec4288-7f81-417b-a304-1fda7c6989bc', false), -- You Can't Always Get What You Want
  ('2026-09-20', 'book', '146682be-af05-4632-b4f3-ece1f8c699d5', false), -- A Portrait of the Artist as a Young Man
  ('2026-09-20', 'proverb', 'f3f24480-7f4b-41c3-96fa-40051b01c715', true), -- Actions speak louder than words
  ('2026-09-21', 'movie', 'ba1cbda4-9c03-4f5a-adb8-34c285e35cba', true), -- The Chronicles of Narnia: The Lion, the Witch and the Wardrobe
  ('2026-09-21', 'song', '263e412f-c20c-4c41-b732-d14959ab4c48', false), -- Papa Was a Rollin' Stone
  ('2026-09-21', 'book', '54afd088-1dd5-4b5f-a5b2-d3b44dbddcdd', false), -- The Spy Who Came in from the Cold
  ('2026-09-21', 'proverb', 'b26dbb4b-571b-4798-976c-4311c190475c', false), -- Great minds think alike
  ('2026-09-22', 'movie', '290ba214-be85-41a6-9286-1ed60bed2464', false), -- Once Upon a Time in Hollywood
  ('2026-09-22', 'song', 'fa260231-0fd3-463e-af0e-5bfca1fcbbf4', true), -- Ain't No Mountain High Enough
  ('2026-09-22', 'book', 'af45f7c1-ec10-453a-af88-4503d7df7afc', false), -- The Unbearable Lightness of Being
  ('2026-09-22', 'proverb', '65ae52e9-a4e1-40d1-8d52-d7ad80061e1d', false), -- Birds of a feather flock together
  ('2026-09-23', 'movie', '8df089b1-1501-4b84-b3e7-032cf49a9389', false), -- The Wolf of Wall Street
  ('2026-09-23', 'song', 'c69814af-4edb-456b-9d77-dfbd4b3054bc', false), -- I Wanna Dance with Somebody
  ('2026-09-23', 'book', '1110e63a-e731-4583-b9ee-b9a241f80eda', true), -- Love in the Time of Cholera
  ('2026-09-23', 'proverb', '347d8bcb-1c15-4ca8-892e-392487365276', false), -- All that glitters is not gold
  ('2026-09-24', 'movie', '206bca9b-8b34-4a1a-ba53-734d198f97fc', false), -- Three Billboards Outside Ebbing, Missouri
  ('2026-09-24', 'song', 'f876e88c-b263-4611-95f6-7f4b8a610843', false), -- Should I Stay or Should I Go
  ('2026-09-24', 'book', 'c02cb46a-7ee1-46d5-b82f-3697eabb1aff', false), -- A Confederacy of Dunces
  ('2026-09-24', 'proverb', '8c58c50b-ecc4-4165-97d7-87bf01d38baf', true), -- The pen is mightier than the sword
  ('2026-09-25', 'movie', '3b6aa264-04fa-49dd-a75e-6543b840acda', true), -- The Trial of the Chicago 7
  ('2026-09-25', 'song', '8ce64316-272b-483e-bf0f-694d4063b928', false), -- The Times They Are A-Changin'
  ('2026-09-25', 'book', 'aa2dc50f-5703-4510-b13a-c717f59c30ef', false), -- The Immortal Life of Henrietta Lacks
  ('2026-09-25', 'proverb', 'e325579a-ce50-467d-a05f-e83f40353cc1', false), -- Time heals all wounds
  ('2026-09-26', 'movie', '944b33e9-b328-4411-8d1b-5b6e4b23d77d', false), -- The Power of the Dog
  ('2026-09-26', 'song', '4fc0cfc5-fbb4-4b84-a1e9-114cf3be8a6e', true), -- The Girl from Ipanema
  ('2026-09-26', 'book', '17718f0d-5529-4c34-8b90-c776d35c08d0', false), -- The Devil in the White City
  ('2026-09-26', 'proverb', '9b53f6cf-d306-4d25-b66e-fc14e79fa2a1', false), -- Two heads are better than one
  ('2026-09-27', 'movie', '6be42829-32c5-4576-9651-f875adf7e5a6', false), -- The Banshees of Inisherin
  ('2026-09-27', 'song', '98a0d8ee-99bd-4dbe-8d8e-588b3546fb61', false), -- Great Balls of Fire
  ('2026-09-27', 'book', '6aea39f6-89d3-498b-9dd7-3e580ee07eee', true), -- Where the Crawdads Sing
  ('2026-09-27', 'proverb', '834bf78e-0a0c-4ad0-9f3b-1ea1d01a3ab7', false), -- You cannot have your cake and eat it too
  ('2026-09-28', 'movie', '2a1b8994-f0b3-4bee-9e4c-8a780ac2d8ae', false), -- Everything Everywhere All at Once
  ('2026-09-28', 'song', 'f33d00be-53db-4da8-b6c2-b26aee3755fa', false), -- Good Times Bad Times
  ('2026-09-28', 'book', 'f13499f9-c19d-4c3a-b913-43b5a6c1893a', false), -- The Seven Husbands of Evelyn Hugo
  ('2026-09-28', 'proverb', '12bb9b6d-5c2e-424e-8605-b661a44572a0', true), -- You reap what you sow
  ('2026-09-29', 'movie', '5edc09c4-35f3-418e-89ac-3652eb700fb6', true), -- No Time to Die
  ('2026-09-29', 'song', '5c4f9489-69bc-4fc3-a11c-bbed13c3f48d', false), -- Stop! In the Name of Love
  ('2026-09-29', 'book', '399c5051-c330-438d-b40b-3fdb8ad26925', false), -- Are You There God? It's Me, Margaret.
  ('2026-09-29', 'proverb', 'ee12185d-01a6-4111-a119-1a39dfd080fc', false), -- Curiosity killed the cat
  ('2026-09-30', 'movie', '35c04b3b-8466-4f92-874b-3b96b225b581', false), -- The Dark Knight Rises
  ('2026-09-30', 'song', '37e5315a-bce8-4ba0-9f29-6ebadfea6fd2', true), -- What's Love Got to Do with It
  ('2026-09-30', 'book', '2c0006c5-8c20-49fa-9141-24bf096b87ba', false), -- The Curious Incident of the Dog in the Night-Time
  ('2026-09-30', 'proverb', '4fefcd4a-15fb-4895-9ee9-b604d9c03cb4', false) -- Do not judge a book by its cover
on conflict (puzzle_date, category) do nothing;
