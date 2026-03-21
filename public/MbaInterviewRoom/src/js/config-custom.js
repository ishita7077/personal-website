/**
 * MBA Interview Room — default timings for custom practice (no server bundle).
 */
(function (global) {
  const IR = global.IR || (global.IR = {});
  IR.config = IR.config || {};
  IR.config["custom-practice"] = {
    id: "custom-practice",
    school: "Custom practice",
    program: "MBA",
    totalQuestions: 6,
    prepTime: 45,
    answerTime: 180,
    enabled: true,
  };
})(typeof window !== "undefined" ? window : this);
