import { Box, Card, Heading, Separator, Text } from '@radix-ui/themes'

export interface TrophiesCardProps {}

export const TrophiesCard: React.FC<TrophiesCardProps> = () => {
  return (
    <Card size="4" className="p-0!">
      <Box p="4">
        <Heading>Trophies</Heading>
        <Text color="gray">
          Earn trophies by reaching milestones and unlocking features as you use
          the app.
        </Text>
      </Box>

      <Separator size="4" orientation="horizontal" className="w-full!" />

      <Box p="4">
        <div>Trophies Scrollable List. Not obtained yet will be blured.</div>
      </Box>
    </Card>
  )
}
