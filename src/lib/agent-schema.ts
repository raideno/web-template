import { MetadataRegistry } from '@raideno/auto-form/registry'
import { z } from 'zod'

import type { Doc } from '@/convex.generated/dataModel'

import type { AnyController, AnyRenderer } from '@/components/controllers'
import { PresetButtonControllerFactory } from '@/components/controllers/preset-button'
import {
  SliderControllerFactory,
  SliderRendererFactory,
} from '@/components/controllers/slider'

export const createAgentSchema = (presets: Array<Doc<'presets'>>) => {
  if (presets.length === 0) {
    return z.object({
      name: z
        .string()
        .min(1, "Please enter your assistant's name")
        .register(MetadataRegistry, {
          placeholder: 'e.g. Alex',
        }),
      instructions: z
        .string()
        .optional()
        .nullable()
        .register(MetadataRegistry, {
          type: 'textarea',
          placeholder: 'Describe tone, style, what to focus on…',
        }),
    })
  }

  const allTraitsMap = new Map<string, Doc<'presets'>['traits'][number]>()

  presets.forEach((preset) => {
    preset.traits.forEach((trait) => {
      if (!allTraitsMap.has(trait.id)) {
        allTraitsMap.set(trait.id, trait)
      }
    })
  })

  const traitFields = Object.fromEntries(
    Array.from(allTraitsMap.values()).map((trait) => [
      trait.id,
      z
        .number()
        .min(0)
        .max(10)
        .register(MetadataRegistry, {
          label: trait.name,
          description: trait.description,
          controller: SliderControllerFactory({
            min: 0,
            max: 10,
          }) as AnyController,
          renderer: SliderRendererFactory({
            icon: trait.icon,
          }) as AnyRenderer,
        }),
    ]),
  ) as Record<string, z.ZodTypeAny>

  const presetIds = presets.map((p) => p._id)

  return z.object({
    name: z
      .string()
      .min(1, "Please enter your assistant's name")
      .register(MetadataRegistry, {
        placeholder: 'e.g. Alex',
      }),
    preset: z
      .enum(
        presetIds.length > 0
          ? ([presetIds[0], ...presetIds.slice(1)] as [
              string,
              ...Array<string>,
            ])
          : (['none'] as [string, ...Array<string>]),
      )
      .optional()
      .nullable()
      .register(MetadataRegistry, {
        label: 'Personality Traits',
        description: 'Load a preset or customize individual traits.',
        controller: PresetButtonControllerFactory({
          presets,
          handlePresetClick: (props, preset) => {
            preset.traits.forEach((trait) => {
              props.context.form.setValue(trait.id, trait.intensity)
            })
            props.context.form.setValue('name', preset.name)
            props.context.form.setValue('instructions', preset.instructions)
          },
        }) as AnyController,
      }),
    ...traitFields,
    instructions: z.string().optional().nullable().register(MetadataRegistry, {
      type: 'textarea',
      placeholder: 'Describe tone, style, what to focus on…',
    }),
  })
}

export const DEFAULT_TRAIT_INTENSITY = 5

export const traitDefaultValues = (presets: Array<Doc<'presets'>>) => {
  if (presets.length === 0) return {}

  const allTraitsMap = new Map<string, number>()

  presets.forEach((preset) => {
    preset.traits.forEach((trait) => {
      if (!allTraitsMap.has(trait.id)) {
        allTraitsMap.set(trait.id, DEFAULT_TRAIT_INTENSITY)
      }
    })
  })

  return Object.fromEntries(allTraitsMap)
}

export const getAllTraits = (presets: Array<Doc<'presets'>>) => {
  const allTraitsMap = new Map<string, Doc<'presets'>['traits'][number]>()

  presets.forEach((preset) => {
    preset.traits.forEach((trait) => {
      if (!allTraitsMap.has(trait.id)) {
        allTraitsMap.set(trait.id, trait)
      }
    })
  })

  return Array.from(allTraitsMap.values())
}

export type AgentSchemaType = ReturnType<typeof createAgentSchema>
