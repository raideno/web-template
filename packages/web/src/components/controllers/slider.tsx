import { IconButton, Slider, Text } from '@radix-ui/themes'

import type {
  ControllerParams as ControllerProps,
  RenderParams as RendererProps,
} from '@raideno/auto-form/registry'

export interface SliderControllerFactoryParams {
  max?: number
  min?: number
}

export const SliderControllerFactory = (
  params?: SliderControllerFactoryParams,
) => {
  const SliderController: React.FC<ControllerProps<any, number>> = (props) => {
    const defaultValue = props.defaultValue ? [props.defaultValue] : undefined

    const handleValueChange = (newValue: [number]) => {
      props.field.onChange(newValue[0])
    }

    return (
      <div>
        <Slider
          size={'3'}
          min={params?.min}
          max={params?.max}
          value={[props.field.value]}
          defaultValue={defaultValue}
          onValueChange={handleValueChange}
        />
      </div>
    )
  }

  return SliderController
}

export interface SliderRendererFactoryParams {
  icon: React.ReactNode
}

export const SliderRendererFactory = (params?: SliderRendererFactoryParams) => {
  const SliderRenderer: React.FC<RendererProps<any, number>> = (props) => {
    const value = props.field.value

    return (
      <div className="flex flex-col gap-2 w-full">
        <div className="flex flex-row items-center justify-between">
          <div className="w-full flex items-center gap-2">
            <IconButton variant="classic">{params?.icon}</IconButton>
            <div>
              <div>
                <Text>{props.fieldConfig.label}</Text>
              </div>
              {props.meta?.description && (
                <Text color="gray" size={'2'}>
                  {props.meta.description}
                </Text>
              )}
            </div>
          </div>
          <Text weight={'bold'}>{value}</Text>
        </div>
        <div>{props.controller}</div>
      </div>
    )
  }
  return SliderRenderer
}
