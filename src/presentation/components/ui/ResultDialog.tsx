"use client";
import { Button } from "@heroui/react";
import { CheckCircle, XCircle } from "lucide-react";

export interface SaveResult {
  type: "success" | "error";
  title: string;
  message: string;
}

interface ResultDialogProps {
  result: SaveResult | null;
  onClose: () => void;
}

export function ResultDialog({ result, onClose }: ResultDialogProps) {
  if (!result) return null;

  const isSuccess = result.type === "success";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />

      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="result-dialog-title"
        className="relative z-10 rounded-xl shadow-xl border border-default-200 p-6 w-full max-w-sm mx-4 bg-white dark:bg-zinc-900"
      >
        <div className="flex flex-col items-center gap-4 text-center">
          {isSuccess ? (
            <div className="p-3 rounded-full bg-green-50">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          ) : (
            <div className="p-3 rounded-full bg-red-50">
              <XCircle className="w-8 h-8 text-danger" />
            </div>
          )}

          <div>
            <h3
              id="result-dialog-title"
              className={`font-semibold text-lg ${isSuccess ? "text-green-700" : "text-danger"}`}
            >
              {result.title}
            </h3>
            <p className="text-sm text-default-500 mt-1">{result.message}</p>
          </div>

          <Button
            variant={isSuccess ? "primary" : "outline"}
            className="w-full mt-2"
            onPress={onClose}
            autoFocus
          >
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
}
