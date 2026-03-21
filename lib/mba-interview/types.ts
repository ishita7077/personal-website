export type AnswerExpectedMap = {
  questionGoal?: string;
  corePoints: string[];
  niceToHave?: string[];
  redFlags?: string[];
  examplesOfGoodDirection?: string[];
};

export type HandoffBasis = Record<string, unknown>;

export type DatasetQuestion = {
  id: string;
  interview_phase: string;
  text: string;
  question_type: string;
  high_probability: boolean;
  evidence_types: string[];
  evaluation_dimensions: string[];
  handoff_basis?: HandoffBasis;
  expected_answer_map: AnswerExpectedMap;
  /** Per-prompt prep/answer when different from school default (from handoff structural components). */
  prep_time_seconds?: number;
  answer_time_seconds?: number;
};

export type QuestionBankFile = {
  version: number;
  school_id: string;
  question_count: number;
  questions: DatasetQuestion[];
};

export type SchoolMetaFile = {
  school_id: string;
  display_name: string;
  validated_interview_format: string;
  unique_elements: string;
  interviewer_type: string;
  community_texture: string;
  handoff_paths: Record<string, string>;
  secondary_source_urls: string[];
  community_source_urls: string[];
};

/** Per-school copy for home cards + docs (from build script + handoff meta). */
export type SchoolRegistryListing = {
  interview_style_summary: string;
  unique_hook: string;
  interviewer_profile: string;
  practice_mechanics: string;
  question_bank_count: number;
  pick_mode: string;
};

export type SchoolRegistryFile = {
  version: number;
  schools: Array<{
    id: string;
    display_name: string;
    data_dir: string;
    listing: SchoolRegistryListing;
  }>;
};

export type EvidenceMapFile = {
  version: number;
  questions: Record<
    string,
    {
      evidence_types: string[];
      evaluation_dimensions: string[];
      interview_phase: string;
      handoff_basis: HandoffBasis;
    }
  >;
  taxonomy_notes?: string;
};
