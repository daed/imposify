import React from "react";


const Donation = () => {
    const handleSupportClick = () => {
        window.open('https://ko-fi.com/erudyne', '_blank', 'noopener,noreferrer');
    };

    return (
      <div>
        <button onClick={handleSupportClick} style={{ backgroundColor: '#29abe0', color: 'white', padding: '10px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          Support Me on Ko-fi
        </button>
      </div>
    );
};

export default Donation;
