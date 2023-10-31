import React, { useEffect, useRef, useState } from 'react';
import Peer from 'peerjs';

function Peeer() {
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const peer = useRef(null);

  const [userList, setUserList] = useState([]);
  const [callingPeer, setCallingPeer] = useState(null);

  useEffect(() => {
    // Initialize PeerJS
    peer.current = new Peer();

    peer.current.on('open', (id) => {
      console.log(`My peer ID is: ${id}`);
    });

    peer.current.on('call', (call) => {
      setCallingPeer(call.peer); // Store the peer ID of the caller
      // Handle incoming call (e.g., show a notification)
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

  const endCall = () => {
    // End the call and clean up resources
    // Close video streams and reset the UI
  };

  return (
    <div>
      <h2>Video Chat App</h2>
      <div className="video-container">
        <video ref={localVideoRef} autoPlay muted></video>
        <video ref={remoteVideoRef} autoPlay></video>
      </div>
      <button onClick={callPeer}>Call a Peer</button>
      {callingPeer && (
        <div>
          Calling {callingPeer}...
          <button onClick={endCall}>End Call</button>
        </div>
      )}
      <div>
        <h3>User List</h3>
        <ul>
          {userList.map((user) => (
            <li key={user.id}>
              {user.name}{' '}
              <button onClick={() => callPeer(user.id)}>Call</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Peeer;
