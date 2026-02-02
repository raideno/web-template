import React from 'react'

import { Badge, Container, Flex, TextArea } from '@radix-ui/themes'
import type { ControllerParams as ControllerProps } from '@raideno/auto-form/registry'

export interface TextAreaWithSuggestionsControllerFactoryParams {
  suggestions?: Array<string>
  rows?: number
}

export const TextAreaWithSuggestionsControllerFactory = (
  params?: TextAreaWithSuggestionsControllerFactoryParams,
) => {
  const TextAreaWithSuggestionsController: React.FC<
    ControllerProps<any, string>
  > = (props) => {
    const value = props.field.value || ''
    const defaultValue = props.defaultValue

    const handleValueChange = (
      event: React.ChangeEvent<HTMLTextAreaElement>,
    ) => {
      props.field.onChange(event.target.value)
    }

    const handleSuggestionClick = (suggestion: string) => {
      props.field.onChange(suggestion)
    }

    const showSuggestions =
      params?.suggestions &&
      params.suggestions.length > 0 &&
      value.trim() === ''

    return (
      <div className="relative w-full">
        <TextArea
          size="3"
          value={value}
          disabled={Boolean(props.meta?.disabled)}
          defaultValue={defaultValue}
          onChange={handleValueChange}
          placeholder={props.meta?.placeholder}
          rows={params?.rows || 4}
        />
        <Container display={{ initial: 'none', sm: 'initial' }}>
          {showSuggestions && params.suggestions && (
            <div className="absolute inset-0 pointer-events-none flex items-end p-3">
              <Flex gap="2" wrap="wrap" className="pointer-events-auto">
                {params.suggestions.map((suggestion, index) => (
                  <Badge
                    key={index}
                    size="2"
                    variant="soft"
                    style={{ cursor: 'pointer' }}
                    className="hover:brightness-95 transition-all"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </Badge>
                ))}
              </Flex>
            </div>
          )}
        </Container>
      </div>
    )
  }

  return TextAreaWithSuggestionsController
}
