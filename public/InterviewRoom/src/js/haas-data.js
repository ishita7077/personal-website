/**
 * Interview Room — Haas question sets (from Haas Question Bank.md) and recommendation map (from Haas Question Bank - Final.csv).
 * Load one random set per session; show Haas recommendations in review card.
 * All 42 questions across the 7 sets have a matching recommendation (exact or substring match).
 */
(function (global) {
  const IR = global.IR || (global.IR = {});

  IR.haasQuestionSets = [
    // Set 1
    [
      { id: 'S1-Q1', text: 'Walk me through your career path and the decisions that led you to where you are today.' },
      { id: 'S1-Q2', text: 'Why do you want an MBA at this point in your career?' },
      { id: 'S1-Q3', text: 'Tell me about a time when you faced strong opposition to one of your ideas. What did you do?' },
      { id: 'S1-Q4', text: 'Describe a situation where you had to motivate a team when morale was low.' },
      { id: 'S1-Q5', text: 'What is the biggest transformation happening in your industry today?' },
      { id: 'S1-Q6', text: 'If admitted, how would you contribute to the Haas community?' }
    ],
    // Set 2
    [
      { id: 'S2-Q1', text: 'What are your short-term and long-term career goals?' },
      { id: 'S2-Q2', text: 'Why Berkeley Haas specifically?' },
      { id: 'S2-Q3', text: 'Tell me about a time when you were proven wrong in a professional debate. How did you react?' },
      { id: 'S2-Q4', text: 'Describe a time when you had to work on a project where you initially lacked familiarity with the topic.' },
      { id: 'S2-Q5', text: 'What is one professional accomplishment you are most proud of?' },
      { id: 'S2-Q6', text: "Which of Haas' four defining principles resonates most with you and why?" }
    ],
    // Set 3
    [
      { id: 'S3-Q1', text: 'What motivates your career decisions?' },
      { id: 'S3-Q2', text: 'Tell me about a time you demonstrated leadership without formal authority.' },
      { id: 'S3-Q3', text: 'Describe a conflict you had with a teammate and how you handled it.' },
      { id: 'S3-Q4', text: 'Tell me about a risk you took professionally. What happened?' },
      { id: 'S3-Q5', text: 'What clubs, initiatives, or activities would you engage with at Haas?' },
      { id: 'S3-Q6', text: 'What role do you typically play in teams?' }
    ],
    // Set 4
    [
      { id: 'S4-Q1', text: 'Why do you believe now is the right time for you to pursue an MBA?' },
      { id: 'S4-Q2', text: 'Tell me about the most challenging professional situation you have faced.' },
      { id: 'S4-Q3', text: 'Describe a time when you had to persuade someone to change their mind.' },
      { id: 'S4-Q4', text: 'What is something constructive feedback taught you about yourself?' },
      { id: 'S4-Q5', text: 'How have you built consensus among people with differing opinions?' },
      { id: 'S4-Q6', text: 'What impact do you want to have in your industry in the long term?' }
    ],
    // Set 5
    [
      { id: 'S5-Q1', text: 'What distinguishes you from other MBA applicants?' },
      { id: 'S5-Q2', text: 'Tell me about a time you worked within a diverse team.' },
      { id: 'S5-Q3', text: 'Describe a project that did not initially go well. What did you do to address it?' },
      { id: 'S5-Q4', text: 'What would your manager say are your greatest strengths?' },
      { id: 'S5-Q5', text: 'What do you want out of your MBA experience personally and professionally?' },
      { id: 'S5-Q6', text: 'If you were leading your organization today, what is one strategic change you would make?' }
    ],
    // Set 6
    [
      { id: 'S6-Q1', text: 'Tell me about yourself beyond what is on your resume.' },
      { id: 'S6-Q2', text: 'Describe a time when you had to learn something quickly in order to succeed.' },
      { id: 'S6-Q3', text: 'Tell me about a time when humility played an important role in your work.' },
      { id: 'S6-Q4', text: 'What is one weakness you are actively working to improve?' },
      { id: 'S6-Q5', text: 'What role do you typically take within your group of friends or communities outside work?' },
      { id: 'S6-Q6', text: 'What would your ideal post-MBA job look like?' }
    ],
    // Set 7
    [
      { id: 'S7-Q1', text: 'How did you decide on your current career path?' },
      { id: 'S7-Q2', text: 'Describe a time when you had to manage a stressful or complicated project.' },
      { id: 'S7-Q3', text: 'Tell me about a time you promoted collaboration across different teams.' },
      { id: 'S7-Q4', text: 'What is the biggest lesson you have learned from a professional failure?' },
      { id: 'S7-Q5', text: 'What will you bring to your MBA classmates that they may not already have?' },
      { id: 'S7-Q6', text: 'Is there anything else you would like the admissions committee to know about you?' }
    ]
  ];

  function normalize(s) {
    return String(s || '').toLowerCase().replace(/\s+/g, ' ').trim();
  }

  function toSourceUrl(raw) {
    if (!raw) return '';
    const s = String(raw).trim();
    if (/^https?:\/\//i.test(s)) return s.split(/\s+[•·]\s+/)[0].trim();
    const m = s.match(/\(?([a-z0-9.-]+\.(?:berkeley\.edu|haas\.berkeley\.edu))\)?/i);
    if (m) return 'https://' + m[1].replace(/^\(|\)$/g, '');
    if (/uc berkeley haas/i.test(s)) return 'https://mba.haas.berkeley.edu';
    return s;
  }

  IR.haasRecommendationList = [
    { q: 'walk me through your career path and the decisions that led you to where you are today', bucket: 'Career Background & Professional Development', guidance: 'A strong answer explains the logic behind your career progression, not just the sequence of roles. Highlight the key decisions that shaped your path, what you learned at each stage, and how those experiences prepared you for your next step. Haas encourages applicants to reflect on how their experiences, values, and passions shape their professional trajectory rather than simply listing accomplishments.', source: 'https://mba.haas.berkeley.edu/admissions/essays' },
    { q: 'why do you want an mba at this point in your career', bucket: 'Career background and professional skills', guidance: "Frame the MBA as a deliberate investment in skills, perspective, and career transition or acceleration. Haas' own materials emphasize leadership development, broadening perspective, and return on investment that is both professional and personal.", source: 'https://blogs.haas.berkeley.edu' },
    { q: 'tell me about a time when you faced strong opposition to one of your ideas', bucket: 'Behavioral questions', guidance: "Show how you handled dissent: listening, refining, persuading, or adapting. Haas' version of strong leadership is bold ideas plus humility and evidence.", source: 'https://mba.haas.berkeley.edu' },
    { q: 'describe a situation where you had to motivate a team when morale was low', bucket: 'Behavioral questions', guidance: "Similar to above, but stress how you created alignment and collaboration, not just individual motivation. Haas repeatedly frames good leadership as collaborative and community-minded.", source: 'https://mba.haas.berkeley.edu' },
    { q: 'what is the biggest transformation happening in your industry today', bucket: 'Opinion or thought-provoking questions', guidance: "Show that you can identify a major shift, explain why it matters, and think strategically about its implications. Haas positions itself around innovation, global fluency, and turning insight into impact.", source: 'https://mba.haas.berkeley.edu' },
    { q: 'if admitted, how would you contribute to the haas community', bucket: 'Career background and professional skills', guidance: 'Answer in terms of "us," not just "me": perspective, experience, community involvement, leadership, and what classmates gain from having you there. Haas explicitly says contribution to the whole academic community is a major part of fit.', source: 'https://blogs.haas.berkeley.edu' },
    { q: 'what are your short-term and long-term career goals', bucket: 'Career goal questions', guidance: "Present a credible arc: immediate role/function/industry, then broader long-term impact. Haas does not require certainty on every detail, but it clearly values thoughtful professional development and career direction.", source: 'https://mba.haas.berkeley.edu' },
    { q: 'why berkeley haas specifically', bucket: 'School-related questions', guidance: "Be specific: Defining Leadership Principles, Bay Area / innovation context, rigorous curriculum, experiential learning, personalized electives, and collaborative culture. Haas is clearest when applicants show both fit and contribution.", source: 'https://mba.haas.berkeley.edu' },
    { q: 'tell me about a time when you were proven wrong in a professional debate', bucket: 'Behavioral questions', guidance: "Show composure, openness to evidence, humility, and learning. Haas explicitly values evidence-based decisions, humility, and active pursuit of diverse perspectives.", source: 'https://mba.haas.berkeley.edu' },
    { q: 'describe a time when you had to work on a project where you initially lacked familiarity', bucket: 'Behavioral questions', guidance: "Show curiosity, learning speed, resourcefulness, and willingness to seek perspectives. Haas's Students Always principle is directly about lifelong learning and seeking diverse viewpoints.", source: 'https://mba.haas.berkeley.edu' },
    { q: 'what is one professional accomplishment you are most proud of', bucket: 'Self-Reflection & Professional Growth', guidance: "Choose an accomplishment that shows impact and growth. Explain the challenge, your role in solving it, and why the outcome mattered. Haas values accomplishments that demonstrate leadership potential and meaningful contribution.", source: 'https://mba.haas.berkeley.edu/admissions' },
    { q: "which of haas' four defining principles resonates most with you", bucket: 'Personal characteristics questions', guidance: "Pick one, define it in your own words, and prove it with a concrete story. Haas explicitly invites applicants to reflect on experiences, values, and passions that align with the principles.", source: 'https://mba.haas.berkeley.edu' },
    { q: 'what motivates your career decisions', bucket: 'Career Motivation', guidance: "Focus on the problems, opportunities, or impact that drive your decisions. Strong answers connect your motivations to past experiences and explain how those motivations influence your future goals. Haas emphasizes curiosity, learning, and pursuing meaningful challenges in leadership development.", source: 'https://mba.haas.berkeley.edu/defining-principles' },
    { q: 'tell me about a time you demonstrated leadership without formal authority', bucket: 'Behavioral & Leadership Situations', guidance: "Focus on how you influenced others through initiative, communication, and collaboration rather than positional power. Haas defines leadership broadly and values the ability to motivate teams, build trust, and drive progress even without formal authority.", source: 'https://mba.haas.berkeley.edu/defining-principles' },
    { q: 'describe a conflict you had with a teammate and how you handled it', bucket: 'Behavioral questions', guidance: "Emphasize how you preserved trust, handled differences, and improved the outcome. Haas is explicit that its principles create an environment conducive to teamwork and involvement.", source: 'https://mba.haas.berkeley.edu' },
    { q: 'tell me about a risk you took professionally', bucket: 'Personal characteristics questions', guidance: "Show that the risk was intelligent, not impulsive. Haas defines Question the Status Quo as championing bold ideas and taking intelligent risks.", source: 'https://mba.haas.berkeley.edu' },
    { q: 'what clubs, initiatives, or activities would you engage with at haas', bucket: 'Career background and professional skills', guidance: "Name specific clubs or affinity groups and say what you would do there, not just join them. Haas emphasizes clubs as places to deepen knowledge, learn from classmates, give back, and improve the MBA experience for future classes.", source: 'https://mba.haas.berkeley.edu' },
    { q: 'what role do you typically play in teams', bucket: 'Leadership example questions', guidance: "Anchor it in behaviors and values, not buzzwords. The strongest Haas answer will sound like a lived combination of curiosity, courage, humility, collaboration, and responsibility.", source: 'https://mba.haas.berkeley.edu' },
    { q: 'why do you believe now is the right time for you to pursue an mba', bucket: 'Career background and professional skills', guidance: "Combine your development goals with Haas-specific ways of getting there: curriculum, peers, experiential learning, career coaching, and culture. The strongest answer connects your needs to Haas's actual structure.", source: 'https://mba.haas.berkeley.edu' },
    { q: 'tell me about the most challenging professional situation you have faced', bucket: 'Behavioral questions', guidance: "Choose a challenge that reveals character and growth. Haas interview guidance explicitly values concise, organized responses that show personality beyond the application.", source: 'https://blogs.haas.berkeley.edu' },
    { q: 'describe a time when you had to persuade someone to change their mind', bucket: 'Behavioral & Leadership Situations', guidance: "Strong answers demonstrate listening to other perspectives, presenting clear reasoning, and building consensus. Haas emphasizes evidence-based decision-making combined with empathy and collaboration.", source: 'https://mba.haas.berkeley.edu/defining-principles' },
    { q: 'what is something constructive feedback taught you about yourself', bucket: 'Personal characteristics questions', guidance: "Show receptivity, reflection, and visible behavioral change. Haas's culture strongly rewards humility and continuous learning.", source: 'https://mba.haas.berkeley.edu' },
    { q: 'how have you built consensus among people with differing opinions', bucket: 'Opinion or thought-provoking questions', guidance: "Show listening, empathy, structure, evidence, and trust-building. Haas directly describes Confidence Without Attitude as building collaboration on empathy, inclusion, and trust.", source: 'https://mba.haas.berkeley.edu' },
    { q: 'what impact do you want to have in your industry in the long term', bucket: 'Career goal questions', guidance: "Keep it grounded: explain what kind of problems, environment, and impact you want, and why that matches your strengths and values. Haas' career materials emphasize alignment among interests, strengths, values, and target roles.", source: 'https://mba.haas.berkeley.edu' },
    { q: 'what distinguishes you from other mba applicants', bucket: 'Self-Reflection & Professional Growth', guidance: "Focus on the perspective, experiences, or values you uniquely bring. Haas encourages applicants to reflect on what makes their background and contributions distinctive within a collaborative learning community.", source: 'https://blogs.haas.berkeley.edu/the-berkeley-mba/what-can-you-contribute-to-an-mba-class' },
    { q: 'tell me about a time you worked within a diverse team', bucket: 'Diversity, equity, and inclusion questions', guidance: "Focus on what you learned, how you adapted, and how difference improved the work. Haas explicitly links diverse perspectives to stronger learning and performance.", source: 'https://mba.haas.berkeley.edu' },
    { q: 'describe a project that did not initially go well', bucket: 'Self-Reflection & Professional Growth', guidance: "Explain the challenge, how you diagnosed the issue, and the steps you took to improve the situation. Haas values resilience, reflection, and learning from setbacks.", source: 'https://mba.haas.berkeley.edu/defining-principles' },
    { q: 'what would your manager say are your greatest strengths', bucket: 'Personal characteristics questions', guidance: "Use examples that show not just competence but judgment, leadership, collaboration, or growth potential. Haas's recommender guidance makes clear it values professional accomplishments plus personal qualities and interpersonal skills.", source: 'https://mba.haas.berkeley.edu' },
    { q: 'what do you want out of your mba experience personally and professionally', bucket: 'Career background and professional skills', guidance: "Combine your development goals with Haas-specific ways of getting there: curriculum, peers, experiential learning, career coaching, and culture. The strongest answer connects your needs to Haas's actual structure.", source: 'https://mba.haas.berkeley.edu' },
    { q: 'if you were leading your organization today, what is one strategic change you would make', bucket: 'Opinion or thought-provoking questions', guidance: "Treat this as a strategy question: identify the problem, the first move, and why it matters. Haas's curriculum highlights strategic leadership, data-driven decision-making, and business communication.", source: 'https://mba.haas.berkeley.edu' },
    { q: 'tell me about yourself beyond what is on your resume', bucket: 'Other', guidance: "Use this to add a dimension that the resume cannot show: values, community, background, hobbies, or perspective. Haas interview guidance explicitly says the interview is for personality and communication beyond the rest of the application.", source: 'https://blogs.haas.berkeley.edu' },
    { q: 'describe a time when you had to learn something quickly in order to succeed', bucket: 'Behavioral questions', guidance: "Show curiosity, learning speed, resourcefulness, and willingness to seek perspectives. Haas's Students Always principle is directly about lifelong learning and seeking diverse viewpoints.", source: 'https://mba.haas.berkeley.edu' },
    { q: 'tell me about a time when humility played an important role in your work', bucket: 'Behavioral questions', guidance: "This is a direct opening to show self-awareness, learning, and confidence without arrogance. Haas's language around humility, evidence, empathy, and trust is especially relevant here.", source: 'https://mba.haas.berkeley.edu' },
    { q: 'what is one weakness you are actively working to improve', bucket: 'Personal characteristics questions', guidance: "Show self-awareness plus a credible plan to improve through the MBA experience. Tie each weakness to things Haas actually offers: courses, peers, clubs, coaching, or experiential learning.", source: 'https://mba.haas.berkeley.edu' },
    { q: 'what role do you typically take within your group of friends or communities outside work', bucket: 'Extra-curricular questions', guidance: "Haas wants to know the human being, not just the employee. Show who you are in community, how you support others, and what role you naturally take in groups.", source: 'https://mba.haas.berkeley.edu' },
    { q: 'what would your ideal post-mba job look like', bucket: 'Career goal questions', guidance: "Show progression, not fantasy. Tie each stage to skill-building, exploration, and eventual impact. Haas career support is framed around helping students discover industries, roles, and organizations aligned with their interests and values.", source: 'https://mba.haas.berkeley.edu' },
    { q: 'how did you decide on your current career path', bucket: 'Career Motivation', guidance: "Explain the reasoning behind your early choices and how your experiences clarified your interests and strengths. Strong responses show thoughtful decision-making and reflection on how your career evolved over time. Haas encourages applicants to demonstrate intentional professional development.", source: 'https://mba.haas.berkeley.edu/admissions/application' },
    { q: 'describe a time when you had to manage a stressful or complicated project', bucket: 'Behavioral questions', guidance: "Highlight diagnosis, prioritization, communication, and resilience. Haas' curriculum and principles both emphasize strategic leadership, evidence-based judgment, and learning through challenge.", source: 'https://mba.haas.berkeley.edu' },
    { q: 'tell me about a time you promoted collaboration across different teams', bucket: 'Behavioral & Leadership Situations', guidance: "Highlight how you aligned goals, improved communication, or resolved barriers between groups. Haas repeatedly stresses teamwork and the ability to bring people together to achieve collective outcomes.", source: 'https://mba.haas.berkeley.edu/defining-principles' },
    { q: 'what is the biggest lesson you have learned from a professional failure', bucket: 'Behavioral questions', guidance: "Choose a challenge that reveals character and growth. Haas interview guidance explicitly values concise, organized responses that show personality beyond the application.", source: 'https://blogs.haas.berkeley.edu' },
    { q: 'what will you bring to your mba classmates that they may not already have', bucket: 'Career background and professional skills', guidance: 'Answer in terms of "us," not just "me": perspective, experience, community involvement, leadership, and what classmates gain from having you there. Haas explicitly says contribution to the whole academic community is a major part of fit.', source: 'https://blogs.haas.berkeley.edu' },
    { q: 'is there anything else you would like the admissions committee to know about you', bucket: 'Other', guidance: "Use it to reinforce the one important point not yet clear: fit, contribution, values, or an overlooked dimension of your story. Keep it concise and additive.", source: 'https://blogs.haas.berkeley.edu' }
  ];

  IR.getHaasRecommendation = function (questionText) {
    if (!questionText) return null;
    const n = normalize(questionText);
    const list = IR.haasRecommendationList || [];
    const exact = list.find(r => normalize(r.q) === n);
    if (exact) return { bucket: exact.bucket, guidance: exact.guidance, source: toSourceUrl(exact.source) };
    const contains = list.find(r => n.indexOf(normalize(r.q)) !== -1 || normalize(r.q).indexOf(n) !== -1);
    if (contains) return { bucket: contains.bucket, guidance: contains.guidance, source: toSourceUrl(contains.source) };
    return null;
  };

  IR.haasResourceSections = [
    {
      id: 'start-here',
      title: 'Start here',
      blurb: 'Three links that give you the quickest, most accurate sense of what Haas stands for.',
      items: [
        { name: 'Defining Leadership Principles', topic: 'Core Haas values and how they show up in class, culture, and leadership expectations.', url: 'https://mba.haas.berkeley.edu/defining-principles' },
        { name: 'Why Berkeley Haas', topic: 'High-level view of why Haas is distinctive: culture, Bay Area ecosystem, and leadership focus.', url: 'https://mba.haas.berkeley.edu/why-berkeley-haas' },
        { name: 'Admissions Overview', topic: 'What the admissions team actually evaluates: experience, academics, leadership potential, and personal qualities.', url: 'https://mba.haas.berkeley.edu/admissions' }
      ]
    },
    {
      id: 'admissions',
      title: 'Admissions & application',
      blurb: 'Use these when you are deciding whether to apply, shaping your story, or polishing essays and recommendations.',
      items: [
        { name: 'Admissions FAQ', topic: 'Official answers on interview format, application timing, and process basics.', url: 'https://mba.haas.berkeley.edu/admissions/faq' },
        { name: 'Application Process', topic: 'Step-by-step view of the full application and deadlines.', url: 'https://mba.haas.berkeley.edu/admissions/application' },
        { name: 'MBA Essays Guidance', topic: 'How Haas expects you to reflect on values, leadership principles, and contribution in essays.', url: 'https://mba.haas.berkeley.edu/admissions/essays' },
        { name: 'Recommendation Letters Guidance', topic: 'What Haas wants recommenders to highlight and how to brief them.', url: 'https://mba.haas.berkeley.edu/admissions/recommendation-letters' }
      ]
    },
    {
      id: 'academics',
      title: 'Academics & curriculum',
      blurb: 'Links for understanding what you will learn, how courses are structured, and where you can go deep.',
      items: [
        { name: 'MBA Curriculum', topic: 'Core courses, flexibility, and leadership-focused coursework.', url: 'https://mba.haas.berkeley.edu/academics/curriculum' },
        { name: 'Academics Overview', topic: 'How the academic experience is structured across core, electives, and cross-campus options.', url: 'https://mba.haas.berkeley.edu/academics' },
        { name: 'Experiential Learning', topic: 'Applied projects, labs, and real-world learning opportunities.', url: 'https://mba.haas.berkeley.edu/academics/experiential-learning' },
        { name: 'Haas Leadership Development', topic: 'Leadership development approach and programs layered on top of coursework.', url: 'https://mba.haas.berkeley.edu/academics/leadership' },
        { name: 'Haas Centers & Institutes', topic: 'Research centers that influence curriculum and connect you to industry.', url: 'https://haas.berkeley.edu/research/centers' }
      ]
    },
    {
      id: 'careers',
      title: 'Careers & outcomes',
      blurb: 'Use these when you are checking career support, recruiting, and post-MBA outcomes.',
      items: [
        { name: 'Career Management Group', topic: 'Coaching, recruiting preparation, and how Haas supports your job search.', url: 'https://mba.haas.berkeley.edu/careers/career-management' },
        { name: 'Career Outcomes', topic: 'Employment reports and where recent grads actually land.', url: 'https://mba.haas.berkeley.edu/careers/employment-report' },
        { name: 'Haas Global Network', topic: 'Alumni network reach and how it is organized.', url: 'https://mba.haas.berkeley.edu/alumni' }
      ]
    },
    {
      id: 'community',
      title: 'Student life & community',
      blurb: 'Everything around the classroom: culture, clubs, and community.',
      items: [
        { name: 'Student Life Overview', topic: 'How students describe the Haas culture and day-to-day experience.', url: 'https://mba.haas.berkeley.edu/student-life' },
        { name: 'Student Clubs', topic: 'Professional, affinity, and interest-based clubs you can plug into or help lead.', url: 'https://mba.haas.berkeley.edu/student-life/clubs' }
      ]
    },
    {
      id: 'dei',
      title: 'Diversity, equity, and inclusion',
      blurb: 'Resources that show how Haas thinks about DEI and what students are building on campus.',
      items: [
        { name: 'Diversity at Haas', topic: 'School-wide DEI initiatives and commitments.', url: 'https://haas.berkeley.edu/diversity' },
        { name: 'Student Diversity & Inclusion', topic: 'Student organizations and initiatives focused on inclusion and belonging.', url: 'https://mba.haas.berkeley.edu/student-life/diversity' }
      ]
    },
    {
      id: 'stories',
      title: 'Blogs & student stories',
      blurb: 'Good for getting the “human side” of Haas and concrete examples for your own answers.',
      items: [
        { name: 'Haas MBA Blog', topic: 'Ongoing posts from students, alumni, and staff about life at Haas.', url: 'https://blogs.haas.berkeley.edu/the-berkeley-mba' },
        { name: 'How to Ace Your Video Interview', topic: 'Official Haas interview tips from the admissions blog.', url: 'https://blogs.haas.berkeley.edu/the-berkeley-mba/how-to-ace-your-video-interview' },
        { name: 'What Can You Contribute to an MBA Class', topic: 'How Haas thinks about contribution and community in practice.', url: 'https://blogs.haas.berkeley.edu/the-berkeley-mba/what-can-you-contribute-to-an-mba-class' },
        { name: 'Why Get an MBA', topic: 'Students explain why they chose the MBA and what changed for them.', url: 'https://blogs.haas.berkeley.edu/the-berkeley-mba/berkeley-haas-students-answer-the-question-why-get-an-mba' },
        { name: 'Differentiating Your Contribution', topic: 'Guidance on reflecting on your past to explain your unique contribution.', url: 'https://blogs.haas.berkeley.edu/the-berkeley-mba/how-to-examine-your-past-to-differentiate-your-contribution-to-an-mba-program' }
      ]
    }
  ];
})(typeof window !== 'undefined' ? window : this);
