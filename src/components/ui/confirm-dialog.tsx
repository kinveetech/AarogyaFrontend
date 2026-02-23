'use client'

import {
  Button,
  DialogRoot,
  DialogBackdrop,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogActionTrigger,
  DialogPositioner,
  Text,
} from '@chakra-ui/react'

export interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  subtitle?: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
  loading?: boolean
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  subtitle,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  loading = false,
}: ConfirmDialogProps) {
  return (
    <DialogRoot
      open={open}
      onOpenChange={(details) => !details.open && onClose()}
      role="alertdialog"
    >
      <DialogBackdrop />
      <DialogPositioner>
        <DialogContent
          bg="bg.glass"
          backdropFilter="blur(20px)"
          borderColor="border.subtle"
          borderWidth="1px"
          boxShadow="glass"
          borderRadius="xl"
          aria-describedby="confirm-dialog-body"
        >
          <DialogHeader>
            <DialogTitle fontFamily="heading" color="text.primary">
              {title}
            </DialogTitle>
            {subtitle && (
              <Text fontSize="sm" color="text.muted" mt="1">
                {subtitle}
              </Text>
            )}
          </DialogHeader>
          <DialogBody id="confirm-dialog-body">
            <Text color="text.secondary" fontSize="sm">
              {message}
            </Text>
          </DialogBody>
          <DialogFooter>
            <DialogActionTrigger asChild>
              <Button variant="ghost" borderRadius="full">
                {cancelLabel}
              </Button>
            </DialogActionTrigger>
            <Button
              borderRadius="full"
              bg={destructive ? 'coral.400' : 'action.primary'}
              color="action.primary.text"
              onClick={onConfirm}
              loading={loading}
              disabled={loading}
              css={destructive ? { _dark: { bg: 'coral.500' } } : undefined}
            >
              {confirmLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogPositioner>
    </DialogRoot>
  )
}
