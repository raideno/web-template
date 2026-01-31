import { Box, Button, Grid, Text } from '@radix-ui/themes'

import type { ControllerParams as ControllerProps } from '@raideno/auto-form/registry'

const DAYS = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
] as const

export const DaysOfWeekInputController: React.FC<
  ControllerProps<any, undefined | Array<number>>
> = (props) => {
  const value = props.field.value

  const handleToggleDay = (dayValue: number) => {
    const newValue =
      value && value.includes(dayValue)
        ? value.filter((d) => d !== dayValue)
        : [...(value || []), dayValue].sort()

    props.field.onChange(newValue)
  }

  const frequencyLabel =
    !value || value.length === 0
      ? 'Select days'
      : value.length === 7
        ? 'Daily (All days)'
        : value.length === 1
          ? 'Weekly'
          : `${value.length}x per week`

  return (
    <Box>
      <Grid
        columns={{ initial: '3', lg: '7' }}
        rows={{ initial: '3', lg: '1' }}
        gap={'2'}
      >
        {DAYS.map((day) => (
          <Button
            key={day.value}
            size="2"
            variant={value && value.includes(day.value) ? 'classic' : 'outline'}
            onClick={() => handleToggleDay(day.value)}
            type="button"
            className="flex-1 w-full"
          >
            {day.label}
          </Button>
        ))}
      </Grid>
      <Box>
        <Text weight="bold" size="2" color="gray">
          {frequencyLabel}
        </Text>
      </Box>
    </Box>
  )
}
