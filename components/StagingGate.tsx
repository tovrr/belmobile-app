
import React from 'react';

interface StagingGateProps {
    children: React.ReactNode;
}

const StagingGate: React.FC<StagingGateProps> = ({ children }) => {
    // Explicitly disabled: Pass children through directly.
    return <>{children}</>;
};

export default StagingGate;
