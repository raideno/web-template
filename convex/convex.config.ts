import rateLimiter from '@convex-dev/rate-limiter/convex.config.js'
import twilio from '@convex-dev/twilio/convex.config'
import { defineApp } from 'convex/server'

const app = defineApp()

app.use(twilio)
app.use(rateLimiter)

export default app
