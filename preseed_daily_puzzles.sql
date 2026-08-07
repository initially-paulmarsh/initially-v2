-- INITIALLY v2 — Pre-seed daily_puzzles buffer
-- Run this once in the Supabase SQL Editor (requires elevated privileges; RLS
-- blocks writes via the anon key, same as seed_puzzles.sql / today_puzzles.sql).
--
-- Fills daily_puzzles for the next 30 UK calendar dates (2026-08-07 through
-- 2026-09-05) across all 4 categories, so there's a content buffer
-- in place before netlify/functions/rotate-daily-puzzle.js has run for real.
--
-- Selection prioritizes puzzles that already have hints + fun_fact populated
-- (falling back to un-hinted puzzles once a category runs out of hinted ones),
-- shuffled within each priority tier. No puzzle already used in daily_puzzles
-- (i.e. today's row, from today_puzzles.sql) is reused. Safe to re-run — uses
-- ON CONFLICT DO NOTHING, so it never overwrites an existing assignment.
--
-- Buffer coverage by category (of the 29 new dates being filled):
--   movie    29/29 hinted, 0 un-hinted (30 hinted puzzles were available)
--   proverb  0/29 hinted, 29 un-hinted (0 hinted puzzles were available)
--   song     27/29 hinted, 2 un-hinted (27 hinted puzzles were available)
--   book     29/29 hinted, 0 un-hinted (29 hinted puzzles were available)

insert into daily_puzzles (puzzle_date, category, puzzle_id)
values
  ('2026-08-08', 'movie', '3d7cb13f-09d2-414b-8410-586f5aded58e'), -- The Pursuit of Happyness
  ('2026-08-08', 'proverb', 'd0c527cb-7983-4568-b102-023b3752e3d3'), -- Better late than never
  ('2026-08-08', 'song', '1d8f6bf4-929d-4d6c-b440-e7c3a41f7cf6'), -- We Didn''t Start the Fire
  ('2026-08-08', 'book', '2002409a-6ad0-4305-9852-27e6b27b5290'), -- The Fault in Our Stars
  ('2026-08-09', 'movie', '8a27c7d8-54e4-4d61-b481-4628e006a665'), -- A League of Their Own
  ('2026-08-09', 'proverb', 'fe18eb09-3691-406e-95cd-d8fb1056d450'), -- All is fair in love and war
  ('2026-08-09', 'song', '4b8948ca-b908-41c0-af17-ee6223182345'), -- We Are the Champions
  ('2026-08-09', 'book', 'a14730dd-bd79-412a-b823-8a827270b73a'), -- The Life of Pi
  ('2026-08-10', 'movie', '96ecd9e6-7e2d-448e-b29c-399279a81b49'), -- From Russia with Love
  ('2026-08-10', 'proverb', '7e0a7eb2-c96c-4fec-899b-0bea9df6ee95'), -- A friend in need is a friend indeed
  ('2026-08-10', 'song', '8f2dab7b-fa51-4183-a251-8e96735f4fc0'), -- Killing in the Name
  ('2026-08-10', 'book', '70523249-81e9-4053-a66d-1ed92ad0b9d6'), -- One Hundred Years of Solitude
  ('2026-08-11', 'movie', '65ba85d0-5fc8-4ac6-9ee4-07eacfd203c1'), -- Charlie and the Chocolate Factory
  ('2026-08-11', 'proverb', '2bd3d3f6-9546-44c4-a2fc-bcf11c436b99'), -- Necessity is the mother of invention
  ('2026-08-11', 'song', '1172c143-31a3-4b92-89c4-1236e378de9d'), -- Lucy in the Sky with Diamonds
  ('2026-08-11', 'book', '1fa6e8d1-9d42-4ace-92fe-197e8a35ef67'), -- And Then There Were None
  ('2026-08-12', 'movie', '904fe465-8e1b-4192-9492-7db63c72dd0e'), -- Eternal Sunshine of the Spotless Mind
  ('2026-08-12', 'proverb', '727931da-f037-4384-ab65-432064482700'), -- Experience is the best teacher
  ('2026-08-12', 'song', 'dac641cd-f74b-4d86-8211-55a165f30880'), -- I Want to Hold Your Hand
  ('2026-08-12', 'book', '4e4ce9fc-35cb-4fb9-a81f-4ca00e23c39a'), -- Green Eggs and Ham
  ('2026-08-13', 'movie', 'd21a41ad-1e59-4688-8570-efc860e15bb9'), -- Phantom of the Opera
  ('2026-08-13', 'proverb', '8a88d4e4-a7a8-4827-9dba-6ca0659053a7'), -- Truth is stranger than fiction
  ('2026-08-13', 'song', '0a080280-bd53-4832-b123-67c929127bd6'), -- The Sound of Silence
  ('2026-08-13', 'book', '7114e373-1fdd-4f4a-8b74-41672a17aaa8'), -- Gone with the Wind
  ('2026-08-14', 'movie', 'cda1d6ca-b17a-4571-8fc1-66e7779c13d7'), -- Interview with the Vampire
  ('2026-08-14', 'proverb', '2bab8baf-ed2a-4db8-a0f4-922c05c57267'), -- Where there is a will, there is a way
  ('2026-08-14', 'song', 'adbee151-eeb5-4131-8a4d-c0771b773b9b'), -- Here Comes the Sun
  ('2026-08-14', 'book', '7ee65651-222f-422e-8018-655ff481fc1d'), -- The Age of Innocence
  ('2026-08-15', 'movie', 'cd7b5b08-ecc6-4fa3-a4c0-dcd58311cc67'), -- The Grand Budapest Hotel
  ('2026-08-15', 'proverb', 'dc0dad81-74ad-4b5c-ade8-1b491fe5533e'), -- Charity begins at home
  ('2026-08-15', 'song', '3000b808-0ab4-46ba-9689-d1986f1129d9'), -- Sweet Child O'' Mine
  ('2026-08-15', 'book', 'df11a637-ae1d-4ab9-8365-22c4ffdc5b29'), -- The Grapes of Wrath
  ('2026-08-16', 'movie', 'f77abc58-76ff-4af1-8f58-08eefa391667'), -- Planet of the Apes
  ('2026-08-16', 'proverb', 'c63721da-a49d-4311-9e72-2f52a493dd14'), -- Pride comes before a fall
  ('2026-08-16', 'song', '3b193075-7ca9-44a9-a2a2-b11db3bf86f0'), -- Can''t Buy Me Love
  ('2026-08-16', 'book', 'e151c741-669e-4458-9128-f39b7728b46e'), -- I Know Why the Caged Bird Sings
  ('2026-08-17', 'movie', 'cc61e164-0e0f-485d-b231-da9b0a62f8ff'), -- The Fault in Our Stars
  ('2026-08-17', 'proverb', '7e8bccbc-5c02-4b8b-8b42-500b813f8f1b'), -- If the shoe fits, wear it
  ('2026-08-17', 'song', 'ca10c5e2-1dbc-4095-b038-31c2cebf2a76'), -- Blowin'' in the Wind
  ('2026-08-17', 'book', '77ba6254-6f0d-4a1d-a96e-9b1d623b5177'), -- The Power of Now
  ('2026-08-18', 'movie', '953d3a9a-2c22-409d-94cc-a99b9bd52a19'), -- The Nightmare Before Christmas
  ('2026-08-18', 'proverb', '6f6d6bdf-93a9-40f2-9dd5-22e168e450f1'), -- An apple a day keeps the doctor away
  ('2026-08-18', 'song', '4222701a-d79a-4ff4-aa53-afc882ffb7cd'), -- What a Wonderful World
  ('2026-08-18', 'book', '0cf78d8a-7ee4-4a72-a447-c1f160be4de8'), -- Anne of Green Gables
  ('2026-08-19', 'movie', '659d11f8-c54a-4bb6-a72b-d3caba76ab28'), -- The Tree of Life
  ('2026-08-19', 'proverb', '30d58221-f578-4cbc-af62-324a9a3875ab'), -- Practice makes perfect
  ('2026-08-19', 'song', 'c8cf3aa1-6b53-4934-af18-5723c0bc68cb'), -- Dancing in the Dark
  ('2026-08-19', 'book', 'cc7bb833-067c-4f94-bf15-276732d41ffb'), -- All Quiet on the Western Front
  ('2026-08-20', 'movie', 'e2b3043b-1e4c-495b-95bd-432e94e18d7d'), -- Close Encounters of the Third Kind
  ('2026-08-20', 'proverb', '8b711db9-30cc-4d76-babd-dd3590b0f174'), -- There is no smoke without fire
  ('2026-08-20', 'song', 'e9d3da0b-cfaf-44dd-bcd6-60f796e71464'), -- Stand By Your Man
  ('2026-08-20', 'book', 'e3d0c834-9638-4942-8b94-23f654e816bc'), -- The Da Vinci Code
  ('2026-08-21', 'movie', 'f2da7fe1-9139-4223-8be2-bfc07f2ccd11'), -- It''s a Wonderful Life
  ('2026-08-21', 'proverb', '0b993cbb-5186-4bc2-b24a-feb3ffa69d06'), -- Dead men tell no tales
  ('2026-08-21', 'song', '30d41411-8dc8-48b9-bac5-e89d4546bb69'), -- Livin'' on a Prayer
  ('2026-08-21', 'book', '14f713a7-b3f7-429a-a0e3-b930f1dfc3c6'), -- The Sun Also Rises
  ('2026-08-22', 'movie', '96335e5f-1381-42a5-8955-35219bc8e497'), -- The Devil Wears Prada
  ('2026-08-22', 'proverb', '87695996-f81d-473a-9f07-4209ca1b5a9b'), -- Better the devil you know than the devil you don''t
  ('2026-08-22', 'song', '88648214-9d4e-4678-b3f0-1b2a2d8a67e9'), -- All You Need Is Love
  ('2026-08-22', 'book', '4fcd6b69-caed-44fe-bc7f-dbdb1263a9a4'), -- Where the Red Fern Grows
  ('2026-08-23', 'movie', 'de74e12a-f173-4509-8cb1-65a38d009efc'), -- The Rocky Horror Picture Show
  ('2026-08-23', 'proverb', '45e377e1-ea0b-49f7-a6a9-9a22d52c1fda'), -- Absence makes the heart grow fonder
  ('2026-08-23', 'song', '5d0398d4-e1dd-4644-bcc2-eb830e2ba6f7'), -- All Along the Watchtower
  ('2026-08-23', 'book', '67b3aec1-2750-40e6-b31c-5f61ee2c4179'), -- Journey to the Center of the Earth
  ('2026-08-24', 'movie', '5f3b8fbd-260e-403f-b4c4-cab119ad0fed'), -- Gangs of New York
  ('2026-08-24', 'proverb', '3858942d-418d-42cd-9014-472e9c647b3e'), -- First come, first served
  ('2026-08-24', 'song', '3385ed15-3f24-4643-b24a-4f066a54d122'), -- Every Breath You Take
  ('2026-08-24', 'book', '2cd2c753-78ab-4e9a-af01-58788e208461'), -- The Picture of Dorian Gray
  ('2026-08-25', 'movie', 'd5631f48-0498-4579-a54d-f8757a62e969'), -- The Sound of Music
  ('2026-08-25', 'proverb', 'e12c672c-eb9d-4699-8f6e-3a2f3e9e7d08'), -- No news is good news
  ('2026-08-25', 'song', '2c2570fd-f1f8-435f-8db2-f49d561c879f'), -- Let''s Get It On
  ('2026-08-25', 'book', '14711a7f-1ff9-4458-adc7-d99f6c17f7f8'), -- The Perks of Being a Wallflower
  ('2026-08-26', 'movie', '4d72dd9e-da59-44c2-9171-9b3ffad68e96'), -- The Wizard of Oz
  ('2026-08-26', 'proverb', '5ce43319-b4a4-4355-bc52-8ecf089731c7'), -- Let sleeping dogs lie
  ('2026-08-26', 'song', '3e953845-9ccc-4be9-ada8-fc406ca39c80'), -- Baby One More Time
  ('2026-08-26', 'book', '7bec8e94-fb5e-4656-b046-f11143a5990f'), -- The Call of the Wild
  ('2026-08-27', 'movie', 'ee8c3a54-2911-4182-8a45-c2bbe4bed871'), -- Lord of the Flies
  ('2026-08-27', 'proverb', 'e104497e-940a-4044-ae88-5d97e1cd908e'), -- Better safe than sorry
  ('2026-08-27', 'song', 'c6140804-8bbb-48ef-8dc0-bacfb09c6459'), -- Smells Like Teen Spirit
  ('2026-08-27', 'book', 'f87d8307-98e6-4033-8bda-15abd369e297'), -- The Count of Monte Cristo
  ('2026-08-28', 'movie', 'aac8362a-fbf9-4505-bc07-1d8c05e814b1'), -- As Good as It Gets
  ('2026-08-28', 'proverb', 'd8f5efac-b036-4120-baf8-0df2605cfa10'), -- Never look a gift horse in the mouth
  ('2026-08-28', 'song', 'b2463f79-88c8-4813-b648-dcca0103b283'), -- Welcome to the Jungle
  ('2026-08-28', 'book', '9e17a226-51bf-4719-887b-74e1b70a2575'), -- The Girl on the Train
  ('2026-08-29', 'movie', '998744cb-0cf5-4b5a-afa9-bda8a846a37f'), -- How to Train Your Dragon
  ('2026-08-29', 'proverb', '233f43fa-cf89-4abd-a37b-f9087e823d35'), -- Strike while the iron is hot
  ('2026-08-29', 'song', '4b0fe610-6f7d-4540-9d2d-7921ba1508ee'), -- Take Me Home, Country Roads
  ('2026-08-29', 'book', 'd98ddf72-b65e-415f-9e2e-710bb4e8df9d'), -- Of Mice and Men
  ('2026-08-30', 'movie', '5c0f7a84-5d38-46b5-ba82-db269310c30c'), -- Four Weddings and a Funeral
  ('2026-08-30', 'proverb', '315f4b9a-082c-4855-8cfa-f9892e0df69a'), -- Every man has his price
  ('2026-08-30', 'song', 'e3fbf71f-787c-41ee-b16a-9b5ad8f1c0bf'), -- Sympathy for the Devil
  ('2026-08-30', 'book', 'ac3fca92-f2eb-4a2e-80bc-8c39e8041a99'), -- The Remains of the Day
  ('2026-08-31', 'movie', '61abcf3c-edbf-4d54-83d0-bba40da32feb'), -- Butch Cassidy and the Sundance Kid
  ('2026-08-31', 'proverb', '95dfbd84-92c5-4f16-b6de-da66737d882c'), -- When in Rome, do as the Romans do
  ('2026-08-31', 'song', 'd4bb059d-b7dd-4d6a-9999-009a6f45fd8c'), -- With Or Without You
  ('2026-08-31', 'book', 'ecf7d221-6a2f-4898-91c8-8db3a7f00203'), -- The Sound and the Fury
  ('2026-09-01', 'movie', '3105646f-c34d-4056-8601-633c5dbeabd0'), -- Escape from New York
  ('2026-09-01', 'proverb', '49c15cd5-1a3b-478e-bacb-d90ca82a9899'), -- Take care of the pennies and the pounds will take care of themselves
  ('2026-09-01', 'song', '6af9b6a5-9c35-4525-aa90-a5c4ec6f80a4'), -- Man in the Mirror
  ('2026-09-01', 'book', '4fc2cc98-aeec-49f9-b08b-a81409a70195'), -- The Silence of the Lambs
  ('2026-09-02', 'movie', '66d9bdc1-a4de-42ba-ab1a-fa95666d73d9'), -- No Country for Old Men
  ('2026-09-02', 'proverb', 'cd02341f-ae9b-4f7f-8ce2-5703a736701b'), -- Cleanliness is next to godliness
  ('2026-09-02', 'song', '64856f90-43f9-4e89-8a53-45e486b85605'), -- You Really Got Me
  ('2026-09-02', 'book', '2d7230d8-188c-4e62-82f5-fd5e4fde26f4'), -- A Tale of Two Cities
  ('2026-09-03', 'movie', '4235900a-bfdd-4fed-99ff-fe0f62505c33'), -- There Will Be Blood
  ('2026-09-03', 'proverb', '9917f515-b387-4212-9da5-97e635700a14'), -- Fortune favours the bold
  ('2026-09-03', 'song', 'b8fa91b9-fd98-4be9-acb3-5d6707594a6b'), -- Georgia on My Mind
  ('2026-09-03', 'book', '006d2113-b07b-4fa9-8006-e3f41e6b4321'), -- The Things They Carried
  ('2026-09-04', 'movie', '82883126-404b-445c-afe6-d5b163125267'), -- The Shape of Water
  ('2026-09-04', 'proverb', '8bce7880-66b8-4b90-84a6-a871971f6abf'), -- There is honour among thieves
  ('2026-09-04', 'song', 'c3f08b90-3d57-45c1-bffb-ca98d7e48024'), -- I Can''t Help Myself
  ('2026-09-04', 'book', '1d789466-7e0c-408e-9b44-4bd0a32164f7'), -- The Devil Wears Prada
  ('2026-09-05', 'movie', '630ddc21-31ec-40f0-a4bc-d0cfd98142c5'), -- Empire of the Sun
  ('2026-09-05', 'proverb', '8d09dd9c-5b05-4fc2-84d1-14f1dfab956f'), -- A miss is as good as a mile
  ('2026-09-05', 'song', 'ea3e4488-e0cf-45c7-a709-0620cc6267d2'), -- Papa''s Got A Brand New Bag
  ('2026-09-05', 'book', 'd01746fa-1d65-4954-ae4a-e4f05c432cf2') -- The Art of War
on conflict (puzzle_date, category) do nothing;
