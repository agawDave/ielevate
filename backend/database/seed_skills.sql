USE ielevate_db;

INSERT INTO skill_categories (name, slug) VALUES
  ('Programming & Tech', 'programming-tech'),
  ('Languages', 'languages'),
  ('Music', 'music'),
  ('Art & Design', 'art-design'),
  ('Business & Career', 'business-career'),
  ('Academic Tutoring', 'academic-tutoring'),
  ('Fitness & Wellness', 'fitness-wellness'),
  ('Trades & DIY', 'trades-diy');

INSERT INTO skills (category_id, name, slug) VALUES
  ((SELECT id FROM skill_categories WHERE slug='programming-tech'), 'JavaScript', 'javascript'),
  ((SELECT id FROM skill_categories WHERE slug='programming-tech'), 'Python', 'python'),
  ((SELECT id FROM skill_categories WHERE slug='programming-tech'), 'Web Development', 'web-development'),
  ((SELECT id FROM skill_categories WHERE slug='programming-tech'), 'Data Analysis', 'data-analysis'),
  ((SELECT id FROM skill_categories WHERE slug='programming-tech'), 'Graphic Design Software', 'graphic-design-software'),

  ((SELECT id FROM skill_categories WHERE slug='languages'), 'Spanish', 'spanish'),
  ((SELECT id FROM skill_categories WHERE slug='languages'), 'French', 'french'),
  ((SELECT id FROM skill_categories WHERE slug='languages'), 'Mandarin Chinese', 'mandarin-chinese'),
  ((SELECT id FROM skill_categories WHERE slug='languages'), 'English (ESL)', 'english-esl'),
  ((SELECT id FROM skill_categories WHERE slug='languages'), 'Sign Language (ASL)', 'sign-language-asl'),

  ((SELECT id FROM skill_categories WHERE slug='music'), 'Guitar', 'guitar'),
  ((SELECT id FROM skill_categories WHERE slug='music'), 'Piano', 'piano'),
  ((SELECT id FROM skill_categories WHERE slug='music'), 'Singing', 'singing'),
  ((SELECT id FROM skill_categories WHERE slug='music'), 'Music Theory', 'music-theory'),
  ((SELECT id FROM skill_categories WHERE slug='music'), 'Music Production', 'music-production'),

  ((SELECT id FROM skill_categories WHERE slug='art-design'), 'Drawing', 'drawing'),
  ((SELECT id FROM skill_categories WHERE slug='art-design'), 'Painting', 'painting'),
  ((SELECT id FROM skill_categories WHERE slug='art-design'), 'Photography', 'photography'),
  ((SELECT id FROM skill_categories WHERE slug='art-design'), 'Video Editing', 'video-editing'),
  ((SELECT id FROM skill_categories WHERE slug='art-design'), 'UI/UX Design', 'ui-ux-design'),

  ((SELECT id FROM skill_categories WHERE slug='business-career'), 'Public Speaking', 'public-speaking'),
  ((SELECT id FROM skill_categories WHERE slug='business-career'), 'Resume Writing', 'resume-writing'),
  ((SELECT id FROM skill_categories WHERE slug='business-career'), 'Marketing', 'marketing'),
  ((SELECT id FROM skill_categories WHERE slug='business-career'), 'Excel / Spreadsheets', 'excel-spreadsheets'),
  ((SELECT id FROM skill_categories WHERE slug='business-career'), 'Project Management', 'project-management'),

  ((SELECT id FROM skill_categories WHERE slug='academic-tutoring'), 'Algebra', 'algebra'),
  ((SELECT id FROM skill_categories WHERE slug='academic-tutoring'), 'Calculus', 'calculus'),
  ((SELECT id FROM skill_categories WHERE slug='academic-tutoring'), 'Chemistry', 'chemistry'),
  ((SELECT id FROM skill_categories WHERE slug='academic-tutoring'), 'Essay Writing', 'essay-writing'),
  ((SELECT id FROM skill_categories WHERE slug='academic-tutoring'), 'Study Skills', 'study-skills'),

  ((SELECT id FROM skill_categories WHERE slug='fitness-wellness'), 'Yoga', 'yoga'),
  ((SELECT id FROM skill_categories WHERE slug='fitness-wellness'), 'Strength Training', 'strength-training'),
  ((SELECT id FROM skill_categories WHERE slug='fitness-wellness'), 'Nutrition Basics', 'nutrition-basics'),
  ((SELECT id FROM skill_categories WHERE slug='fitness-wellness'), 'Meditation', 'meditation'),

  ((SELECT id FROM skill_categories WHERE slug='trades-diy'), 'Woodworking', 'woodworking'),
  ((SELECT id FROM skill_categories WHERE slug='trades-diy'), 'Home Electrical Basics', 'home-electrical-basics'),
  ((SELECT id FROM skill_categories WHERE slug='trades-diy'), 'Cooking', 'cooking'),
  ((SELECT id FROM skill_categories WHERE slug='trades-diy'), 'Gardening', 'gardening');
