import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet"

interface SheetProps {
  children: React.ReactNode;
  open: boolean;
  title?: string;
  description?: string;
  className?: string;
  onClose: (open: boolean) => void;
}

export const BottomSheet = ({ children, open, title,description,onClose,className }: SheetProps) => {
  return (
    <Sheet open={open} onOpenChange={(isOpen) => onClose(isOpen)}>
      <SheetContent side="bottom" className={className}>
       {children}
       <SheetTitle>{title || ""}</SheetTitle>
       <SheetDescription>{description || ""}</SheetDescription>
  </SheetContent>
</Sheet>)}