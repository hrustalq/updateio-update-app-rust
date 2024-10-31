import io from 'socket.io-client'

const url = import.meta.env.VITE_API_URL
const socket = io(url, {
  transports: ['websocket'],
  path: '/socket.io',
  reconnection: true,
})

export default socket
