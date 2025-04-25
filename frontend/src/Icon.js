import React from 'react';
import { useDrag } from 'react-dnd';

const Icon = ({ icon }) => {
  const isPlaced = typeof icon.left === 'number' && typeof icon.top === 'number';

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'ICON',
    item: {
      id: icon.id,
      src: icon.src,
      alt: icon.alt,
      left: icon.left ?? 500,
      top: icon.top ?? 400
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [icon]);

  const style = isPlaced
    ? {
        position: 'absolute',
        left: icon.left,
        top: icon.top,
        width: '40px',
        height: '40px',
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move',
        pointerEvents: 'auto',
        zIndex: 2
      }
    : {
        width: '30px',
        height: '30px',
        opacity: isDragging ? 0.5 : 1,
        cursor: 'grab',
        pointerEvents: 'auto'
      };

  return (
    <img
      ref={drag}
      src={icon.src}
      alt={icon.alt}
      style={style}
      draggable={false}
    />
  );
};

export default Icon;
