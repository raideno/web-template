import { Box, Card, Flex, Grid, Heading, Text } from '@radix-ui/themes'
import type { ControllerParams as ControllerProps } from '@raideno/auto-form/registry'

import type { Doc } from '@/convex.generated/dataModel'
import { cn } from '@/lib/utils'

export interface PresetControllerFactoryParams {
  presets: Array<Doc<'presets'>>
  handlePresetClick?: (
    props: ControllerProps<any, string>,
    preset: Doc<'presets'>,
  ) => void
}

export const PresetControllerFactory = (
  params: PresetControllerFactoryParams,
) => {
  const PresetController: React.FC<ControllerProps<any, string>> = (props) => {
    const value = props.field.value

    const handleClick = (preset: Doc<'presets'>) => {
      props.field.onChange(preset._id)

      if (params.handlePresetClick) {
        params.handlePresetClick(props, preset)
      }
    }

    return (
      <Grid columns={{ initial: '1', sm: '2', lg: '3' }} gap="4">
        {params.presets.map((preset) => (
          <Card
            key={preset._id}
            onClick={handleClick.bind(null, preset)}
            style={{ cursor: 'pointer' }}
            className={cn(
              'hover:brightness-95 hover:outline hover:outline-(--accent-9) transition-all',
              value === preset._id && 'outline outline-(--accent-9)',
            )}
          >
            <Flex direction="column" gap="3">
              <Text size="6">{preset.icon}</Text>
              <Box>
                <Heading size="4">{preset.title}</Heading>
                <Text size="2" color="gray" className="line-clamp-1">
                  {preset.description}
                </Text>
              </Box>
            </Flex>
          </Card>
        ))}
      </Grid>
    )
  }
  return PresetController
}
