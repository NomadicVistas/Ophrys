# Hackathon build brief

## Goal

Build the smallest spatial prototype that makes Ophrys's central contradiction tangible: the system becomes more effective at attracting attention while remaining unable to understand a person.

The prototype is successful when a participant can experience the feedback loop, inspect its limits and change or refuse the reading imposed on their behaviour.

## Minimum viable experience

1. A visitor encounters a light, sound or kinetic signal.
2. The system records only a coarse event such as approach, dwell band, withdrawal or explicit refusal.
3. An adaptive policy selects a later signal variation.
4. A public-facing trace shows what was observed, what was inferred and how uncertain that inference remains.
5. A refusal action changes the future repertoire instead of being discarded as failed engagement.

## Suggested modules

### Signal engine

- 3–5 composed states rather than an unlimited generator;
- light, spatial audio, low-resolution movement or mechanical rhythm;
- deliberate latency, silence and signal loss as valid states.

### Observation layer

- aggregate counts or coarse spatial zones;
- no stored image or voice recordings;
- short retention and a visible reset mechanism;
- simulated inputs are acceptable for the first build.

### Adaptation layer

- begin with a transparent state machine, multi-armed bandit or similarly bounded policy;
- log every state transition and the evidence used;
- preserve uncertainty rather than optimising toward one engagement score.

### Counter-field

- show the current tactic and its confidence or ambiguity;
- distinguish observed event, voluntary account and artistic interpretation;
- allow exit, correction, deletion, distortion or collective counter-performance.

## Definition of done

- One complete signal → response → adaptation loop runs locally.
- No personally identifying data is required.
- Observation and interpretation are separately visible.
- A refusal action has a real downstream effect.
- The system still produces a legible experience when sensing or inference fails.
- Energy, network and hardware dependencies are documented.

## Out of scope

- facial recognition;
- emotion, gender, age, ethnicity or disability inference;
- psychological profiling;
- persuasive optimisation hidden from participants;
- a conversational chatbot as the main encounter;
- a slideshow of generated AI imagery;
- claims that the prototype measures artistic impact or understands intent.

## Open questions

- Which signal is spatially compelling without becoming spectacle?
- What is the minimum sensing resolution needed to create a meaningful relation?
- How can refusal become aesthetically consequential?
- When does adaptation feel alive, and when does it feel merely reactive?
- How should accumulated residue survive between sessions without becoming personal data?
