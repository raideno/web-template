import { Box, TextField } from '@radix-ui/themes'
import z from 'zod'

import type { ControllerParams as ControllerProps } from '@raideno/auto-form/registry'

export const TimeInputZodValidator = z.tuple([
  z.number().max(23).min(0),
  z.number().max(59).min(0),
])
export const TimeInputController: React.FC<
  ControllerProps<any, [number, number] | undefined>
> = (props) => {
  const defaultValue = props.defaultValue || [0, 0]

  const defaultTimeString = `${String(defaultValue[0]).padStart(2, '0')}:${String(defaultValue[1]).padStart(2, '0')}`

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [hours, minutes] = e.target.value.split(':')

    console.log(e.target.value)

    const newHour = parseInt(hours, 10)
    const newMinutes = parseInt(minutes, 10)

    props.field.onChange([newHour, newMinutes])
  }

  return (
    <Box>
      <TextField.Root
        type="time"
        size={'3'}
        defaultValue={defaultTimeString}
        onChange={handleTimeChange}
      />
    </Box>
  )
}
