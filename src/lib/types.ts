// Minimal database types. Expand as needed.

export type Role = 'admin' | 'member';

export type User = {
  id: string;
  email: string;
  name: string;
  role: Role;
  initials: string | null;
  color: string | null;
  phone: string | null;
  signature: string | null;
  created_at: string;
};

export type Tier = 'tier_1' | 'tier_2' | 'tier_3' | 'nice_to_meet' | 'opportunistic' | 'retailer';
export type Track = 'entertainment_ip' | 'sports' | 'cpg_backflip' | 'japanese_ip' | 'retail' | 'agent' | 'competitor' | 'new_surfaced';
export type CoverageUnit = 'anchor_pair';export type Priority = 'highest' | 'high' | 'moderate' | 'low' | 'opportunistic';
export type TargetStatus = 'not_contacted' | 'outreach_sent' | 'meeting_booked' | 'met' | 'follow_up' | 'closed_won' | 'closed_lost' | 'dead';

export type Target = {
  id: string;
  company_name: string;
  tier: Tier;
  track: Track;
  coverage_unit: CoverageUnit;
  priority: Priority;
  booth_number: string | null;
  key_contacts: { name: string; title: string }[];
  proof_point: string | null;
  pitch_angle: string | null;
  opener: string | null;
  status: TargetStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type MeetingType = 'pre_booked' | 'walk_up' | 'keynote' | 'party' | 'internal_huddle' | 'travel' | 'dinner';
export type MeetingStatus = 'scheduled' | 'confirmed' | 'completed' | 'no_show' | 'cancelled';

export type Meeting = {
  id: string;
  title: string;
  target_id: string | null;
  start_at: string;
  end_at: string;
  location: string | null;
  type: MeetingType;
  status: MeetingStatus;
  owner_id: string | null;
  attendee_ids: string[];
  agenda: string | null;
  outcome: string | null;
  notes: string | null;
  next_action: string | null;
  created_by: string | null;
  live_status: 'on_time' | 'running_late' | 'wrapping_early' | null;
  live_status_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Temperature = 'cold' | 'warm' | 'hot';
export type FollowUpStage = 'not_started' | 't1_immediate_thanks' | 't2_value_add' | 't3_proposal';
export type Channel = 'email' | 'phone' | 'linkedin' | 'in_person';

export type Lead = {
  id: string;
  full_name: string;
  company: string;
  title: string | null;
  email: string | null;
  phone: string | null;
  linkedin_url: string | null;
  target_id: string | null;
  met_by_id: string | null;
  meeting_id: string | null;
  temperature: Temperature;
  owner_id: string | null;
  next_action: string | null;
  deadline: string | null;
  preferred_followup_channel: Channel | null;
  follow_up_stage: FollowUpStage;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type FollowUp = {
  id: string;
  lead_id: string;
  touch: 't1' | 't2' | 't3';
  channel: Channel;
  draft: string | null;
  sent_at: string | null;
  sent_by_id: string | null;
  response_received: boolean;
  response_notes: string | null;
  created_at: string;
};

export type IntelSubject = 'psa' | 'cgc' | 'beckett' | 'sgc' | 'panini' | 'collectors_holdings' | 'fanatics' | 'other';
export type IntelType = 'booth_observation' | 'overheard' | 'announced_deal' | 'pricing' | 'tech_demo' | 'rumor' | 'personnel';
export type Significance = 'low' | 'medium' | 'high';

export type Intel = {
  id: string;
  // EITHER target_id (links to a target in our list) OR tag (free text for
  // off-list companies / general observations) OR subject (legacy competitor bucket).
  // Any combination, or none, is valid.
  target_id: string | null;
  tag: string | null;
  subject: IntelSubject | null;
  type: IntelType;
  date_observed: string;
  captured_by_id: string | null;
  significance: Significance;
  headline: string;
  details: string | null;
  source: string | null;
  follow_up_needed: boolean;
  created_at: string;
  updated_at: string;
};

export type Debrief = {
  id: string;
  user_id: string;
  debrief_date: string;
  meetings_taken: string | null;
  booths_visited: string | null;
  contacts_captured: string | null;
  competitive_intel: string | null;
  surprises: string | null;
  open_follow_ups: string | null;
  one_thing_different: string | null;
  submitted_at: string;
};

export type MorningBrief = {
  id: string;
  brief_date: string;
  compiled_at: string;
  content_markdown: string;
  published: boolean;
};

export type Attachment = {
  id: string;
  lead_id: string | null;
  meeting_id: string | null;
  storage_path: string;
  mime_type: string;
  byte_size: number | null;
  width: number | null;
  height: number | null;
  note: string | null;
  uploaded_by: string | null;
  created_at: string;
  // Client-only, populated via createSignedUrl
  signed_url?: string;
};

