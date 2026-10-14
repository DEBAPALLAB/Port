/*
 * A JavaScript port of the Poker Gods rules engine, written for this page.
 * Source (TypeScript, D:\codings\poker-chips):
 *   src/lib/betting.ts       openRound, applyAction, optionsFor, RuleError
 *   src/lib/sidePots.ts      computeSidePots, splitPot, uncalledRefunds
 *   src/components/settlement.ts   computeTransfers
 *   src/lib/handEngine.ts    blinds, dealer seat
 *   scripts/verify-betting-rules.ts   the randomized simulation (same seed, same generator)
 * The logic is the same; only the type annotations are gone.
 */

export class RuleError extends Error {
  constructor(message, status = 400) { super(message); this.status = status; }
}

export function optionsFor(round, playerId) {
  const me = round.seats.find(s => s.id === playerId);
  if (!me || me.status !== 'ACTIVE') return null;
  const toCall = Math.max(0, round.currentBet - me.roundCommitted);
  const maxRaiseTo = me.roundCommitted + me.stack;
  const canRaise = me.canRaise && me.stack > toCall;
  return { toCall, canCheck: toCall === 0, minRaiseTo: Math.min(round.currentBet + round.minRaise, maxRaiseTo), maxRaiseTo, canRaise };
}

function nextActiveSeat(seats, fromSeat, exceptId) {
  const active = seats.filter(s => s.status === 'ACTIVE' && s.id !== exceptId).map(s => s.seat).sort((a, b) => a - b);
  if (active.length === 0) return null;
  return active.find(s => s > fromSeat) ?? active[0];
}

export function openRound(seats, firstSeat, currentBet, minRaise, pot) {
  const live = seats.map(s => ({ ...s, canRaise: true }));
  const actors = live.filter(s => s.status === 'ACTIVE');
  const owesCall = actors.some(s => s.roundCommitted < currentBet);
  const base = { seats: live, currentBet, minRaise, pot, actsRemaining: actors.length, turnSeat: null };
  if (actors.length === 0 || (actors.length === 1 && !owesCall)) return { kind: 'round-complete', round: { ...base, actsRemaining: 0 } };
  const sortedActive = actors.map(s => s.seat).sort((a, b) => a - b);
  const turnSeat = sortedActive.find(s => s >= firstSeat) ?? sortedActive[0];
  return { kind: 'continue', round: { ...base, turnSeat } };
}

export function applyAction(round, playerId, action) {
  const me = round.seats.find(s => s.id === playerId);
  if (!me || me.status !== 'ACTIVE') throw new RuleError("You're not in this hand", 409);
  if (round.turnSeat !== me.seat) throw new RuleError("It's not your turn", 403);

  const opts = optionsFor(round, playerId);
  const seats = round.seats.map(s => ({ ...s }));
  const actor = seats.find(s => s.id === playerId);
  let { currentBet, minRaise, pot } = round;
  let reopens = false;

  const commit = amount => {
    actor.stack -= amount; actor.roundCommitted += amount; actor.totalCommitted += amount; pot += amount;
    if (actor.stack === 0) actor.status = 'ALL_IN';
  };
  const raiseTo = to => {
    if (!opts.canRaise) {
      throw new RuleError(opts.maxRaiseTo <= round.currentBet || actor.stack <= opts.toCall
        ? "You don't have enough chips to raise" : "Betting wasn't reopened — you can only call or fold");
    }
    const target = Math.min(to, opts.maxRaiseTo);
    if (target <= round.currentBet) throw new RuleError('Raise must be higher than the current bet');
    const isAllIn = target === opts.maxRaiseTo;
    if (target < round.currentBet + round.minRaise && !isAllIn) throw new RuleError(`Minimum raise is to ${round.currentBet + round.minRaise}`);
    const increment = target - round.currentBet;
    commit(target - actor.roundCommitted);
    if (increment >= round.minRaise) {
      minRaise = increment;
      for (const s of seats) if (s.id !== actor.id) s.canRaise = true;
    }
    currentBet = target;
    reopens = true;
  };

  if (action.action === 'fold') actor.status = 'FOLDED';
  else if (action.action === 'check') { if (opts.toCall > 0) throw new RuleError("Can't check — there's a bet to call"); }
  else if (action.action === 'call') commit(Math.min(opts.toCall, actor.stack));
  else if (action.action === 'raise') raiseTo(action.to);
  else if (opts.maxRaiseTo > round.currentBet) raiseTo(opts.maxRaiseTo);
  else commit(actor.stack);

  if (action.action !== 'fold') actor.canRaise = false;

  const stillIn = seats.filter(s => s.status !== 'FOLDED');
  const next = { seats, currentBet, minRaise, pot, actsRemaining: round.actsRemaining, turnSeat: round.turnSeat };
  if (stillIn.length === 1) return { kind: 'folded-out', round: { ...next, actsRemaining: 0, turnSeat: null }, winnerId: stillIn[0].id };

  if (reopens) next.actsRemaining = seats.filter(s => s.status === 'ACTIVE' && s.id !== actor.id).length;
  else next.actsRemaining = round.actsRemaining - 1;

  const nextSeat = nextActiveSeat(seats, actor.seat, actor.id);
  if (next.actsRemaining <= 0 || nextSeat === null) return { kind: 'round-complete', round: { ...next, actsRemaining: 0, turnSeat: null } };
  return { kind: 'continue', round: { ...next, turnSeat: nextSeat } };
}

/* ---- src/lib/sidePots.ts ---- */

export function computeSidePots(contributions) {
  const withMoney = contributions.filter(c => c.totalCommitted > 0);
  if (withMoney.length === 0) return [];
  const tiers = [...new Set(withMoney.map(c => c.totalCommitted))].sort((a, b) => a - b);
  const pots = [];
  let prevTier = 0, tierIndex = 0;
  for (const tier of tiers) {
    let amount = 0;
    for (const c of withMoney) amount += Math.max(0, Math.min(c.totalCommitted, tier) - prevTier);
    const eligiblePlayerIds = withMoney.filter(c => !c.folded && c.totalCommitted >= tier).map(c => c.playerId);
    if (amount > 0 && eligiblePlayerIds.length > 0) { pots.push({ tierIndex, amount, eligiblePlayerIds, tier, from: prevTier }); tierIndex++; }
    prevTier = tier;
  }
  return pots;
}

export function splitPot(amount, winners, dealerSeat) {
  const ordered = [...winners].sort((a, b) => ((a.seat - dealerSeat - 1 + 1000) % 1000) - ((b.seat - dealerSeat - 1 + 1000) % 1000));
  const share = Math.floor(amount / ordered.length);
  const remainder = amount - share * ordered.length;
  return ordered.map((w, i) => ({ id: w.id, amount: share + (i < remainder ? 1 : 0) }));
}

export function uncalledRefunds(contributions) {
  const withMoney = contributions.filter(c => c.totalCommitted > 0);
  const topLive = Math.max(0, ...withMoney.filter(c => !c.folded).map(c => c.totalCommitted));
  return withMoney
    .map(c => ({ playerId: c.playerId, amount: Math.max(0, c.totalCommitted - Math.max(topLive, 0)) }))
    .filter(r => r.amount > 0);
}

/* ---- src/components/settlement.ts ---- */

export function computeTransfers(nets) {
  const debtors = nets.filter(n => n.net < 0).map(n => ({ id: n.id, left: -n.net }));
  const creditors = nets.filter(n => n.net > 0).map(n => ({ id: n.id, left: n.net }));
  const bySize = (a, b) => b.left - a.left || a.id.localeCompare(b.id);
  const transfers = [];
  while (debtors.length && creditors.length) {
    debtors.sort(bySize); creditors.sort(bySize);
    const debtor = debtors[0], creditor = creditors[0];
    const amount = Math.min(debtor.left, creditor.left);
    transfers.push({ from: debtor.id, to: creditor.id, amount });
    debtor.left -= amount; creditor.left -= amount;
    if (debtor.left === 0) debtors.shift();
    if (creditor.left === 0) creditors.shift();
  }
  return transfers;
}

// Not in the repo: the true minimum, to see how far "minimal-ish" is from minimal.
// Fewest transfers = (people with a balance) - (most groups that sum to zero on their own).
export function fewestTransfers(nets) {
  const values = nets.map(n => n.net).filter(Boolean);
  const n = values.length;
  if (n === 0) return 0;
  const size = 1 << n, sum = new Array(size).fill(0), best = new Array(size).fill(0);
  for (let mask = 1; mask < size; mask++) {
    const low = mask & -mask, index = 31 - Math.clz32(low);
    sum[mask] = sum[mask ^ low] + values[index];
  }
  for (let mask = 1; mask < size; mask++) {
    let top = 0;
    for (let sub = mask; sub; sub = (sub - 1) & mask) if (sum[sub] === 0) top = Math.max(top, 1 + best[mask ^ sub]);
    // a zero-sum group inside mask, then the rest
    best[mask] = top;
  }
  return n - best[size - 1];
}

/* ---- src/lib/handEngine.ts ---- */

export function seatOrderAfterDealer(players, dealerSeat) {
  const sorted = [...players].sort((a, b) => a.seatPosition - b.seatPosition);
  const dealerIdx = sorted.findIndex(p => p.seatPosition === dealerSeat);
  if (dealerIdx === -1) return sorted;
  return [...sorted.slice(dealerIdx + 1), ...sorted.slice(0, dealerIdx + 1)];
}

export function nextDealerSeat(players, previousDealerSeat) {
  const sorted = [...players].sort((a, b) => a.seatPosition - b.seatPosition);
  if (sorted.length === 0) return 0;
  if (previousDealerSeat === null) return sorted[0].seatPosition;
  const idx = sorted.findIndex(p => p.seatPosition > previousDealerSeat);
  return idx === -1 ? sorted[0].seatPosition : sorted[idx].seatPosition;
}

export function computeBlindsAndFirstTurn(players, dealerSeat, smallBlind, bigBlind) {
  const order = seatOrderAfterDealer(players, dealerSeat);
  if (order.length === 2) {
    const [bbPlayer, sbPlayer] = order;
    return { blinds: [{ playerId: sbPlayer.id, amount: Math.min(smallBlind, sbPlayer.stack) }, { playerId: bbPlayer.id, amount: Math.min(bigBlind, bbPlayer.stack) }], firstToActSeat: sbPlayer.seatPosition };
  }
  const sbPlayer = order[0], bbPlayer = order[1], firstToAct = order[2] ?? order[0];
  return { blinds: [{ playerId: sbPlayer.id, amount: Math.min(smallBlind, sbPlayer.stack) }, { playerId: bbPlayer.id, amount: Math.min(bigBlind, bbPlayer.stack) }], firstToActSeat: firstToAct.seatPosition };
}

/* ---- scripts/verify-betting-rules.ts: the randomized simulation, same seed and generator ---- */

function deal(specs, dealerSeat, sb, bb) {
  const { blinds, firstToActSeat } = computeBlindsAndFirstTurn(specs.map(s => ({ id: s.id, seatPosition: s.seat, stack: s.stack })), dealerSeat, sb, bb);
  const seats = specs.map(p => {
    const amount = blinds.find(b => b.playerId === p.id)?.amount ?? 0;
    return { id: p.id, seat: p.seat, stack: p.stack - amount, status: p.stack - amount === 0 ? 'ALL_IN' : 'ACTIVE', roundCommitted: amount, totalCommitted: amount, canRaise: true };
  });
  const pot = seats.reduce((n, s) => n + s.roundCommitted, 0);
  const o = openRound(seats, firstToActSeat, bb, bb, pot);
  return { round: o.round, kind: o.kind };
}

export function createSimulation(total = 20000, seedStart = 20261011) {
  let seed = seedStart;
  const rand = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 2 ** 32; };
  const pick = xs => xs[Math.floor(rand() * xs.length)];
  const randomAction = (round, id) => {
    const o = optionsFor(round, id), r = rand();
    if (o.toCall > 0) {
      if (r < 0.2) return { action: 'fold' };
      if (r < 0.65 || !o.canRaise) return { action: 'call' };
    } else if (r < 0.5 || !o.canRaise) return { action: 'check' };
    if (r > 0.93) return { action: 'all-in' };
    return { action: 'raise', to: o.minRaiseTo + Math.floor(rand() * (o.maxRaiseTo - o.minRaiseTo + 1)) };
  };

  const stats = { hands: 0, illegal: 0, stuck: 0, leaked: 0, potMismatch: 0, badTurn: 0, tooSmall: 0, actions: 0, foldedOut: 0, showdowns: 0, sidePotHands: 0, refundHands: 0, mostPots: 0 };
  const log = []; // per hand: 0 showdown, 1 showdown with side pots, 2 broke a check, 3 everyone folded

  function playHand() {
    const count = 2 + Math.floor(rand() * 8);
    const seatsUsed = [...Array(10).keys()].sort(() => rand() - 0.5).slice(0, count).sort((a, b) => a - b);
    const bb = pick([2, 10, 50]);
    const specs = seatsUsed.map((seat, i) => ({ id: `p${i}`, seat, stack: Math.max(1, Math.floor(rand() * rand() * bb * 100)) }));
    const chipsTotal = specs.reduce((x, s) => x + s.stack, 0);
    const dealer = nextDealerSeat(specs.map(s => ({ id: s.id, seatPosition: s.seat, stack: s.stack })), pick(seatsUsed));
    let { round, kind } = deal(specs, dealer, Math.max(1, Math.floor(bb / 2)), bb);
    const before = { ...stats };
    let street = 0, finished = false;
    while (!finished) {
      let guard = 0;
      while (kind === 'continue') {
        if (++guard > 400) { stats.stuck++; break; }
        const turn = round.seats.find(s => s.seat === round.turnSeat);
        if (!turn || turn.status !== 'ACTIVE') { stats.badTurn++; break; }
        const action = randomAction(round, turn.id);
        const prior = round;
        let o;
        try { o = applyAction(round, turn.id, action); } catch { stats.illegal++; break; }
        stats.actions++;
        if (action.action === 'raise') { const opts = optionsFor(prior, turn.id); if (action.to < opts.minRaiseTo) stats.tooSmall++; }
        round = o.round; kind = o.kind;
        const held = round.seats.reduce((x, s) => x + s.stack, 0) + round.pot;
        if (held !== chipsTotal) stats.leaked++;
        if (round.pot !== round.seats.reduce((x, s) => x + s.totalCommitted, 0)) stats.potMismatch++;
        if (kind === 'folded-out') finished = true;
      }
      if (finished || guard > 400 || kind === 'continue') break;
      street++;
      if (street > 3) break;
      const cleared = round.seats.map(s => ({ ...s, roundCommitted: 0 }));
      const sorted = cleared.filter(s => s.status === 'ACTIVE').map(s => s.seat).sort((a, b) => a - b);
      if (sorted.length < 2) continue;
      const first = sorted.find(s => s > dealer) ?? sorted[0];
      const o = openRound(cleared, first, 0, bb, round.pot);
      round = o.round; kind = o.kind;
    }
    const contribs = round.seats.map(s => ({ playerId: s.id, totalCommitted: s.totalCommitted, folded: s.status === 'FOLDED' }));
    const pots = computeSidePots(contribs), refunds = uncalledRefunds(contribs);
    const paidOut = pots.reduce((x, p) => x + p.amount, 0) + refunds.reduce((x, r) => x + r.amount, 0);
    if (paidOut !== round.pot) stats.potMismatch++;
    if (finished) stats.foldedOut++; else stats.showdowns++;
    if (pots.length > 1) stats.sidePotHands++;
    if (refunds.length) stats.refundHands++;
    stats.mostPots = Math.max(stats.mostPots, pots.length);
    stats.hands++;
    const broke = stats.illegal + stats.stuck + stats.leaked + stats.potMismatch + stats.badTurn + stats.tooSmall !== before.illegal + before.stuck + before.leaked + before.potMismatch + before.badTurn + before.tooSmall;
    log.push(broke ? 2 : finished ? 3 : pots.length > 1 ? 1 : 0);
  }

  return { stats, log, total, step(n) { const end = Math.min(total, stats.hands + n); while (stats.hands < end) playHand(); return stats.hands >= total; } };
}
