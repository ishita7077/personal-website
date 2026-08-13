# fav papers

Current top 3 research papers + hot takes:

## [Reinforcement Learning via Self-Distillation](https://arxiv.org/pdf/2601.20802)

_read with 90/30 paper club_

The paper talks about how to get a "wiser" version of the model to teach its own student self.

Who needs external beings? An entity is its own best eval - (proposed)

In practice - we let the model look at its own attempt again with the error attached, then distill that hindsight back into the original policy token by token. same model, but one version knows what went wrong.

The discussion group eventually decided its kinda useless and even with the outcome gains - better credit assignment is ahead of its time and has limited real world impact right now.

**fav equation**

> L_SDPO(θ) = Σ_t KL(π_θ(· | x, y_<t) || stopgrad(π_θ(· | x, f, y_<t)))
>
> the student is on the left; the same model after seeing feedback is on the right. the stop-gradient is the hinge: only the student moves.

## [Toward Generalist Autonomous Research via Hypothesis-Tree Refinement](https://arxiv.org/pdf/2606.11926)

_read with Learning Layer lab_

I was deeply excited to read this, given my background in research. The paper treats research memory as a data structure, not a longer transcript. one coordinator holds the map; short-lived executors test one branch each in isolated worktrees. every failed experiment stays attached to the hypothesis that produced it.

It is truly every researcher's dream to have an intern so smart.

I do believe the held-out merge gate can leak back to the HTR after, say 20+ merges. Another major drawback was that the HTR, given how trees work, was unable to propose drastically different solutions when things aren't working.

Brute force intern. Needs fast feedback.

**fav equation**

> n = ⟨h_n, ι_n, μ_n⟩
>
> one node = a hypothesis, what the experiment taught us, and the artifact/evidence record. that is the whole research memory in one line.

## [Verbalizable Representations Form a Global Workspace in Language Models](https://transformer-circuits.pub/2026/workspace/index.html)

_read with 90/30 paper club_

The discussion on this went deep into philosophy and what does consciousness mean. J-lens only works with "verbalizable directions". Unsure of how useful it truly is for safety - the Meta engineer in the room agreed. Nevertheless, great read into interpretability.

**fav equation**

> lens(h_ℓ) = softmax(W_U norm(J_ℓ h_ℓ))
>
> take an internal state, pass it through its average downstream effect, then map it back to vocabulary. rough translation: what could this activation make the model say across contexts?
