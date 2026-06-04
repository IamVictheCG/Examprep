-- ─── Profiles ────────────────────────────────────────────────────────────────

create table profiles (
  id             uuid primary key references auth.users on delete cascade,
  full_name      text not null,
  avatar_url     text,
  streak_count   integer not null default 0,
  streak_last_date date,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ─── Exams ────────────────────────────────────────────────────────────────────

create table exams (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  name          text not null,
  field         text not null,
  icon          text not null,
  status        text not null check (status in ('live', 'coming_soon')),
  description   text,
  price_monthly integer not null default 0,
  created_at    timestamptz not null default now()
);

-- ─── Topics ──────────────────────────────────────────────────────────────────

create table topics (
  id          uuid primary key default gen_random_uuid(),
  exam_id     uuid not null references exams on delete cascade,
  name        text not null,
  order_index integer not null default 0,
  created_at  timestamptz not null default now()
);

-- ─── Questions ───────────────────────────────────────────────────────────────

create table questions (
  id                  uuid primary key default gen_random_uuid(),
  exam_id             uuid not null references exams on delete cascade,
  topic_id            uuid references topics on delete set null,
  question_text       text not null,
  question_type       text not null check (question_type in ('mcq', 'theory')),
  options             jsonb,
  correct_option_id   text,
  correct_answer_text text,
  explanation         text not null,
  difficulty          text not null check (difficulty in ('easy', 'medium', 'hard')),
  year                integer,
  source              text,
  created_at          timestamptz not null default now()
);

-- ─── Subscriptions ───────────────────────────────────────────────────────────

create table subscriptions (
  id                        uuid primary key default gen_random_uuid(),
  user_id                   uuid not null references profiles on delete cascade,
  exam_id                   uuid not null references exams on delete cascade,
  status                    text not null check (status in ('active', 'cancelled', 'expired')),
  paystack_subscription_code text,
  start_date                timestamptz not null,
  end_date                  timestamptz not null,
  created_at                timestamptz not null default now()
);

-- ─── Mock test sessions ───────────────────────────────────────────────────────

create table mock_test_sessions (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references profiles on delete cascade,
  exam_id          uuid not null references exams on delete cascade,
  questions        jsonb not null default '[]',
  answers          jsonb not null default '{}',
  score            integer not null default 0,
  duration_seconds integer not null default 0,
  completed        boolean not null default false,
  started_at       timestamptz not null default now(),
  completed_at     timestamptz
);

-- ─── Flashcard sessions ───────────────────────────────────────────────────────

create table flashcard_sessions (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references profiles on delete cascade,
  exam_id            uuid not null references exams on delete cascade,
  topic_id           uuid references topics on delete set null,
  cards_reviewed     integer not null default 0,
  got_it_count       integer not null default 0,
  review_again_count integer not null default 0,
  created_at         timestamptz not null default now()
);

-- ─── Topic performance ────────────────────────────────────────────────────────

create table topic_performance (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references profiles on delete cascade,
  exam_id           uuid not null references exams on delete cascade,
  topic_id          uuid not null references topics on delete cascade,
  total_attempted   integer not null default 0,
  total_correct     integer not null default 0,
  last_updated      timestamptz not null default now(),
  unique (user_id, exam_id, topic_id)
);

-- ─── Bookmarked questions ─────────────────────────────────────────────────────

create table bookmarked_questions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles on delete cascade,
  question_id uuid not null references questions on delete cascade,
  created_at  timestamptz not null default now(),
  unique (user_id, question_id)
);

-- ─── AI tutor sessions ────────────────────────────────────────────────────────

create table ai_tutor_sessions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references profiles on delete cascade,
  exam_id    uuid not null references exams on delete cascade,
  messages   jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════════════════════════

alter table profiles             enable row level security;
alter table exams                enable row level security;
alter table topics               enable row level security;
alter table questions            enable row level security;
alter table subscriptions        enable row level security;
alter table mock_test_sessions   enable row level security;
alter table flashcard_sessions   enable row level security;
alter table topic_performance    enable row level security;
alter table bookmarked_questions enable row level security;
alter table ai_tutor_sessions    enable row level security;

-- profiles
create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

-- exams (read-only for authenticated users)
create policy "Authenticated users can read exams"
  on exams for select to authenticated using (true);

-- topics (read-only for authenticated users)
create policy "Authenticated users can read topics"
  on topics for select to authenticated using (true);

-- questions (read-only for authenticated users)
create policy "Authenticated users can read questions"
  on questions for select to authenticated using (true);

-- subscriptions
create policy "Users can view own subscriptions"
  on subscriptions for select using (auth.uid() = user_id);
create policy "Users can insert own subscriptions"
  on subscriptions for insert with check (auth.uid() = user_id);

-- mock_test_sessions
create policy "Users can manage own mock test sessions"
  on mock_test_sessions for all using (auth.uid() = user_id);

-- flashcard_sessions
create policy "Users can manage own flashcard sessions"
  on flashcard_sessions for all using (auth.uid() = user_id);

-- topic_performance
create policy "Users can manage own topic performance"
  on topic_performance for all using (auth.uid() = user_id);

-- bookmarked_questions
create policy "Users can view own bookmarks"
  on bookmarked_questions for select using (auth.uid() = user_id);
create policy "Users can add bookmarks"
  on bookmarked_questions for insert with check (auth.uid() = user_id);
create policy "Users can delete own bookmarks"
  on bookmarked_questions for delete using (auth.uid() = user_id);

-- ai_tutor_sessions
create policy "Users can manage own AI tutor sessions"
  on ai_tutor_sessions for all using (auth.uid() = user_id);

-- ─── Updated_at trigger ───────────────────────────────────────────────────────

create or replace function handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on profiles
  for each row execute function handle_updated_at();

create trigger ai_tutor_sessions_updated_at
  before update on ai_tutor_sessions
  for each row execute function handle_updated_at();

-- ─── Auto-create profile on signup ───────────────────────────────────────────

create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'New User')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
