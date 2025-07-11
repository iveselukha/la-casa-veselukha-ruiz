import { Button } from "@/components/ui/button";

interface ConfirmationMessageProps {
  title: string;
  message: string;
  onClose: () => void;
}

export function ConfirmationMessage({ title, message, onClose }: ConfirmationMessageProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 fade-in">
      <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-green-500 mb-4"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
      <h2 className="text-xl font-semibold text-terracotta-700 mb-2 text-center">{title}</h2>
      <p className="text-sage-700 text-center mb-4">{message}</p>
      <Button onClick={onClose} className="animated-btn bg-terracotta-600 hover:bg-terracotta-700 text-white w-full max-w-xs">Close</Button>
    </div>
  );
} 