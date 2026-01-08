import { useSpring, animated } from 'react-spring';
import { useRef, useState } from 'react';

const useNeonBorder = (config = {}) => {
    const [isActive, setIsActive] = useState(false);

    const animationConfig = {
        size: 2,
        color: '#ff00cc',
        duration: 3000,
        ...config
    };

    const { size } = useSpring({
        from: { size: 0 },
        to: { size: isActive ? 100 : 0 },
        config: { duration: animationConfig.duration },
        loop: isActive
    });

    const trigger = () => setIsActive(true);
    const reset = () => setIsActive(false);

    const style = {
        boxShadow: size.to(s => `
      inset 0 0 0 ${animationConfig.size}px rgba(255, 0, 204, ${s/100}),
      0 0 ${s/10}px ${animationConfig.size}px ${animationConfig.color}
    `)
    };

    return [style, trigger, reset];
};

export default useNeonBorder;
