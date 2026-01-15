import { ThemeColorController } from '@src/_workspace/controllers/theme-color/ThemeColorController'

import { Router } from 'express'

const themeColorRoutes = Router()

themeColorRoutes.get('/getThemeColor', ThemeColorController.getThemeColor)

export default themeColorRoutes
