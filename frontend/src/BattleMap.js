import React, { useEffect } from 'react';
import { useDrop } from 'react-dnd';
import { io } from 'socket.io-client';
import Icon from './Icon';
import socket from './socket';




const BattleMap = ({ mapImage, icons, setIcons }) => {
  const room = window.location.pathname.split("/").pop(); // sessionId from URL

  const [, drop] = useDrop({
    accept: 'ICON',
    drop: (item, monitor) => {
      const delta = monitor.getDifferenceFromInitialOffset();
      if (!delta) return;

      const newLeft = Math.round(item.left + delta.x);
      const newTop = Math.round(item.top + delta.y);

      // 1. Update local position
      setIcons(prevIcons =>
        prevIcons.map(icon =>
          icon.id === item.id ? { ...icon, left: newLeft, top: newTop } : icon
        )
      );

      // 2. Emit icon move to others in room
      socket.emit("moveIcon", {
        room,
        iconId: item.id,
        newPosition: { left: newLeft, top: newTop }
      });
    },
  });

  // 3. Listen for incoming icon movement
  useEffect(() => {
    socket.on("iconMoved", ({ iconId, newPosition }) => {
      setIcons(prevIcons =>
        prevIcons.map(icon =>
          icon.id === iconId ? { ...icon, ...newPosition } : icon
        )
      );
    });

    return () => {
      socket.off("iconMoved");
    };
  }, [setIcons]);

  return (
    <div
      ref={drop}
      style={{
        position: 'relative',
        width: '800px',
        height: '600px',
        backgroundSize: 'cover',
        border: '6px solid transparent',
        borderImage: 'linear-gradient(45deg, #999, #333) 1',
        overflow: 'hidden',
      }}
    >
      <img
        src={mapImage}
        alt="Battle Map"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
        }}
      />
      {icons.map(icon => (
        <Icon key={icon.id} icon={icon} />
      ))}
    </div>
  );
};

export default BattleMap;
