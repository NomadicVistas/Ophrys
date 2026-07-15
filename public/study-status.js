export function curatorialStatusLabel(study) {
  if (study?.status === 'published' && study.reviewDecision === 'approved') return 'Published · human approved'
  if (study?.status === 'archived' && study.reviewDecision === 'rejected') return 'Archived · human rejected'
  if (study?.status === 'studio' && study.reviewDecision === 'returned_for_revision') return 'Studio study · revision requested'
  if (study?.status === 'studio') return 'Studio study · review pending'
  return 'Curatorial status unavailable'
}
