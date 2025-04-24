import React, { useEffect } from 'react';
import { useDrop } from 'react-dnd';
import socket from './socket';
import Icon from './Icon';

const BattleMap = ({ mapImage, icons, setIcons }) => {
  const room = window.location.pathname.split("/").pop();

  const [, drop] = useDrop({
    accept: 'ICON',
    drop: (item, monitor) => {
      const delta = monitor.getDifferenceFromInitialOffset();
      if (!delta) return;

      const newLeft = Math.round(item.left + delta.x);
      const newTop = Math.round(item.top + delta.y);

      setIcons(prev =>
        prev.map(icon =>
          icon.id === item.id ? { ...icon, left: newLeft, top: newTop } : icon
        )
      );

      socket.emit("moveIcon", {
        room,
        iconId: item.id,
        newPosition: { left: newLeft, top: newTop }
      });
    },
  });

  useEffect(() => {
    socket.on("iconMoved", ({ iconId, newPosition }) => {
      setIcons(prev =>
        prev.map(icon =>
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
        width: '100%',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      <img
        src={mapImage}
        alt="Battle Map"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          display: 'block',
        }}
      />
      {icons.map((icon) => (
        <Icon key={icon.id} icon={icon} />
      ))}
    </div>
  );
};

export default BattleMap;
