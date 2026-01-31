import { MinusIcon, PlusIcon } from '@radix-ui/react-icons'
import { Box, IconButton, Text, TextField } from '@radix-ui/themes'
import { startCase } from 'lodash'

import type { ControllerParams as ControllerProps } from '@raideno/auto-form/registry'

export interface IntervalInputControllerFactoryParams {
  frequencyFieldName: string
}

export const IntervalInputControllerFactory = (
  params: IntervalInputControllerFactoryParams,
) => {
  const IntervalInputController: React.FC<ControllerProps<any, number>> = (
    props,
  ) => {
    const value = props.field.value
    const defaultValue = props.defaultValue

    const handleValueDecrement = () => {
      props.field.onChange(Math.max(1, value - 1))
    }

    const handleValueIncrement = () => {
      props.field.onChange(value + 1)
    }

    const frequency = props.context.form.getValues(params.frequencyFieldName)

    const name =
      frequency === 'daily' ? 'day' : frequency === 'weekly' ? 'week' : 'month'

    return (
      <Box className="grid! grid-cols-[auto_1fr_auto] gap-2">
        <IconButton
          variant="outline"
          size={'3'}
          type="button"
          onClick={handleValueDecrement}
        >
          <MinusIcon />
        </IconButton>
        <TextField.Root
          size="3"
          value={value}
          defaultValue={defaultValue}
          placeholder={props.meta?.placeholder}
          disabled={true}
        >
          <TextField.Slot side="left">
            A{' '}
            <Text weight={'bold'}>
              Message <Text>Every</Text>
            </Text>
          </TextField.Slot>
          <TextField.Slot side="right">
            <Text>
              {startCase(name)}
              {value === 1 ? '' : 's'}
            </Text>
          </TextField.Slot>
        </TextField.Root>
        <IconButton
          variant="outline"
          size={'3'}
          type="button"
          onClick={handleValueIncrement}
        >
          <PlusIcon />
        </IconButton>
      </Box>
    )
  }

  return IntervalInputController
}
