import { app } from './index.js'

// Keep the API process restartable when project environment variables change.
const PORT = Number(process.env.PORT ?? 3001)
app.listen(PORT, () => console.log(`[Koru API] Running on port ${PORT}`))
