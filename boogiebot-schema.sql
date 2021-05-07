CREATE TABLE users (
  username VARCHAR(25) PRIMARY KEY,
  password TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL
    CHECK (position('@' IN email) > 1),
  profile_url TEXT NOT NULL DEFAULT 'https://supersimple.com/wp-content/uploads/peek-a-boo-800-800-200x200.jpg',
  is_admin BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  event_date TEXT NOT NULL,
  event_time TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT,
  country TEXT NOT NULL
);

CREATE TABLE hosts (
  username VARCHAR(25)
    REFERENCES users ON DELETE CASCADE,
  event_id INTEGER
    REFERENCES events ON DELETE CASCADE,
  PRIMARY KEY (username, event_id)
);