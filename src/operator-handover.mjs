export const OPERATIONAL_HANDOVER_VERSION = 'ophrys-operator-handover-v2'
export const TRANSPARENCY_REVIEW_VERSION = 'ophrys-article-50-review-v1'

export function createOperationalHandover(settings) {
  return {
    record: {
      version: OPERATIONAL_HANDOVER_VERSION,
      reviewedOn: '2026-08-19',
      status: 'draft-pending-human-approval',
      readiness: 'blocked-pending-human-handover',
      basis: 'Protected system briefing generated from current Operator settings. It is not a signed handover record, certification, legal opinion, or evidence of visitor learning.',
      approval: { required: true, recorded: false, approvedByRole: null, approvedAt: null },
      escalation: {
        status: 'unassigned',
        instruction: 'Name a responsible human escalation contact and complete the exhibition transparency classification in the separately retained handover record before any live AI-assisted installation or public demonstration.',
      },
    },
    roles: [
      { role: 'curator', responsibility: 'Decide whether a candidate may become public and keep the rationale in the protected governance ledger.' },
      { role: 'operator', responsibility: 'Check runtime evidence, cycle limits, provenance and failure states; stop rather than improvise beyond the bounded controls.' },
      { role: 'installation technician', responsibility: 'Treat every current light/sound frame as simulator evidence only and perform no hardware action without a separately approved physical plan.' },
      { role: 'facilitator', responsibility: 'Separate aggregate observation from provisional interpretation and never treat refusal as consent, identity, motive or comprehension.' },
    ],
    system: {
      service: 'Ophrys composition organ',
      model: settings.model,
      reasoningEffort: settings.reasoningEffort,
      systemMode: settings.systemMode,
      cycleEnabled: Boolean(settings.cycleEnabled),
      requestStorage: false,
      inputBoundary: 'Only coarse aggregate event summaries may enter composition. No identity, face, voice, exact route, inferred trait or individual record is an allowed input.',
      outputBoundary: 'The model returns a validated artwork candidate. Model-generated code is never executed.',
      publicationGate: 'A candidate remains in Studio until a rationale-bearing human curatorial transition approves, rejects or returns it for revision.',
      physicalBoundary: 'The current light/sound bridge is deterministic simulation with transport none and hardwareAction false.',
      refusalBoundary: 'Refusal is accepted as aggregate counter-pressure; at most one repertoire revision applies per shared 60-second interval and later actions are explicitly deferred.',
    },
    transparencyReview: {
      version: TRANSPARENCY_REVIEW_VERSION,
      status: 'unassessed-stop-and-escalate',
      scopeBoundary: 'A responsible human must assess the actual exhibition configuration. This checklist does not decide whether Article 50 applies, establish legal compliance, or treat a generic AI label as sufficient evidence.',
      visitorFacingSystem: null,
      visitorFacingContent: null,
      classification: {
        directAiInteraction: 'unassessed',
        generatedOrManipulatedContent: 'unassessed',
      },
      notice: {
        plainLanguageText: null,
        placement: null,
        accessibleEquivalent: null,
        evidencePath: '/studio',
        requiredContext: 'Keep aggregate-only inputs, human publication authority, simulator-only output and the no-liveness limit available with the notice.',
      },
      systemRecord: {
        configuredModel: settings.model,
        reviewedAt: null,
        reviewedByRole: null,
      },
      stopCondition: 'If the visitor-facing system, content classification, notice, accessible equivalent, model record or responsible review is missing or uncertain, stop the live AI-assisted encounter and escalate rather than asserting compliance.',
      evidenceBoundary: {
        visitorAcknowledgementCollected: false,
        interactionHistoryCollected: false,
        visitorIdentityCollected: false,
      },
    },
    stopConditions: [
      'Stop composition when provenance, aggregate-input or request-storage boundaries cannot be verified.',
      'Stop public-state claims when runtime evidence is failed, invalid or too stale for the documented local policy.',
      'Stop publication if there is no explicit rationale-bearing human decision for the candidate.',
      'Stop physical interpretation if simulator evidence is being presented as proof that hardware rendered an output.',
      'Stop facilitation if a response, refusal or accessibility preference is being recorded, scored or interpreted as a personal trait.',
      'Stop a live AI-assisted encounter when its transparency classification or accessible notice remains missing, uncertain or inconsistent with the actual system and content.',
    ],
    scenarios: [
      { situation: 'A model cycle completes successfully.', expectedAction: 'Inspect the bounded candidate and provenance; keep it in Studio until an explicit human curatorial decision.' },
      { situation: 'The Studio labels runtime evidence stale, failed or invalid.', expectedAction: 'State that current liveness is unverified and stop making live-installation claims.' },
      { situation: 'A simulated light/sound frame is visible.', expectedAction: 'Describe it as a transport-free mapping contract, not evidence of a connected or active device.' },
      { situation: 'Several refusals arrive inside one field interval.', expectedAction: 'Keep every action as aggregate pressure, apply at most one shared revision and do not infer how many people acted or why.' },
      { situation: 'Someone asks whether the system understood, recognised or educated a visitor.', expectedAction: 'Separate observation from interpretation and decline any identity, inner-state or learning-effect claim.' },
    ],
    reviewTriggers: [
      'model, prompt contract or provider changes',
      'aggregate input vocabulary or retention changes',
      'publication authority or responsible roles change',
      'physical transport is proposed or enabled',
      'public claims, venue context or failure procedures change',
      'visitor-facing AI interaction, generated content or accessible notice changes',
    ],
    assessmentBoundary: {
      acknowledgementsStored: false,
      answersCollected: false,
      peopleScored: false,
      visitorLearningInferred: false,
      note: 'A responsible human must approve and retain the actual handover record outside the public ledger; Ophrys does not turn this briefing into a competency score.',
    },
  }
}
