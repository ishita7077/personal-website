/**
 * Interview Room — Haas MBA interview config and question bank
 */
(function (global) {
  const IR = global.IR || (global.IR = {});
  IR.config = {
    'haas-mba': {
      id: 'haas-mba',
      school: 'UC Berkeley Haas',
      program: 'Full-Time MBA',
      totalQuestions: 6,
      fixedSlots: [0, 1, 4],
      randomSlots: [2, 3, 5],
      prepTime: 45,
      answerTime: 180,
      enabled: true
    }
  };
  IR.questions = {
    'haas-mba': {
      fixed: [
        { id: 'H-F1', slot: 0, text: 'What do you hope to accomplish out of your business school experience, and why is Haas the right place for this?', tags: ['goals', 'why-haas'], pillar: null },
        { id: 'H-F2', slot: 1, text: 'Describe an experience in diversity, equity, and inclusion — whether in the workplace or at a community organization — that will enhance your contribution to the Haas community.', tags: ['dei', 'values'], pillar: 'Beyond Yourself' },
        { id: 'H-F3', slot: 4, text: 'Is there anything else you would like to add that has not been covered already?', tags: ['open-ended', 'closing'], pillar: null }
      ],
      pool: [
        { id: 'H-B01', text: 'Tell me about a time you led a team through a challenging situation. What was the outcome?', tags: ['leadership'], pillar: 'Confidence Without Attitude' },
        { id: 'H-B02', text: 'Describe a time you influenced an outcome through trust and collaboration rather than authority.', tags: ['collaboration'], pillar: 'Confidence Without Attitude' },
        { id: 'H-B03', text: 'Tell me about a time you had to convince a team or individual to change direction on an important decision.', tags: ['influence'], pillar: 'Question the Status Quo' },
        { id: 'H-B04', text: 'Describe a situation where you built trust among colleagues and what you learned from the process.', tags: ['trust'], pillar: 'Confidence Without Attitude' },
        { id: 'H-B05', text: 'Tell me about a time you helped your team focus on a goal when things were getting off track.', tags: ['leadership'], pillar: 'Students Always' },
        { id: 'H-B06', text: 'Describe a time you had to encourage colleagues to step outside their defined job roles to accomplish something.', tags: ['influence'], pillar: 'Question the Status Quo' },
        { id: 'H-B07', text: 'Tell me about a time you failed at work. What happened and what did you learn?', tags: ['failure', 'growth'], pillar: 'Students Always' },
        { id: 'H-B08', text: 'Describe a time you received critical feedback. How did you react, and what changed?', tags: ['feedback'], pillar: 'Students Always' },
        { id: 'H-B09', text: 'Tell me about a time you were proven wrong. How did you handle it?', tags: ['humility'], pillar: 'Confidence Without Attitude' },
        { id: 'H-B10', text: 'Tell me about a time you had to work on a complicated project and team morale was low. What did you do?', tags: ['challenge'], pillar: 'Beyond Yourself' },
        { id: 'H-B11', text: 'Describe a time you had to reconcile a disagreement between you and a colleague. What was the result?', tags: ['conflict'], pillar: 'Confidence Without Attitude' },
        { id: 'H-B12', text: 'Tell me about a time you had to manage a difficult relationship with a supervisor. How did you navigate it?', tags: ['conflict'], pillar: 'Confidence Without Attitude' },
        { id: 'H-B13', text: 'Tell me about a time you championed a creative initiative in the workplace. What was your thought process?', tags: ['innovation'], pillar: 'Question the Status Quo' },
        { id: 'H-B14', text: 'Describe a professional risk you took. Did it work out? What did you take away from the experience?', tags: ['risk'], pillar: 'Question the Status Quo' },
        { id: 'H-B15', text: 'Tell me about a time you questioned the established way of doing something and proposed a better approach.', tags: ['innovation'], pillar: 'Question the Status Quo' },
        { id: 'H-B16', text: 'Describe a time you identified an opportunity that others had missed. What did you do about it?', tags: ['initiative'], pillar: 'Question the Status Quo' },
        { id: 'H-B17', text: 'Tell me about how you have promoted diversity and inclusion in your career or community.', tags: ['dei'], pillar: 'Beyond Yourself' },
        { id: 'H-B18', text: 'Describe a time you worked closely with someone very different from you. What did you learn?', tags: ['dei'], pillar: 'Beyond Yourself' },
        { id: 'H-B19', text: 'How do you embody the principle of putting others before yourself in your professional and personal life?', tags: ['values'], pillar: 'Beyond Yourself' },
        { id: 'H-B20', text: 'Tell me about a time you put the needs of a team or community above your own interests.', tags: ['values'], pillar: 'Beyond Yourself' },
        { id: 'H-B21', text: 'What does confidence without arrogance mean to you? Share an example from your experience.', tags: ['values'], pillar: 'Confidence Without Attitude' },
        { id: 'H-B22', text: 'Tell me about a time you sought out a perspective very different from your own. What did it change?', tags: ['learning'], pillar: 'Students Always' },
        { id: 'H-B23', text: 'Tell me about a time you had to make a decision with incomplete information. How did you approach it?', tags: ['decision-making'], pillar: 'Question the Status Quo' },
        { id: 'H-B24', text: 'Describe a situation where you faced an ethical dilemma at work. What did you do?', tags: ['ethics'], pillar: 'Beyond Yourself' },
        { id: 'H-B25', text: 'Tell me about a time you influenced a team without having formal authority over them.', tags: ['influence'], pillar: 'Confidence Without Attitude' },
        { id: 'H-B26', text: 'What is your leadership style? Give an example of when it was particularly effective.', tags: ['leadership'], pillar: 'Confidence Without Attitude' },
        { id: 'H-B27', text: 'If you could change one thing about your industry or professional field, what would it be and why?', tags: ['vision'], pillar: 'Question the Status Quo' },
        { id: 'H-B28', text: 'Tell me about a time you had to adapt quickly to a significant change at work. How did you handle it?', tags: ['adaptability'], pillar: 'Students Always' },
        { id: 'H-B29', text: 'Describe a time you mentored or coached someone. What was the impact?', tags: ['mentorship'], pillar: 'Beyond Yourself' },
        { id: 'H-B30', text: 'Tell me about your most meaningful accomplishment outside of work.', tags: ['personal'], pillar: 'Beyond Yourself' }
      ]
    }
  };
})(typeof window !== 'undefined' ? window : this);
