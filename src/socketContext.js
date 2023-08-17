import React, { useState } from 'react'
import io, { Socket } from 'socket.io-client'

const socket = io('https://kale.kapsulteknoloji.org/video-chat-ms')

export const store = React.createContext()
const [id, setId] = useState()
export const storeProvider = ({ children }) => {
  socket.on('me', (id) => setId(id))
}
