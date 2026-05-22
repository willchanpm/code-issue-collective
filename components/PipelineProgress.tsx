'use client'

import {
  countCompletedStages,
  getActiveStage,
  getRemainingStageLabels,
  PIPELINE_STAGES,
  type PipelineProgressState,
  type PipelineStageStatus,
} from '@/lib/pipelineProgress'

function statusLabel(status: PipelineStageStatus): string {
  switch (status) {
    case 'done':
      return 'Done'
    case 'active':
      return 'In progress'
    case 'skipped':
      return 'Skipped'
    default:
      return 'Waiting'
  }
}

function statusSymbol(status: PipelineStageStatus): string {
  switch (status) {
    case 'done':
      return '✓'
    case 'active':
      return '…'
    case 'skipped':
      return '–'
    default:
      return '○'
  }
}

export function PipelineProgress({ progress }: { progress: PipelineProgressState }) {
  const completedCount = countCompletedStages(progress)
  const totalCount = PIPELINE_STAGES.length
  const activeStage = getActiveStage(progress)
  const remainingLabels = getRemainingStageLabels(progress)
  const progressPercent = Math.round((completedCount / totalCount) * 100)

  return (
    <div className="pipeline-progress" aria-live="polite">
      <div className="pipeline-progress-header">
        <p className="pipeline-progress-count">
          Step {Math.min(completedCount + (activeStage ? 1 : 0), totalCount)} of{' '}
          {totalCount}
        </p>
        <p className="pipeline-progress-percent">{progressPercent}% complete</p>
      </div>

      <div
        className="pipeline-progress-bar"
        role="progressbar"
        aria-valuenow={progressPercent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Photo processing progress"
      >
        <span
          className="pipeline-progress-bar-fill"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {activeStage && (
        <p className="pipeline-progress-current">
          <strong>Now:</strong> {activeStage.activeHint}
        </p>
      )}

      {remainingLabels.length > 0 && (
        <p className="pipeline-progress-remaining">
          <strong>Still to go:</strong> {remainingLabels.join(', ')}
        </p>
      )}

      <ol className="pipeline-progress-list">
        {PIPELINE_STAGES.map((stage) => {
          const status = progress[stage.id]

          return (
            <li
              key={stage.id}
              className={`pipeline-progress-item pipeline-progress-item--${status}`}
            >
              <span className="pipeline-progress-symbol" aria-hidden="true">
                {statusSymbol(status)}
              </span>
              <span className="pipeline-progress-label">{stage.label}</span>
              <span className="pipeline-progress-status">{statusLabel(status)}</span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
