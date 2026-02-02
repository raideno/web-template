import { ChatBubbleIcon, FileTextIcon, HomeIcon } from '@radix-ui/react-icons'
import {
  Box,
  Button,
  Card,
  Container,
  Flex,
  Heading,
  IconButton,
  Spinner,
  Text,
  Tooltip,
} from '@radix-ui/themes'
import { Link, useRouterState } from '@tanstack/react-router'
import React from 'react'

import { ClosebyTelIcon } from '../icons/closeby-tel'

export interface NavIconButtonProps {
  to: string
  label: string
  icon: React.ReactNode
  disabled?: boolean
  activeMatcher?: (pathname: string) => boolean
}

export const NavIconButton: React.FC<NavIconButtonProps> = ({
  to,
  label,
  icon,
  disabled,
  activeMatcher,
}) => {
  const { location } = useRouterState()

  const pathname = location.pathname || '/'
  const isActive = activeMatcher
    ? activeMatcher(pathname)
    : pathname === to || pathname.startsWith(to + '/')

  return (
    <Tooltip content={label} side="bottom" delayDuration={0}>
      <Link
        to={to}
        preload="intent"
        aria-label={label}
        className="m-0! w-full!"
      >
        <Container display={{ initial: 'none', md: 'initial' }}>
          <IconButton
            disabled={disabled}
            size="3"
            variant={isActive ? 'classic' : 'soft'}
            color={isActive ? 'green' : 'gray'}
            aria-label={label}
          >
            {icon}
          </IconButton>
        </Container>
        <Container display={{ initial: 'initial', md: 'none' }}>
          <Button
            className="w-full!"
            size="3"
            variant={isActive ? 'classic' : 'soft'}
            color={isActive ? 'green' : 'gray'}
            aria-label={label}
          >
            {icon}
          </Button>
        </Container>
      </Link>
    </Tooltip>
  )
}

export interface NavbarProps {}

export const Navbar: React.FC<NavbarProps> = () => {
  const { isLoading } = useRouterState()

  return (
    <Card size="2" variant="surface">
      <Flex align="center" justify="between" gap="3" wrap="wrap">
        <Link to="/">
          <Flex direction={'row'} align={'center'} gap={'2'}>
            <Box>
              <IconButton variant="classic" size={'3'}>
                <ClosebyTelIcon />
              </IconButton>
            </Box>
            <Box>
              <Heading>closeby.tel</Heading>
              <Text className="line-clamp-1" color="gray">
                Your personal AI assistant, always close by to you.
              </Text>
            </Box>
          </Flex>
        </Link>
        <Flex width={{ initial: '100%', md: 'auto' }} align="center" gap="3">
          <NavIconButton
            to={'/'}
            label={'Home'}
            icon={<HomeIcon />}
            activeMatcher={(p) => p === '/'}
          />
          <NavIconButton
            to={'/pages'}
            label={'Pages'}
            icon={<FileTextIcon />}
            activeMatcher={(p) => p === '/pages' || p.startsWith('/pages/')}
          />
          <NavIconButton
            disabled={isLoading}
            to={'/dashboard'}
            label={'Dashboard'}
            icon={isLoading ? <Spinner /> : <ChatBubbleIcon />}
            activeMatcher={(p) =>
              p === '/dashboard' || p.startsWith('/dashboard/')
            }
          />
        </Flex>
      </Flex>
    </Card>
  )
}
