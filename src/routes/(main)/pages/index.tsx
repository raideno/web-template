import React from 'react'
import {
  Box,
  Card,
  Container,
  Flex,
  Heading,
  Separator,
  Text,
} from '@radix-ui/themes'
import { Link, createFileRoute, useRouter } from '@tanstack/react-router'

import { PageHeaderCard } from '@/components/layout/page-header-card'

export const Route = createFileRoute('/(main)/pages/')({
  component: () => {
    const router = useRouter()

    const pages = Object.entries(router.routesByPath)
      .filter(([path]) => {
        return path.startsWith('/pages/')
      })
      .map(([path, route]) => {
        const metadata = Object.fromEntries(
          route.options
            .head()
            .meta.map(
              (
                meta: React.DetailedHTMLProps<
                  React.MetaHTMLAttributes<HTMLMetaElement>,
                  HTMLMetaElement
                >,
              ) => [meta.name, meta.content],
            ),
        )
        return {
          to: path,
          title: metadata.title,
          description: metadata.description,
        }
      })

    return (
      <Container size={'4'}>
        <Flex direction="column" gap="4">
          <PageHeaderCard
            title="Pages"
            description="Browse our informational pages."
          />
          <Card size="4" className="p-0!">
            <Flex direction="column">
              {pages.map((p, i) => (
                <Box key={p.to}>
                  <Link to={p.to} preload="intent" className="no-underline!">
                    <Box
                      className="w-full hover:backdrop-brightness-95 transition-all"
                      p="4"
                    >
                      <Flex direction="column" gap="1">
                        <Heading size="3">{p.title}</Heading>
                        <Text className="line-clamp-1" color="gray" size="2">
                          {p.description}
                        </Text>
                      </Flex>
                    </Box>
                  </Link>
                  {i !== pages.length - 1 && (
                    <Separator
                      orientation={'horizontal'}
                      size={'4'}
                      className="w-full!"
                    />
                  )}
                </Box>
              ))}
            </Flex>
          </Card>
        </Flex>
      </Container>
    )
  },
})
