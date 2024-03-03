-- 'test_traces' --

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(2000) NOT NULL,
  password VARCHAR(2000) NOT NULL,
  email VARCHAR(2000) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  clearance INTEGER NOT NULL
);

CREATE TABLE evidence (
  id SERIAL PRIMARY KEY,
  location VARCHAR(1000) NOT NULL DEFAULT 'Minneapolis',
  title TEXT NOT NULL,
  notes TEXT,
  file_url VARCHAR(2000),
  date_posted TIMESTAMP NOT NULL DEFAULT NOW(),
  user_id INTEGER REFERENCES users(id),
  clearance VARCHAR(6) NOT NULL DEFAULT 'secret',
  media_type VARCHAR(100) NOT NULL
);

INSERT INTO "users" ("username", "password", "email", "phone_number", "clearance")
VALUES
('gavo', '1234', 'gavinpopkenart@gmail.com', '641-243-0051', 1);

INSERT INTO "evidence" ("title", "user_id", "media_type")
VALUES ('My day at the beach', 2, 'text');