/**
 * Interview Room — Countdown timer
 */
(function (global) {
  const IR = global.IR || (global.IR = {});
  IR.timer = {
    intervalId: null,
    start(dur, tick, done) {
      this.clear();
      IR.state.timeLeft = dur;
      tick(dur);
      this.intervalId = setInterval(() => {
        IR.state.timeLeft--;
        tick(IR.state.timeLeft);
        if (IR.state.timeLeft <= 0) {
          this.clear();
          done();
        }
      }, 1000);
    },
    clear() {
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
    }
  };
})(typeof window !== 'undefined' ? window : this);
