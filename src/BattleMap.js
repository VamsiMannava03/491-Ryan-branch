import React from 'react';
import { useDrop } from 'react-dnd';
import Icon from './Icon';

const BattleMap = ({ mapImage, icons, setIcons }) => {  //contains the map image and icons for movement
  const [, drop] = useDrop({
    accept: 'ICON',
    drop: (item, monitor) => {
      const delta = monitor.getDifferenceFromInitialOffset(); // math used for moving the icon on the map
      if (!delta) return;
      const newLeft = Math.round(item.left + delta.x);
      const newTop = Math.round(item.top + delta.y);
      
      setIcons(prevIcons =>                                 //update icons state with new position
        prevIcons.map(icon =>
          icon.id === item.id
            ? { ...icon, left: newLeft, top: newTop }
            : icon
        )
      );
    },
  });

  return (
    <div
      ref={drop} //This is used for the drop ref
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
      <img           //display battle map image
        src={mapImage}
        alt="Battle Map"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
        }}
      />
      {icons.map(icon => (         //rendering icons
        <Icon key={icon.id} icon={icon} />
      ))}
    </div>
  );
};

export default BattleMap;
