import React, { useState } from 'react';

export const Counter: React.FC = () => {
  const [count, setCount] = useState(0);

  return (
    <div className="counter-card" id="counter">
      <h3 className="counter-title">Interactive State Counter</h3>
      <p className="counter-description">
        State management using React 19 <code>useState</code> with TypeScript type safety.
      </p>
      
      <div className="counter-display">
        <span className="counter-value">{count}</span>
      </div>

      <div className="counter-actions">
        <button 
          className="btn btn-secondary" 
          onClick={() => setCount((c) => c - 1)}
          aria-label="Decrement"
        >
          - Decrement
        </button>
        <button 
          className="btn btn-warning" 
          onClick={() => setCount(0)}
          aria-label="Reset"
        >
          Reset
        </button>
        <button 
          className="btn btn-primary" 
          onClick={() => setCount((c) => c + 1)}
          aria-label="Increment"
        >
          + Increment
        </button>
      </div>
    </div>
  );
};
