
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    password VARCHAR(255),
    role VARCHAR(20) DEFAULT 'user'
);
SELECT * FROM users;

UPDATE users
SET role='admin'
WHERE email='thenuu@gmail.com';

CREATE TABLE files (
 id SERIAL PRIMARY KEY,
 filename VARCHAR(255),
 filesize BIGINT
);

ALTER TABLE files
ADD COLUMN userid INTEGER REFERENCES users(id);

ALTER TABLE files
ADD COLUMN folder_id INTEGER REFERENCES folders(id);

ALTER TABLE files
ADD COLUMN filetype VARCHAR(50);

ALTER TABLE files
ADD COLUMN uploaded_at TIMESTAMP
DEFAULT CURRENT_TIMESTAMP;

SELECT * FROM files;

CREATE TABLE folders (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL
);
ALTER TABLE folders
ADD COLUMN parent_id INT REFERENCES folders(id);

SELECT * FROM folders;








		  
		  
