import React, { useEffect, useRef, useState } from 'react'
import Peer from 'peerjs'
import io from 'socket.io-client'
import { useNavigate, useParams } from 'react-router-dom'

const Meet = () => {
  const [shouldReload, setShouldReload] = useState(true)
  const [renderCount, setRenderCount] = useState(0)
  const [callList, setCallList] = useState([])
  const [answerList, setAnswerList] = useState([])

  const socket = io('https://zoom-backend-b2ys.onrender.com/')
  // const socket = io('http://localhost:5001')
  const { name } = useParams()
  const { room } = useParams()

  const [ids, setIds] = useState('')
  const [media, setMedia] = useState(null)

  const mydiv = useRef()
  const myvideo = useRef()
  const alertbox = useRef()

  const callRef = useRef()
  const peer = new Peer() // peer js
  const navigate = useNavigate()

  var myvideoStrm
  // const callList = []
  // const answerList = []

  // useEffect(() => {
  //   if (shouldReload) {
  //     const timer = setTimeout(() => {
  //       window.location.reload()
  //     }, 5000)

  //     return () => clearTimeout(timer)
  //   }
  // }, [shouldReload])

  useEffect(() => {
    const debouncedRender = setTimeout(() => {
      setRenderCount((prevCount) => prevCount + 1)
    }, 5000)

    return () => {
      clearTimeout(debouncedRender)
    }
  }, [renderCount])

  // create the video box
  const append = (video, stream, name) => {
    video.srcObject = stream
    const div = document.createElement('div')
    const h1 = document.createElement('h1')
    h1.classList.add('text-3xl', 'text-center', 'absolute', 'capitalize')
    video.addEventListener('loadedmetadata', () => {
      video.play()
    })
    h1.textContent = name
    div.classList.add('border', 'rounded', 'overflow-hidden', 'bg-slate-400', 'overflow-hidden', 'relative', 'h-fit')
    div.appendChild(h1)
    div.appendChild(video)
    mydiv.current.appendChild(div)
    RemoveUnusedDivs()
  }

  useEffect(() => {
    // generate the user id and send it to other users
    peer.once('open', (id) => {
      setIds(id)
      socket.emit('join', room, id, name)
    })

    // get the user webcam access
    navigator.mediaDevices.getUserMedia({ video: { height: 230, width: 300 }, audio: true }).then((strm) => {
      myvideoStrm = strm
      setMedia(strm)
      if (myvideo.current) {
        myvideo.current.srcObject = strm
      }
    })
  }, [])

  // answering the call
  peer.on('call', (call, id) => {
    socket.on('addname', (username, id) => {
      //get the otheruser name who are calling
      call.answer(myvideoStrm)
      const video = document.createElement('video')
      call.on('stream', (remote) => {
        console.log(remote.getVideoTracks()[0].enabled)
        console.log(remote)
        append(video, remote, username)
      })
      call.on('close', () => {
        video.remove()
        RemoveUnusedDivs()
      })
      callRef.current = call
      console.log('call', call)
      answerList.push({ call })
      setAnswerList(answerList)
    })
  })

  socket.on('user-connect', (id, size, username) => {
    // console.log(`new user : ${id}`);
    // console.log('new user')
    const found = callList.some((el) => el.id === id)
    // check the user is already in call or not
    if (!found) {
      call(id, username, myvideoStrm)
    }
    socket.emit('tellname', name, id)
  })

  // on other user disconnect or leave the meeting remove him from meeting
  socket.on('user-disconnected', (id) => {
    console.log('disconnected')
    const index = callList.findIndex((peer) => (peer.id = id))
    const index2 = answerList.findIndex((peer) => (peer.peer = id))
    console.log(index2)
    if (index > -1) {
      console.log(callList[index].call)
      callList[index].call.close()
      callList.splice(index, 1)
      setCallList(callList)
    }
    if (index2 > -1) {
      answerList[index2].call.close()
      answerList.splice(index2, 1)
      setAnswerList(answerList)
    }
  })

  // making a call on other join the room
  const call = (id, username, myvideoStrm) => {
    const call = peer.call(id, myvideoStrm)
    const video = document.createElement('video')
    call.on('stream', (remote) => {
      console.log(callList.includes(id))
      append(video, remote, username)
    })
    call.on('close', () => {
      video.remove()
      RemoveUnusedDivs()
    })
    // if (callList.filter((object) => object.peer === myvideoStrm)) return
    callList.push({ id, call }) // add in call list
    setCallList(callList)
  }

  // remove the blank box in case of there present
  const RemoveUnusedDivs = () => {
    let alldivs = mydiv.current.getElementsByTagName('div')
    for (var i = 0; i < alldivs.length; i++) {
      let e = alldivs[i].getElementsByTagName('video').length
      if (e === 0) {
        alldivs[i].remove()
      }
    }
  }

  // ending a call
  const leave = async () => {
    socket.emit('user-left', ids, room)
    media.getTracks().forEach(function (track) {
      track.stop()
    })
    window.location.replace('http://localhost:3000/')
  }

  return (
    <div className="bg-slate-200 py-9 px-4 flex h-screen md:p-8">
      <div className="flex-1 flex container mx-auto flex-col ">
        <div className=" p-2 box-container flex-1 my-4 flex flex-wrap  justify-center gap-4 mx-auto overflow-scroll " ref={mydiv}>
          <div className="left border h-fit rounded overflow-hidden bg-slate-400 relative">
            <h1 className="text-3xl text-center absolute capitalize">You</h1>
            <video muted={true} autoPlay={true} ref={myvideo}></video>
          </div>
        </div>
        <div className="footer flex container  justify-center rounded mx-auto gap-6 bg-gray-300 p-3 md:gap-8 h-[10vh]   ">
          <div onClick={leave} className="cursor-pointer flex justify-center rounded-full items-center p-4 bg-red-600 w-[35vw]">
            <i className="fa-solid fa-phone text-[4vh]"></i>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Meet
