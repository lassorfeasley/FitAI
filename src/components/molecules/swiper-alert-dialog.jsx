import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/atoms/alert-dialog";
import { SwiperButton } from './swiper-button';

const SwiperAlertDialog = ({
  open,
  isOpen,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel"
}) => {
  const controlledOpen = typeof open !== "undefined" ? open : isOpen;

  return (
    <AlertDialog open={controlledOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && <AlertDialogDescription>{description}</AlertDialogDescription>}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <SwiperButton variant="outline">{cancelText}</SwiperButton>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <SwiperButton variant="destructive" onClick={onConfirm}>{confirmText}</SwiperButton>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default SwiperAlertDialog; 