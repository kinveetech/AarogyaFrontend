'use client'

import { type ReactNode } from 'react'
import { Button } from '@chakra-ui/react'
import {
  EmptyStateRoot,
  EmptyStateContent,
  EmptyStateIndicator,
  EmptyStateTitle,
  EmptyStateDescription,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'

export interface EmptyStateAction {
  label: string
  onClick: () => void
}

export interface EmptyStateViewProps {
  icon: ReactNode
  title: string
  description: string
  action?: EmptyStateAction
}

export function EmptyStateView({
  icon,
  title,
  description,
  action,
}: EmptyStateViewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <EmptyStateRoot
        p="12"
        borderRadius="xl"
        border="1px dashed"
        borderColor="border.default"
        backdropFilter="blur(12px)"
        bg="bg.card"
      >
        <EmptyStateContent>
          <EmptyStateIndicator color="action.primary" boxSize="60px">
            {icon}
          </EmptyStateIndicator>
          <EmptyStateTitle
            fontFamily="heading"
            fontSize="1.3rem"
            color="text.primary"
          >
            {title}
          </EmptyStateTitle>
          <EmptyStateDescription
            fontSize="sm"
            color="text.muted"
            fontWeight="light"
            maxW="240px"
          >
            {description}
          </EmptyStateDescription>
          {action && (
            <Button
              borderRadius="full"
              bg="action.primary"
              color="action.primary.text"
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          )}
        </EmptyStateContent>
      </EmptyStateRoot>
    </motion.div>
  )
}
