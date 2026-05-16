import { gsap } from 'gsap';

// Page enter animation
export const pageEnter = (element) => {
  if (!element) return;

  gsap.fromTo(
    element,
    { opacity: 0, y: 30 },
    {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: 'power3.out'
    }
  );
};

// Stagger cards animation
export const staggerCards = (elements) => {
  if (!elements) return;

  const validElements = Array.from(elements).filter(Boolean);

  if (!validElements.length) return;

  gsap.fromTo(
    validElements,
    { opacity: 0, y: 40, scale: 0.95 },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.5,
      stagger: 0.1,
      ease: 'power3.out'
    }
  );
};

// Number counter animation
export const animateCounter = (element, target) => {
  if (!element) return;

  gsap.fromTo(
    { val: 0 },
    {
      val: target,
      duration: 1.5,
      ease: 'power2.out',
      onUpdate: function () {
        element.innerHTML = Math.round(
          this.targets()[0].val
        ).toLocaleString('en-IN');
      }
    }
  );
};

// Sidebar item hover
export const sidebarHover = (element) => {
  if (!element) return;

  gsap.to(element, {
    x: 6,
    duration: 0.2,
    ease: 'power2.out'
  });
};

export const sidebarHoverOut = (element) => {
  if (!element) return;

  gsap.to(element, {
    x: 0,
    duration: 0.2,
    ease: 'power2.out'
  });
};

// Button click ripple
export const buttonClick = (element) => {
  if (!element) return;

  gsap.timeline()
    .to(element, { scale: 0.95, duration: 0.1 })
    .to(element, {
      scale: 1,
      duration: 0.2,
      ease: 'back.out(2)'
    });
};

// Card hover 3D tilt
export const cardTilt = (element, e) => {
  if (!element || !e) return;

  const rect = element.getBoundingClientRect();

  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const centerX = rect.width / 2;
  const centerY = rect.height / 2;

  const rotateX = (y - centerY) / 10;
  const rotateY = (centerX - x) / 10;

  gsap.to(element, {
    rotateX,
    rotateY,
    scale: 1.03,
    duration: 0.3,
    ease: 'power2.out',
    transformPerspective: 800
  });
};

export const cardTiltReset = (element) => {
  if (!element) return;

  gsap.to(element, {
    rotateX: 0,
    rotateY: 0,
    scale: 1,
    duration: 0.5,
    ease: 'power3.out'
  });
};