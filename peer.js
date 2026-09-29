import Hyperswarm from 'hyperswarm'
import b4a from 'b4a'
import readline from 'node:readline'

const topicName = process.argv[2] || 'bren-p2p-demo'
const name = process.argv[3] || `peer-${process.pid}`

const swarm = new Hyperswarm()
const topic = Buffer.alloc(32)
topic.write(topicName)

const peers = new Set()

console.log(`me: ${name}`)
console.log(`topic: ${topicName}`)
console.log(`public key: ${b4a.toString(swarm.keyPair.publicKey, 'hex').slice(0, 16)}…`)

swarm.on('connection', (conn) => {
  const remote = b4a.toString(conn.remotePublicKey, 'hex').slice(0, 16)
  peers.add(conn)
  console.log(`[connected] ${remote}…  peers=${peers.size}`)

  conn.on('data', (data) => process.stdout.write(data.toString()))
  conn.on('error', () => {})
  conn.on('close', () => {
    peers.delete(conn)
    console.log(`[closed] ${remote}…  peers=${peers.size}`)
  })
})

const discovery = swarm.join(topic, { server: true, client: true })
await discovery.flushed()
console.log('joined DHT. waiting for a second peer…')

const rl = readline.createInterface({ input: process.stdin })
rl.on('line', (line) => {
  const msg = `${name}: ${line}\n`
  process.stdout.write(msg)
  for (const conn of peers) conn.write(msg)
})

async function shutdown() {
  await swarm.destroy()
  process.exit(0)
}
process.on('SIGINT', shutdown)
