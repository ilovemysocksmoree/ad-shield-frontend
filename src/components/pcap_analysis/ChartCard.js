import React from 'react';
import './ChartCard.css'; 

const ChartCard = ({ title, children, isSimple = false }) => {
  return (
    <div className={`chart-card ${isSimple ? 'simple-card' : ''}`}>
      <h4 className="chart-card-title">{title}</h4>
      <div className="chart-card-content">
        {children}
      </div>
    </div>
  );
};

export default ChartCard;