\echo 'Delete and recreate boogiebot db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE boogiebot;
CREATE DATABASE boogiebot;
\connect boogiebot

\i boogiebot-schema.sql
\i boogiebot-seed.sql

\echo 'Delete and recreate boogiebot_test db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE boogiebot_test;
CREATE DATABASE boogiebot_test;
\connect boogiebot_test

\i boogiebot-schema.sql
