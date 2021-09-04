CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE "user" (
  "id" SERIAL PRIMARY KEY,
  "uuid" uuid DEFAULT uuid_generate_v4 (),
  "full_name" varchar,
  "email" varchar,
  "password" varchar,
  "created_at" timestamptz DEFAULT (now()),
  "updated_at" timestamptz DEFAULT (now()),
  "settings" jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE "journal" (
  "id" SERIAL PRIMARY KEY,
  "uuid" uuid DEFAULT uuid_generate_v4 (),
  "user_id" int NOT NULL,
  "entry_date" timestamptz,
  "entry" text,
  "created_at" timestamptz DEFAULT (now()),
  "updated_at" timestamptz DEFAULT (now())
);

CREATE TABLE "chore" (
  "id" SERIAL PRIMARY KEY,
  "uuid" uuid DEFAULT uuid_generate_v4 (),
  "user_id" int NOT NULL,
  "enabled" boolean DEFAULT true,
  "name" varchar,
  "description" text,
  "frequency" text,
  "location" text,
  "reason" text,
  "scheduled_at" timestamptz DEFAULT (now()),
  "timezone" text,
  "has_time" boolean DEFAULT false,
  "created_at" timestamptz DEFAULT (now()),
  "updated_at" timestamptz DEFAULT (now())
);

CREATE TABLE "event" (
  "id" SERIAL PRIMARY KEY,
  "uuid" uuid DEFAULT uuid_generate_v4 (),
  "chore_id" int NOT NULL,
  "location" text,
  "status" varchar,
  "notes" text,
  "timezone" text,
  "created_at" timestamptz DEFAULT (now()),
  "updated_at" timestamptz DEFAULT (now()),
  "started_at" timestamptz,
  "completed_at" timestamptz,
  "completed_by"  int NOT NULL
);

CREATE TABLE "tag" (
  "id" SERIAL PRIMARY KEY,
  "user_id" int NOT NULL,
  "enabled" boolean DEFAULT true,
  "uuid" uuid DEFAULT uuid_generate_v4 (),
  "name" varchar,
  "description" text,
  "created_at" timestamptz DEFAULT (now()),
  "updated_at" timestamptz DEFAULT (now())
);

CREATE TABLE chore_tag(
  chore_id int REFERENCES chore(id) ON UPDATE CASCADE ON DELETE CASCADE,
  tag_id int REFERENCES tag(id) ON UPDATE CASCADE,
  CONSTRAINT chore_tag_pkey PRIMARY KEY (chore_id, tag_id)
);

ALTER TABLE "chore" ADD FOREIGN KEY ("user_id") REFERENCES "user" ("id");
ALTER TABLE "event" ADD FOREIGN KEY ("chore_id") REFERENCES "chore" ("id");
ALTER TABLE "event" ADD FOREIGN KEY ("completed_by") REFERENCES "user" ("id");
ALTER TABLE "tag" ADD FOREIGN KEY ("user_id") REFERENCES "user" ("id");

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_user_updated_at
BEFORE UPDATE ON "user" FOR EACH ROW
EXECUTE PROCEDURE  set_updated_at();


CREATE TRIGGER trigger_chore_updated_at
BEFORE UPDATE ON "chore" FOR EACH ROW
EXECUTE PROCEDURE  set_updated_at();

CREATE TRIGGER trigger_event_updated_at
BEFORE UPDATE ON "event" FOR EACH ROW
EXECUTE PROCEDURE  set_updated_at();

CREATE TRIGGER trigger_event_updated_at
BEFORE UPDATE ON "tag" FOR EACH ROW
EXECUTE PROCEDURE  set_updated_at();

CREATE INDEX index_event_status
ON "event" (status);

INSERT INTO "user" as u (full_name, email, password)
VALUES ('Elise Straub', 'elisecode247@gmail.com', 'password');

INSERT INTO "chore" as c (user_id, name, description, frequency)
VALUES (
  1,
  'Give Maggie her flea meds',
  'She takes it with a treat. Give with food.',
  '{"repeatType":"month","repeatAmount":1,"repeatSubtype":"first"}'
  );

INSERT INTO "tag" as t (user_id, name, description)
VALUES
  (1, 'Maggie', ''),
  (1, 'Finnley', ''),
  (1, 'David', ''),
  (1, 'Dogs', 'for all dogs'),
  (1, 'cleaning', ''),
  (1, 'shopping', ''),
  (1, 'cooking', ''),
  (1, 'medical', '');

INSERT INTO "chore_tag" as ct (chore_id, tag_id)
VALUES (1, 1);

INSERT INTO "event" as e (chore_id, status, completed_by, completed_at)
VALUES (1, 'done', 1, now());
