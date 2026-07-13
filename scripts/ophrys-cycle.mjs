import { createOphrysStore } from '../src/ophrys-store.mjs'
import { runOphrysCycle } from '../src/ophrys-cycle.mjs'

const store = createOphrysStore()
try {
  const result = await runOphrysCycle({ store, trigger: process.env.OPHRYS_CYCLE_TRIGGER || 'scheduler' })
  console.log(JSON.stringify(result, null, 2))
} finally {
  store.close()
}
