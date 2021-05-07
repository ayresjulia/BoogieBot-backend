-- both test users have the password "password"

INSERT INTO users (username, password, first_name, last_name, email, is_admin)
VALUES ('testuser',
        '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q',
        'Test',
        'User',
        'joel@joelburton.com',
        FALSE),
       ('testadmin',
        '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q',
        'Test',
        'Admin!',
        'joel@joelburton.com',
        TRUE);

INSERT INTO events (title, description, event_date, event_time, city, state, country)
VALUES ('Wedding Test', 'Julia and Ryan Ayres Wedding day!', '2022-06-08', '06:00 PM', 'New York', 'NY', 'US'),
       ('Birthday Test', 'Come to celebrate Coco birthday with us!!','2022-06-08', '11:00 AM', 'Austin', 'TX', 'US')

