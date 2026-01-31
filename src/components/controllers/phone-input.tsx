import { MobileIcon } from '@radix-ui/react-icons'
import { Box, TextField } from '@radix-ui/themes'

import phones from './phone-input.json'

import type { ControllerParams as ControllerProps } from '@raideno/auto-form/registry'

export const PhoneInputController: React.FC<
  ControllerProps<any, [string, string] | undefined>
> = (props) => {
  const value = props.field.value
  const defaultValue = props.defaultValue

  const emoji =
    (value &&
      phones
        .filter((p) => p.dial_code === `+${value[0]}`)
        .map((p) => p.flag)
        .join('')) ||
    '🌐'

  const handlePhoneIndicatorChange = (newPhoneIndicator: string) => {
    const newValue: [string, string] = [
      newPhoneIndicator,
      value ? value[1] : '',
    ]
    props.field.onChange(newValue)
  }

  const handlePhoneNumberChange = (newPhoneNumber: string) => {
    const newValue: [string, string] = [value ? value[0] : '', newPhoneNumber]
    props.field.onChange(newValue)
  }

  return (
    <Box className="grid! grid-cols-[96px_1fr] gap-2">
      <TextField.Root
        size={'3'}
        value={value && value[0]}
        onChange={(event) => handlePhoneIndicatorChange(event.target.value)}
        defaultValue={defaultValue && defaultValue[0]}
        type="number"
        placeholder="Country Code"
        disabled={Boolean(props.meta?.disabled)}
      >
        <TextField.Slot side="right">{emoji}</TextField.Slot>
      </TextField.Root>
      <TextField.Root
        size="3"
        value={value && value[1]}
        onChange={(event) => handlePhoneNumberChange(event.target.value)}
        defaultValue={defaultValue && defaultValue[1]}
        type="number"
        placeholder={'123456789'}
        disabled={Boolean(props.meta?.disabled)}
      >
        <TextField.Slot side="left">
          <MobileIcon />
        </TextField.Slot>
      </TextField.Root>
    </Box>
  )
}
