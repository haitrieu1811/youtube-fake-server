import { Router } from 'express'

import { serveImageController, serveM3u8Controller, serveSegmentHLSController } from '~/controllers/media.controllers'

const staticRouter = Router()

// Serve image
staticRouter.get('/images/:name', serveImageController)

// Serve m3u8
staticRouter.get('/video-hls/:id/master.m3u8', serveM3u8Controller)

// Serve segment
staticRouter.get('/video-hls/:id/:v/:segment', serveSegmentHLSController)

export default staticRouter
