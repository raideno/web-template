import { MagnifyingGlassIcon } from '@radix-ui/react-icons'
import {
  Box,
  Card,
  Dialog,
  Flex,
  Grid,
  Heading,
  Text,
  TextField,
} from '@radix-ui/themes'
import React from 'react'

import type { Doc } from '@/convex.generated/dataModel'
import { cn } from '@/lib/utils'

export interface PresetDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  presets: Array<Doc<'presets'>>
  onSelectPreset: (preset: Doc<'presets'>) => void
}

export const PresetDialog: React.FC<PresetDialogProps> = ({
  open,
  onOpenChange,
  presets,
  onSelectPreset,
}) => {
  const [searchQuery, setSearchQuery] = React.useState('')

  const filteredPresets = React.useMemo(() => {
    if (!searchQuery.trim()) return presets

    const query = searchQuery.toLowerCase()
    return presets.filter(
      (preset) =>
        preset.title.toLowerCase().includes(query) ||
        preset.description.toLowerCase().includes(query),
    )
  }, [presets, searchQuery])

  const handleSelectPreset = (preset: Doc<'presets'>) => {
    onSelectPreset(preset)
    onOpenChange(false)
    setSearchQuery('')
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content size="4">
        <Box mb="4">
          <Dialog.Title>
            <Heading>Load from Preset</Heading>
          </Dialog.Title>
          <Dialog.Description>
            <Text color="gray">
              Select a preset to quickly configure your assistant's personality
              traits.
            </Text>
          </Dialog.Description>
        </Box>

        <Box mb="4">
          <TextField.Root
            placeholder="Search presets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="3"
          >
            <TextField.Slot>
              <MagnifyingGlassIcon height="16" width="16" />
            </TextField.Slot>
          </TextField.Root>
        </Box>

        <Box style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {filteredPresets.length === 0 ? (
            <Box py="8">
              <Text color="gray" align="center">
                No presets found
              </Text>
            </Box>
          ) : (
            <Grid columns={{ initial: '1', sm: '2' }} gap="4">
              {filteredPresets.map((preset) => (
                <Card
                  key={preset._id}
                  onClick={() => handleSelectPreset(preset)}
                  style={{ cursor: 'pointer' }}
                  className={cn(
                    'hover:brightness-95 hover:outline hover:outline-(--accent-9) transition-all',
                  )}
                >
                  <Flex direction="column" gap="3">
                    <Text size="6">{preset.icon}</Text>
                    <Box>
                      <Heading size="4">{preset.title}</Heading>
                      <Text size="2" color="gray" className="line-clamp-2">
                        {preset.description}
                      </Text>
                    </Box>
                  </Flex>
                </Card>
              ))}
            </Grid>
          )}
        </Box>
      </Dialog.Content>
    </Dialog.Root>
  )
}
