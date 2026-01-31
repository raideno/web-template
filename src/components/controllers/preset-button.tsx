import { Button } from '@radix-ui/themes'
import React from 'react'
import type { ControllerParams as ControllerProps } from '@raideno/auto-form/registry'

import type { Doc } from '@/convex.generated/dataModel'
import { PresetDialog } from '@/components/layout/preset-dialog'

export interface PresetButtonControllerFactoryParams {
  presets: Array<Doc<'presets'>>
  handlePresetClick?: (
    props: ControllerProps<any, string>,
    preset: Doc<'presets'>,
  ) => void
}

export const PresetButtonControllerFactory = (
  params: PresetButtonControllerFactoryParams,
) => {
  const PresetButtonController: React.FC<ControllerProps<any, string>> = (
    props,
  ) => {
    const [isPresetDialogOpen, setIsPresetDialogOpen] = React.useState(false)

    const handleSelectPreset = (preset: Doc<'presets'>) => {
      props.field.onChange(preset._id)

      if (params.handlePresetClick) {
        params.handlePresetClick(props, preset)
      }
    }

    return (
      <>
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsPresetDialogOpen(true)}
        >
          Load from Preset
        </Button>

        <PresetDialog
          open={isPresetDialogOpen}
          onOpenChange={setIsPresetDialogOpen}
          presets={params.presets}
          onSelectPreset={handleSelectPreset}
        />
      </>
    )
  }
  return PresetButtonController
}
