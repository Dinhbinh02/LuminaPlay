'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Peer, { DataConnection } from 'peerjs';

export interface WatchPartyMessage {
  type: 'SYNC' | 'CHAT' | 'PLAY' | 'PAUSE' | 'SEEK';
  currentTime?: number;
  content?: string;
  sender?: string;
}

export function useWatchParty(roomId?: string, isHost: boolean = false) {
  const [peer, setPeer] = useState<Peer | null>(null);
  const [connections, setConnections] = useState<DataConnection[]>([]);
  const [peerId, setPeerId] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<WatchPartyMessage[]>([]);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<{[key: string]: MediaStream}>({});
  const [isMicOn, setIsMicOn] = useState(false);
  
  const isMicOnRef = useRef(isMicOn);
  const localStreamRef = useRef(localStream);
  const onSyncRef = useRef<(msg: WatchPartyMessage) => void>(null);

  useEffect(() => {
    isMicOnRef.current = isMicOn;
    localStreamRef.current = localStream;
  }, [isMicOn, localStream]);

  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') return;

    const newPeer = roomId ? new Peer(roomId) : new Peer();

    newPeer.on('open', (id) => {
      setPeerId(id);
      setIsConnected(true);
      console.log('Peer ID:', id);
    });

    // Handle incoming data connections
    newPeer.on('connection', (conn) => {
      console.log('New connection from:', conn.peer);
      setConnections((prev) => {
        if (prev.find(c => c.peer === conn.peer)) return prev;
        return [...prev, conn];
      });
      
      // If mic is already on, call the new peer
      if (isMicOnRef.current && localStreamRef.current) {
        console.log('Mic is already on, calling new peer:', conn.peer);
        const call = newPeer.call(conn.peer, localStreamRef.current);
        call.on('stream', (remoteStream) => {
          setRemoteStreams(prev => ({ ...prev, [conn.peer]: remoteStream }));
        });
      }

      conn.on('data', (data) => {
        const msg = data as WatchPartyMessage;
        if (onSyncRef.current) onSyncRef.current(msg);
        setMessages((prev) => [...prev, msg]);
      });
    });

    // Handle incoming calls (Voice Chat)
    newPeer.on('call', (call) => {
      console.log('Incoming call from:', call.peer);
      call.answer(); // Answer without stream initially or with local stream if mic is on
      call.on('stream', (remoteStream) => {
        console.log('Received remote stream from:', call.peer);
        setRemoteStreams(prev => ({ ...prev, [call.peer]: remoteStream }));
      });
    });

    setPeer(newPeer);

    return () => {
      newPeer.destroy();
    };
  }, [roomId, isHost]);

  const toggleMic = useCallback(async () => {
    if (isMicOn) {
      // Turn off mic
      localStream?.getTracks().forEach(track => track.stop());
      setLocalStream(null);
      setIsMicOn(false);
      // Remove local stream from outgoing calls? PeerJS calls are usually established once.
      // For simplicity, we just stop the tracks which stops sending data.
    } else {
      // Turn on mic
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setLocalStream(stream);
        setIsMicOn(true);

        // Call all connected peers
        connections.forEach(conn => {
          if (peer && conn.open) {
            console.log('Calling peer for voice:', conn.peer);
            const call = peer.call(conn.peer, stream);
            call.on('stream', (remoteStream) => {
              setRemoteStreams(prev => ({ ...prev, [conn.peer]: remoteStream }));
            });
          }
        });
      } catch (err) {
        console.error('Failed to get local stream', err);
      }
    }
  }, [isMicOn, localStream, connections, peer]);

  const connectToHost = useCallback((hostId: string) => {
    if (!peer) return;
    const conn = peer.connect(hostId);
    
    conn.on('open', () => {
      console.log('Connected to host:', hostId);
      setConnections((prev) => {
        if (prev.find(c => c.peer === conn.peer)) return prev;
        return [...prev, conn];
      });
      setIsConnected(true);
    });

    conn.on('data', (data) => {
      const msg = data as WatchPartyMessage;
      if (onSyncRef.current) onSyncRef.current(msg);
      setMessages((prev) => [...prev, msg]);
    });
  }, [peer]);

  const sendMessage = useCallback((msg: WatchPartyMessage) => {
    connections.forEach((conn) => {
      if (conn.open) {
        conn.send(msg);
      }
    });
    setMessages((prev) => [...prev, msg]);
  }, [connections]);

  const broadcastSync = useCallback((currentTime: number, type: 'PLAY' | 'PAUSE' | 'SEEK') => {
    sendMessage({ type, currentTime });
  }, [sendMessage]);

  return {
    peerId,
    isConnected,
    connections,
    messages,
    isMicOn,
    toggleMic,
    remoteStreams,
    connectToHost,
    broadcastSync,
    onSyncRef,
    sendMessage
  };
}
