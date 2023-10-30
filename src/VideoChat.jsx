import React, { useEffect, useRef } from 'react';

const VideoChat = () => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStream = useRef(null);
  const peerConnection = useRef(null);


    // Function to set up a peer connection
    const createPeerConnection = () => {
      peerConnection.current = new RTCPeerConnection();

      // Add local video stream to peer connection
      localStream.current.getTracks().forEach((track) => {
        peerConnection.current.addTrack(track, localStream.current);
      });

      // Set up event handlers for peer connection
      peerConnection.current.onicecandidate = (event) => {
        // Send the ice candidate to the remote peer (via signaling server)
        if (event.candidate) {
          // Send event.candidate to the other peer (via signaling server)
        }
      };

      peerConnection.current.ontrack = (event) => {
        // When a remote stream arrives, display it in the remote video element
        remoteVideoRef.current.srcObject = event.streams[0];
      };
    };

    // Function to start the video chat
    const startVideoChat = async () => {
      try {
        // Get the user's media (video and audio)
        localStream.current = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localVideoRef.current.srcObject = localStream.current;

        // Set up peer connection
        createPeerConnection();

        // Create an offer and set it as the local description
        const offer = await peerConnection.current.createOffer();
        await peerConnection.current.setLocalDescription(offer);

        // Send the offer to the remote peer (via signaling server)
      } catch (error) {
        console.error('Error accessing user media:', error);
      }
    };

    // Function to handle receiving remote signal data (SDP offer/answer and ICE candidates)
    const handleSignalInput = async (event) => {
      const signalData = JSON.parse(event.target.value);

      if (signalData.type === 'offer') {
        // Set the remote description and create an answer
        await peerConnection.current.setRemoteDescription(signalData);
        const answer = await peerConnection.current.createAnswer();
        await peerConnection.current.setLocalDescription(answer);

        // Send the answer to the remote peer (via signaling server)
      } else if (signalData.type === 'answer') {
        // Set the remote description with the received answer
        await peerConnection.current.setRemoteDescription(signalData);
      } else if (signalData.candidate) {
        // Add the received ICE candidate to the peer connection
        await peerConnection.current.addIceCandidate(signalData);
      }
    };

 
      // Cleanup: Close the local media stream and the peer connection
      if (localStream.current) {
        localStream.current.getTracks().forEach((track) => {
          track.stop();
        });
      }
      if (peerConnection.current) {
        peerConnection.current.close();
      }
   
 

  return (
    <div>
      <h1>WebRTC Video Chat</h1>
      <div>
        <h2>Your Video</h2>
        <video ref={localVideoRef} autoPlay playsInline></video>
      </div>
      <div>
        <h2>Remote Video</h2>
        <video ref={remoteVideoRef} autoPlay playsInline></video>
      </div>
      <div>
        <h2>Signal Data from Remote Peer</h2>
        <input type="text" onChange={handleSignalInput} />
      </div>
      <button onClick={startVideoChat}>Start Video Chat</button>
    </div>
  );
};

export default VideoChat;
