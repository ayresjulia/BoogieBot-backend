-- both test users have the password "password"

INSERT INTO users (username, password, first_name, last_name, email, profile_url, is_admin)
VALUES ('testuser',
        '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q',
        'Test',
        'User',
        'joel@joelburton.com',
        'https://supersimple.com/wp-content/uploads/peek-a-boo-800-800-200x200.jpg',
        FALSE),
       ('testadmin',
        '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q',
        'Test',
        'Admin!',
        'joel@joelburton.com',
        'https://cn.i.cdn.ti-platform.com/content/914/showpage/we-bare-bears/za/webarebears-200x200.png',
        TRUE);

INSERT INTO events (title, description, event_date, event_time, city, state, country, img_url, host_username)
VALUES ('Wedding Test', 'Julia and Ryan Ayres Wedding day!', '2022-06-08', '06:00 PM', 'New York', 'NY', 'US', 'https://images.unsplash.com/photo-1532117182044-031e7cd916ee?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', 'testuser'),
       ('Birthday Test', 'Come to celebrate Coco birthday with us!!','2022-06-08', '11:00 AM', 'Austin', 'TX', 'US', 'https://images.unsplash.com/photo-1532117182044-031e7cd916ee?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', 'testadmin');
