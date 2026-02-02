import { Separator } from '@radix-ui/themes'
import { OTPInput, OTPInputContext } from 'input-otp'
import * as React from 'react'

import { cn } from '@/lib/utils'

function InputOTP({
  className,
  containerClassName,
  ...props
}: React.ComponentProps<typeof OTPInput> & {
  containerClassName?: string
}) {
  return (
    <OTPInput
      data-slot="input-otp"
      containerClassName={cn(
        'flex items-center gap-2 has-disabled:opacity-50',
        containerClassName,
      )}
      className={cn('disabled:cursor-not-allowed', className)}
      {...props}
    />
  )
}

function InputOTPGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="input-otp-group"
      className={cn('flex items-center', className)}
      {...props}
    />
  )
}

function InputOTPSlot({
  index,
  className,
  ...props
}: React.ComponentProps<'div'> & {
  index: number
}) {
  const inputOTPContext = React.useContext(OTPInputContext)
  const { char, hasFakeCaret, isActive } = inputOTPContext.slots[index] ?? {}

  return (
    <div
      data-slot="input-otp-slot"
      data-active={isActive}
      className={cn(
        // 'data-[active=true]:border-ring data-[active=true]:ring-ring/50',
        'relative flex h-9 w-9 items-center justify-center',
        // 'border-input',
        // 'data-[active=true]:aria-invalid:ring-destructive/20 aria-invalid:border-destructive data-[active=true]:aria-invalid:border-destructive',
        // 'aria-invalid:border-destructive data-[active=true]:aria-invalid:border-destructive',
        'border-y border-y-(--gray-a7) border-r border-r-(--gray-a7)',
        'outline-none!',
        // 'data-[active=true]:ring-[3px]',
        'text-sm transition-all data-[active=true]:z-10',
        'first:rounded-l-(--radius-4) first:border-l first:border-l-(--gray-a7) last:rounded-r-(--radius-4)',
        'data-[active=true]:shadow-[inset_0_0_0_1px_var(--focus-8)]!',
        className,
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="animate-caret-blink bg-(--focus-8) h-4 w-px duration-1000" />
        </div>
      )}
    </div>
  )
}

function InputOTPSeparator({ ...props }: React.ComponentProps<'div'>) {
  return (
    <div data-slot="input-otp-separator" role="separator" {...props}>
      <Separator orientation={'horizontal'} />
    </div>
  )
}

export { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot }
