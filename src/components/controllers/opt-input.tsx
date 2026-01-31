import { Text } from '@radix-ui/themes'
import type {
  ControllerParams as ControllerProps,
  RenderParams as RendererProps,
} from '@raideno/auto-form/registry'

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/otp-input'

export const OTPInputRenderer: React.FC<RendererProps<any, string>> = (
  props,
) => {
  return (
    <div className="flex flex-row justify-between items-center gap-2 w-full">
      <Text>{props.fieldConfig.label}</Text>
      <div>{props.controller}</div>
    </div>
  )
}

export interface OTPInputControllerFactoryParams {
  length: number
}

export const OTPInputControllerFactory = (
  params: OTPInputControllerFactoryParams,
) => {
  if (params.length !== 6)
    throw new Error('Only length of 6 is supported currently')

  const OTPInput: React.FC<ControllerProps<any, string>> = (props) => {
    const value = props.field.value
    const defaultValue = props.defaultValue

    const handleValueChange = (newValue: string) => {
      props.field.onChange(newValue)
    }

    return (
      <InputOTP
        value={value}
        onChange={handleValueChange}
        defaultValue={defaultValue}
        maxLength={params.length}
        placeholder={props.meta?.placeholder}
      >
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
      </InputOTP>
    )
  }

  return OTPInput
}
