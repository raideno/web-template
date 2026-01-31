import { Box, Card, Heading, Skeleton, Text } from '@radix-ui/themes'

export interface PageHeaderCardProps {
  title: string
  description: string
  isLoading?: boolean
}

export const PageHeaderCard: React.FC<PageHeaderCardProps> = ({
  title,
  description,
  isLoading = false,
}) => {
  if (isLoading) {
    return <PageHeaderCardSkeleton />
  }

  return (
    <Card size={'4'} className="p-0!">
      <Box p={'4'}>
        <Heading>{title}</Heading>
        <Text className="line-clamp-1" color="gray">
          {description}
        </Text>
      </Box>
    </Card>
  )
}

export const PageHeaderCardSkeleton: React.FC = () => {
  return (
    <Card size={'4'} className="p-0!">
      <Box p={'4'}>
        <Skeleton mb="1" height="30px" width="75%" maxWidth={'256px'} />
        <Skeleton height="20px" width="100%" />
      </Box>
    </Card>
  )
}
