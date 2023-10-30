import React, { useEffect, useRef } from 'react';
import Peer from 'peerjs';

function Peeer() {
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const peer = useRef(null);

  useEffect(() => {
    // Initialize PeerJS
    peer.current = new Peer();

    peer.current.on('open', (id) => {
      console.log(`My peer ID is: ${id}`);
    });

    peer.current.on('call', (call) => {
      // Answer the call and set up the video stream
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream) => {
          call.answer(stream);
          call.on('stream', (remoteStream) => {
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = remoteStream;
            }
          });
        })
        .catch((error) => {
          console.error('Error accessing the camera and microphone:', error);
        });
    });

    // Access the local camera and microphone
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      })
      .catch((error) => {
        console.error('Error accessing the camera and microphone:', error);
      });

    return () => {
      peer.current.destroy();
    };
  }, []);

  const callPeer = () => {
    const remotePeerId = prompt('Enter the ID of the peer you want to call');
    if (!remotePeerId) return;

    const localStream = localVideoRef.current.srcObject;

    const call = peer.current.call(remotePeerId, localStream);
    call.on('stream', (remoteStream) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
    });
  };

  return (
    <div>
      <h2>Video Chat App</h2>
      <div className="video-container">
        <video ref={localVideoRef} autoPlay muted></video>
        <video ref={remoteVideoRef} autoPlay></video>
      </div>
      <button onClick={callPeer}>Call a Peer</button>
    </div>
  );
}

export default Peeer;
