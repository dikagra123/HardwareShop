import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export default function AnimatedCounter({
  value = 0,
  prefix = '',
  suffix = '',
}) {
  const counterRef = useRef(null);

  useEffect(() => {
    if (!counterRef.current) return;

    const safeValue =
      typeof value === 'number'
        ? value
        : parseFloat(
            String(value || 0).replace(/[^0-9.]/g, '')
          ) || 0;

    const counterObj = { val: 0 };

    gsap.fromTo(
      counterObj,
      {
        val: 0,
      },
      {
        val: safeValue,
        duration: 2,
        ease: 'power2.out',
        onUpdate: () => {
          if (counterRef.current) {
            counterRef.current.textContent =
              prefix +
              Math.round(counterObj.val).toLocaleString(
                'en-IN'
              ) +
              suffix;
          }
        },
      }
    );
  }, [value, prefix, suffix]);

  return (
    <span ref={counterRef}>
      {prefix}0{suffix}
    </span>
  );
}