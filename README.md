# p2p-two-peers

Two terminals. One shared topic. No server.

Two Node.js processes find each other through the **Hyperswarm DHT** (the same networking stack behind Pear / Holepunch), open a direct, end-to-end encrypted socket, and chat. There is no backend, no relay I run, no database, no API keys.

## Requirements

- Node.js 18+ (Node 20+ recommended)

## Install

```bash
git clone https://github.com/BrenPalav/p2p-two-peers.git
cd p2p-two-peers
npm install
```

## Run

Terminal 1:

```bash
npm run alice
```

Terminal 2:

```bash
npm run bob
```

Or with your own topic and name:

```bash
node peer.js <topic> <name>
node peer.js my-room carla
```

Both peers must use the **same topic** and **different names**.

## What you should see

```
me: alice
topic: demo-room
public key: 4b07a6ca2e3e7e31…
joined DHT. waiting for a second peer…
[connected] 1a7c0edcdd863f45…  peers=1
bob: hola
alice: hi bob
```

- `[connected]` in both terminals, with the other peer's short public key
- Type a line in one terminal → it appears in the other (both directions)
- `Ctrl+C` in one terminal → `[closed]` in the other

## How it works

1. The topic name is written into a 32-byte buffer (Hyperswarm topics are 32 bytes).
2. `swarm.join(topic, { server: true, client: true })` announces and looks up that topic on the DHT.
3. On `connection`, the socket is stored in a `Set`; incoming data goes to stdout.
4. Each stdin line is prefixed with your name and written to every connected socket.

All in one file: [`peer.js`](./peer.js).

## Troubleshooting

- **Same topic?** A typo in the topic means the peers never meet.
- **Wait 10–20 seconds.** DHT discovery and hole-punching can take a moment.
- **Node version:** run `node -v`. Node 20+ is preferred.
- **Restrictive networks** (corporate firewalls, some VPNs, cloud sandboxes that block UDP) can prevent hole-punching. Try a home network or phone hotspot.
- **Install errors:** `hyperswarm` pulls a native UDP module (`udx-native`) that ships prebuilt binaries. If install fails, check `node -v`, delete `node_modules` and `package-lock.json`, then `npm install` again.

## Demo

TODO: Loom unlisted URL

## Next step

Replace the ephemeral chat with an **append-only log** (Hypercore) so messages are replicated and persisted between peers, and run it on **Bare / Pear** instead of Node.
