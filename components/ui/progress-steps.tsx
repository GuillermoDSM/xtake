import { Check } from 'lucide-react'

interface ProgressStep {
  label: string
  status: "pending" | "in-progress" | "completed"
}

interface ProgressStepsProps {
  steps: ProgressStep[]
}

export function ProgressSteps({ steps }: ProgressStepsProps) {
  return (
    <div className="space-y-4">
      {steps.map((step, index) => (
        <div key={step.label} className="flex items-center gap-4">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
              step.status === "completed"
                ? "border-green-500 bg-green-500 text-white"
                : step.status === "in-progress"
                ? "border-blue-500 text-blue-500"
                : "border-gray-300 text-gray-300"
            }`}
          >
            {step.status === "completed" ? (
              <Check className="h-5 w-5" />
            ) : (
              <span>{index + 1}</span>
            )}
          </div>
          <span
            className={
              step.status === "completed"
                ? "text-green-500"
                : step.status === "in-progress"
                ? "text-blue-500"
                : "text-gray-500"
            }
          >
            {step.label}
          </span>
        </div>
      ))}
    </div>
  )
}

