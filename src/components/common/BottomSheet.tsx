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
  onClose: (open: boolean) => void;
}

export const BottomSheet = ({ children, open, title,description,onClose }: SheetProps) => {
  return (
    <Sheet open={open} onOpenChange={(isOpen) => onClose(isOpen)}>
      <SheetContent side="bottom">
       {children}
       <SheetTitle>{title || ""}</SheetTitle>
       <SheetDescription>{description || ""}</SheetDescription>
  </SheetContent>
</Sheet>)}