"use client";
import { Button, Spinner } from "@heroui/react";
import { AlertTriangle } from "lucide-react";

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** "danger" → botón rojo | "warning" → botón primario */
  variant?: "danger" | "warning";
  confirming?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  variant = "danger",
  confirming = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center'>
      {/* Backdrop */}
      <div
        className='absolute inset-0 bg-black/40 backdrop-blur-sm'
        onClick={onCancel}
        aria-hidden='true'
      />
      {/* Dialog */}
      <div
        role='dialog'
        aria-modal='true'
        aria-labelledby='confirm-dialog-title'
        className='relative z-10 rounded-xl shadow-xl border border-default-200 p-6 w-full max-w-sm mx-4 bg-white dark:bg-zinc-900'
      >
        <div className='flex flex-col gap-5'>
          <div className='flex items-start gap-3'>
            <div
              className={`shrink-0 p-2 rounded-lg ${
                variant === "danger" ? "bg-red-50" : "bg-amber-50"
              }`}
            >
              <AlertTriangle
                className={`w-5 h-5 ${variant === "danger" ? "text-danger" : "text-amber-500"}`}
              />
            </div>
            <div>
              <h3 id='confirm-dialog-title' className='font-semibold text-foreground'>
                {title}
              </h3>
              <p className='text-sm text-default-500 mt-1'>{description}</p>
            </div>
          </div>

          <div className='flex gap-2 justify-end'>
            <Button variant='ghost' size='sm' onPress={onCancel} isDisabled={confirming}>
              {cancelLabel}
            </Button>
            <Button
              variant={variant === "danger" ? "danger" : "primary"}
              size='sm'
              onPress={onConfirm}
              isDisabled={confirming}
            >
              {confirming ? <Spinner size='sm' /> : confirmLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
