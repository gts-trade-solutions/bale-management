"use client";

import { Check } from "lucide-react";
import type { TruckStatus } from "@/lib/types";

interface Step {
  status: TruckStatus;
  label: string;
}

const STEPS: Step[] = [
  { status: "WAIT_TRUCK", label: "Wait Truck" },
  { status: "CHECK_IN", label: "Check-In" },
  { status: "GROSS_IN", label: "Gross Weight" },
  { status: "UNLOAD_LOOP", label: "Unload & QA" },
  { status: "TARE_OUT", label: "Tare Weight" },
  { status: "CLOSE_TRUCK_RECORD", label: "Complete" },
];

interface StateMachineStepperProps {
  currentStatus: TruckStatus;
}

export function StateMachineStepper({ currentStatus }: StateMachineStepperProps) {
  const currentIndex = STEPS.findIndex((s) => s.status === currentStatus);
  const isBatchReject = currentStatus === "BATCH_REJECT";

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between">
        {STEPS.map((step, index) => {
          const isCompleted = index < currentIndex || currentStatus === "CLOSE_TRUCK_RECORD";
          const isCurrent = index === currentIndex;
          const isRejected = isBatchReject && index >= 3;

          return (
            <div key={step.status} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={`
                    w-10 h-10 rounded-full border-2 flex items-center justify-center
                    transition-colors duration-200
                    ${
                      isCompleted
                        ? "bg-green-600 border-green-600 text-white"
                        : isCurrent
                        ? "bg-blue-600 border-blue-600 text-white"
                        : isRejected
                        ? "bg-red-600 border-red-600 text-white"
                        : "bg-gray-200 border-gray-300 text-gray-600"
                    }
                  `}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-semibold">{index + 1}</span>
                  )}
                </div>
                <span
                  className={`
                    text-xs mt-2 text-center
                    ${isCurrent ? "font-semibold" : "font-medium"}
                    ${isRejected ? "text-red-600" : ""}
                  `}
                >
                  {step.label}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={`
                    flex-1 h-0.5 mx-2 transition-colors duration-200
                    ${
                      index < currentIndex
                        ? "bg-green-600"
                        : isRejected && index >= 2
                        ? "bg-red-600"
                        : "bg-gray-300"
                    }
                  `}
                />
              )}
            </div>
          );
        })}
      </div>
      {isBatchReject && (
        <div className="mt-4 text-center">
          <span className="inline-block bg-red-100 text-red-800 px-3 py-1 rounded-md text-sm font-medium">
            Batch Rejected - Failed QA
          </span>
        </div>
      )}
    </div>
  );
}
