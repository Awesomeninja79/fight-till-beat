import { createJamendoHandler } from '../server/jamendo.js'

export default createJamendoHandler(() => process.env.JAMENDO_CLIENT_ID ?? '')
