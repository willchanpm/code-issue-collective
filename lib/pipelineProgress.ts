// Every step the app runs after you upload a photo.
// We show these in order so users know what's happening and what's left.

export type PipelineStageId =
  | 'analyze'
  | 'avatar-idle'
  | 'avatar-pint'
  | 'avatar-dance'
  | 'voice'
  | 'music'
  | 'sound-idle'
  | 'sound-pint'
  | 'sound-dance'
  | 'save'

export type PipelineStageStatus = 'pending' | 'active' | 'done' | 'skipped'

export interface PipelineStageDefinition {
  id: PipelineStageId
  label: string
  // Short hint shown while this step is running.
  activeHint: string
}

export const PIPELINE_STAGES: PipelineStageDefinition[] = [
  {
    id: 'analyze',
    label: 'Describe your friend',
    activeHint: 'Reading the polaroid photo...',
  },
  {
    id: 'avatar-idle',
    label: 'Draw idle sprite',
    activeHint: 'Generating the default 8-bit pose...',
  },
  {
    id: 'avatar-pint',
    label: 'Draw pint sprite',
    activeHint: 'Adding the pint-glass pose...',
  },
  {
    id: 'avatar-dance',
    label: 'Draw dance sprite',
    activeHint: 'Adding the dance pose...',
  },
  {
    id: 'voice',
    label: 'Record voice intro',
    activeHint: 'Creating the spoken greeting...',
  },
  {
    id: 'music',
    label: 'Compose theme music',
    activeHint: 'Making background chiptune music...',
  },
  {
    id: 'sound-idle',
    label: 'Create tap sound',
    activeHint: 'Generating the tap button sound...',
  },
  {
    id: 'sound-pint',
    label: 'Create pint sound',
    activeHint: 'Generating the pint button sound...',
  },
  {
    id: 'sound-dance',
    label: 'Create dance sound',
    activeHint: 'Generating the dance button sound...',
  },
  {
    id: 'save',
    label: 'Save & create share link',
    activeHint: 'Saving your pocket friend and QR link...',
  },
]

export type PipelineProgressState = Record<PipelineStageId, PipelineStageStatus>

export interface PipelineProgressUpdate {
  stageId: PipelineStageId
  status: PipelineStageStatus
}

export function createInitialPipelineProgress(): PipelineProgressState {
  return PIPELINE_STAGES.reduce((state, stage) => {
    state[stage.id] = 'pending'
    return state
  }, {} as PipelineProgressState)
}

export function applyPipelineProgressUpdate(
  current: PipelineProgressState,
  update: PipelineProgressUpdate,
): PipelineProgressState {
  return {
    ...current,
    [update.stageId]: update.status,
  }
}

export function getPipelineStageDefinition(stageId: PipelineStageId) {
  const stage = PIPELINE_STAGES.find((entry) => entry.id === stageId)
  if (!stage) {
    throw new Error(`Unknown pipeline stage: ${stageId}`)
  }
  return stage
}

export function countCompletedStages(state: PipelineProgressState): number {
  return PIPELINE_STAGES.filter(
    (stage) => state[stage.id] === 'done' || state[stage.id] === 'skipped',
  ).length
}

export function getActiveStage(state: PipelineProgressState) {
  return PIPELINE_STAGES.find((stage) => state[stage.id] === 'active') ?? null
}

export function getRemainingStageLabels(state: PipelineProgressState): string[] {
  return PIPELINE_STAGES.filter((stage) => state[stage.id] === 'pending').map(
    (stage) => stage.label,
  )
}
