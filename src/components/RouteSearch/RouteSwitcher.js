import React from 'react';
import './RouteSwitcher.css';

const RouteSwitcher = (props) => {

  return (
    <div className="route-switcher">
        <img src="img/route-switch.svg" alt="route switcher" onClick={() => props.switchRoute()}></img>
    </div>
  )
}

export default RouteSwitcher;
