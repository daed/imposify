import React from "react";
import { COLORS, FONTS } from '../theme';

const Donation = () => {
    const handleSupportClick = () => {
        window.open('https://ko-fi.com/erudyne', '_blank', 'noopener,noreferrer');
    };

    return (
        <button
            onClick={handleSupportClick}
            style={{
                fontFamily: FONTS.MONO,
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                backgroundColor: COLORS.pink,
                color: COLORS.paper,
                padding: '10px 16px',
                border: `2px solid ${COLORS.ink}`,
                cursor: 'pointer',
            }}
        >
            support on ko-fi
        </button>
    );
};

export default Donation;
