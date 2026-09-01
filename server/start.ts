import { app } from './index'

const PORT = Number(process.env.PORT ?? 3001)
app.listen(PORT, () => console.log(`[Koru API] Running on port ${PORT}`))