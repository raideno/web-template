'use client'

import { Toaster as Sonner } from 'sonner'

import type { ToasterProps } from 'sonner'

import { useTheme } from '@/contexts/react/theme'
import {
  CheckCircledIcon,
  CrossCircledIcon,
  ExclamationTriangleIcon,
  InfoCircledIcon,
} from '@radix-ui/react-icons'
import { Spinner } from '@radix-ui/themes'

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      icons={{
        success: <CheckCircledIcon className="size-4" />,
        info: <InfoCircledIcon className="size-4" />,
        warning: <ExclamationTriangleIcon className="size-4" />,
        error: <CrossCircledIcon className="size-4" />,
        loading: <Spinner className="size-4 animate-spin" />,
      }}
      style={
        {
          '--normal-bg': 'var(--color-background)!',
          '--normal-text': 'black!',
          '--normal-border': 'var(--gray-a7)!',
          '--border-radius': 'var(--radius-4)!',
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
