CREATE TABLE workouts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     TEXT NOT NULL,
  name        TEXT,
  started_at  TIMESTAMP,
  finished_at TIMESTAMP,
  notes       TEXT,
  created_at  TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE exercises (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE workout_exercises (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id  UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES exercises(id),
  "order"     INTEGER NOT NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE sets (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_exercise_id  UUID NOT NULL REFERENCES workout_exercises(id) ON DELETE CASCADE,
  set_number           INTEGER NOT NULL,
  reps                 INTEGER,
  weight               NUMERIC(6, 2),
  completed            BOOLEAN NOT NULL DEFAULT true,
  created_at           TIMESTAMP NOT NULL DEFAULT now()
);
