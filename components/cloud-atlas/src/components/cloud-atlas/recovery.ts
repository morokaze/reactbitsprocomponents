import { gsap } from "gsap";
export function createWakeRecovery(
  onUpdate: () => void,
  onRest: () => void,
  now: () => number = () => performance.now(),
) {
  const state = { amount: 0 };
  let tween: gsap.core.Tween | undefined;
  let started = 0;
  let pausedAt: number | null = null;
  let running = false;
  return {
    state,
    strike() {
      tween?.kill();
      state.amount = 1;
      started = now();
      pausedAt = null;
      running = true;
      tween = gsap.to(state, {
        amount: 0,
        duration: 3.2,
        ease: "power1.in",
        paused: true,
        onUpdate,
      });
      onUpdate();
    },
    advance() {
      if (!running || pausedAt !== null) return;
      const elapsed = Math.max(0, (now() - started - 60) / 1000);
      tween?.totalTime(Math.min(3.2, elapsed), false);
      if (elapsed >= 3.2) {
        state.amount = 0;
        running = false;
        tween?.kill();
        onRest();
        onUpdate();
      }
    },
    pause(value: boolean) {
      if (value && pausedAt === null) pausedAt = now();
      else if (!value && pausedAt !== null) {
        started += now() - pausedAt;
        pausedAt = null;
      }
    },
    kill() {
      running = false;
      tween?.kill();
    },
  };
}
