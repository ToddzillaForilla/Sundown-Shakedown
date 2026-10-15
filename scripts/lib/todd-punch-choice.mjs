// Cosmetic choice only; never changes combat timing or damage.
export function chooseToddPunch(random = Math.random) {
  return random() < 0.75 ? { arm: 'left', start: 0, end: 8 } : { arm: 'right', start: 9, end: 17 };
}
