-- Reset user mode to NULL so they can select their mode
-- Run this in your database (Neon console or psql)

UPDATE users
SET mode = NULL
WHERE email = 'tu_email_de_google@gmail.com';

-- Check the result
SELECT id, email, name, mode FROM users;
