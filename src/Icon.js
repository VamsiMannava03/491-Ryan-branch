import React from 'react';
import { useDrag } from 'react-dnd';

const Icon = ({ icon }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'ICON',
    item: { id: icon.id, left: icon.left, top: icon.top },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <img 
      ref={drag}
      src={icon.src}
      alt={icon.alt}
      style={{
        position: 'absolute',
        left: icon.left,
        top: icon.top,
        width: '40px',
        height: '40px',
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move',
      }}
    />
  );
};

export default Icon;
