import { Box, Button, Card, Flex, Text } from '@radix-ui/themes'
import { Link } from '@tanstack/react-router'

export interface FooterProps {}

export const Footer: React.FC<FooterProps> = () => {
  const year = new Date().getFullYear()

  return (
    <Card className="p-0!">
      <Box p="4">
        <Flex direction="column" gap={'1'} align="center">
          <Box>
            <Text size={'2'} color="gray">
              © {year} closeby.tel. All rights reserved.
            </Text>
          </Box>

          <Box>
            <Flex gap={'2'} justify="center">
              <Link to="/pages/contact">
                <Button
                  size={'1'}
                  variant="outline"
                  className="line-clamp-1"
                  color="gray"
                >
                  Contact
                </Button>
              </Link>
              <Link to="/pages/about">
                <Button
                  size={'1'}
                  variant="outline"
                  className="line-clamp-1"
                  color="gray"
                >
                  About
                </Button>
              </Link>
              <Link to="/pages/terms-of-service">
                <Button
                  size={'1'}
                  variant="outline"
                  className="line-clamp-1"
                  color="gray"
                >
                  Terms
                </Button>
              </Link>
              <Link to="/pages/privacy-policy">
                <Button
                  size={'1'}
                  variant="outline"
                  className="line-clamp-1"
                  color="gray"
                >
                  Privacy
                </Button>
              </Link>
            </Flex>
          </Box>
        </Flex>
      </Box>
    </Card>
  )
}
