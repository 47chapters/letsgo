import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "components/ui/dialog";
import { Button } from "./ui/button";

export interface ConfirmDialogProps {
  title: string;
  description: React.ReactNode;
  trigger: React.ReactNode;
  confirm: React.ReactNode;
  cancel?: React.ReactNode;
  onConfirm: () => Promise<void>;
}

export function ConfirmDialog({
  title,
  description,
  trigger,
  confirm,
  cancel,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            {cancel || <Button variant="secondary">Cancel</Button>}
          </DialogClose>
          <DialogClose onClick={onConfirm} asChild>
            {confirm}
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
